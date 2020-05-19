'use strict';
// @ts-check
// ==================================================================================
// processes.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2020
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 10. Processes
// ----------------------------------------------------------------------------------

const os = require('os');
const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;
const execSync = require('child_process').execSync;

const util = require('./util');

let _platform = process.platform;

const _linux = (_platform === 'linux');
const _darwin = (_platform === 'darwin');
const _windows = (_platform === 'win32');
const _freebsd = (_platform === 'freebsd');
const _openbsd = (_platform === 'openbsd');
const _netbsd = (_platform === 'netbsd');
const _sunos = (_platform === 'sunos');

const _processes_cpu = {
  all: 0,
  list: {},
  ms: 0,
  result: {}
};
const _services_cpu = {
  all: 0,
  list: {},
  ms: 0,
  result: {}
};
const _process_cpu = {
  all: 0,
  list: {},
  ms: 0,
  result: {}
};

const _winStatusValues = {
  '0': 'unknown',
  '1': 'other',
  '2': 'ready',
  '3': 'running',
  '4': 'blocked',
  '5': 'suspended blocked',
  '6': 'suspended ready',
  '7': 'terminated',
  '8': 'stopped',
  '9': 'growing',
};


function parseTimeWin(time) {
  time = time || '';
  if (time) {
    return (time.substr(0, 4) + '-' + time.substr(4, 2) + '-' + time.substr(6, 2) + ' ' + time.substr(8, 2) + ':' + time.substr(10, 2) + ':' + time.substr(12, 2));
  } else {
    return '';
  }
}

function parseTimeUnix(time) {
  let result = time;
  let parts = time.replace(/ +/g, ' ').split(' ');
  if (parts.length === 5) {
    result = parts[4] + '-' + ('0' + ('JANFEBMARAPRMAYJUNJULAUGSEPOCTNOVDEC'.indexOf(parts[1].toUpperCase()) / 3 + 1)).slice(-2) + '-' + ('0' + parts[2]).slice(-2) + ' ' + parts[3];
  }
  return result;
}

// --------------------------
// PS - services
// pass a comma separated string with services to check (mysql, apache, postgresql, ...)
// this function gives an array back, if the services are running.

function services(srv, callback) {

  // fallback - if only callback is given
  if (util.isFunction(srv) && !callback) {
    callback = srv;
    srv = '';
  }

  return new Promise((resolve) => {
    process.nextTick(() => {
      if (srv) {
        let srvString = util.sanitizeShellString(srv);
        srvString = srvString.trim().toLowerCase().replace(/,+/g, ' ').replace(/  +/g, ' ').replace(/ +/g, '|');
        if (srvString === '') {
          srvString = '*';
        }
        let srvs = srvString.split('|');
        let result = [];
        let dataSrv = [];
        let allSrv = [];

        if (_linux || _freebsd || _openbsd || _netbsd || _darwin) {
          if ((_linux || _freebsd || _openbsd || _netbsd) && srvString === '*') {
            srvString = '';
            let tmpsrv = execSync('service --status-all 2> /dev/null').toString().split('\n');
            for (const s of tmpsrv) {
              const parts = s.split(']');
              if (parts.length === 2) {
                srvString += (srvString !== '' ? '|' : '') + parts[1].trim();
                allSrv.push({ name: parts[1].trim(), running: parts[0].indexOf('+') > 0 });
              }
            }
            srvs = srvString.split('|');
          }
          let comm = (_darwin) ? 'ps -caxo pcpu,pmem,pid,command' : 'ps -axo pcpu,pmem,pid,command';
          if (srvString !== '' && srvs.length > 0) {
            exec(comm + ' | grep -v grep | grep -iE "' + srvString + '"', { maxBuffer: 1024 * 20000 }, function (error, stdout) {
              if (!error) {
                let lines = stdout.toString().replace(/ +/g, ' ').replace(/,+/g, '.').split('\n');
                srvs.forEach(function (srv) {
                  let ps;
                  if (_darwin) {
                    ps = lines.filter(function (e) {
                      return (e.toLowerCase().indexOf(srv) !== -1);
                    });

                  } else {
                    ps = lines.filter(function (e) {
                      return (e.toLowerCase().indexOf(' ' + srv + ':') !== -1) || (e.toLowerCase().indexOf('/' + srv) !== -1);
                    });
                  }
                  let singleSrv = allSrv.filter(item => { return item.name === srv; });
                  const pids = [];
                  for (const p of ps) {
                    const pid = p.trim().split(' ')[2];
                    if (pid) {
                      pids.push(parseInt(pid, 10));
                    }
                  }
                  result.push({
                    name: srv,
                    running: (allSrv.length && singleSrv.length ? singleSrv[0].running : ps.length > 0),
                    startmode: '',
                    pids: pids,
                    pcpu: parseFloat((ps.reduce(function (pv, cv) {
                      return pv + parseFloat(cv.trim().split(' ')[0]);
                    }, 0)).toFixed(2)),
                    pmem: parseFloat((ps.reduce(function (pv, cv) {
                      return pv + parseFloat(cv.trim().split(' ')[1]);
                    }, 0)).toFixed(2))
                  });
                });
                if (_linux) {
                  // calc process_cpu - ps is not accurate in linux!
                  let cmd = 'cat /proc/stat | grep "cpu "';
                  for (let i in result) {
                    for (let j in result[i].pids) {
                      cmd += (';cat /proc/' + result[i].pids[j] + '/stat');
                    }
                  }
                  exec(cmd, { maxBuffer: 1024 * 20000 }, function (error, stdout) {
                    let curr_processes = stdout.toString().split('\n');

                    // first line (all - /proc/stat)
                    let all = parseProcStat(curr_processes.shift());

                    // process
                    let list_new = {};
                    let resultProcess = {};
                    for (let i = 0; i < curr_processes.length; i++) {
                      resultProcess = calcProcStatLinux(curr_processes[i], all, _services_cpu);

                      if (resultProcess.pid) {
                        let listPos = -1;
                        for (let i in result) {
                          for (let j in result[i].pids) {
                            if (parseInt(result[i].pids[j]) === parseInt(resultProcess.pid)) {
                              listPos = i;
                            }
                          }
                        }
                        if (listPos >= 0) {
                          result[listPos].pcpu += resultProcess.pcpuu + resultProcess.pcpus;
                        }

                        // save new values
                        list_new[resultProcess.pid] = {
                          pcpuu: resultProcess.pcpuu,
                          pcpus: resultProcess.pcpus,
                          utime: resultProcess.utime,
                          stime: resultProcess.stime,
                          cutime: resultProcess.cutime,
                          cstime: resultProcess.cstime
                        };
                      }
                    }

                    // store old values
                    _services_cpu.all = all;
                    // _services_cpu.list = list_new;
                    _services_cpu.list = Object.assign({}, list_new);
                    _services_cpu.ms = Date.now() - _services_cpu.ms;
                    // _services_cpu.result = result;
                    _services_cpu.result = Object.assign({}, result);
                    if (callback) { callback(result); }
                    resolve(result);
                  });
                } else {
                  if (callback) { callback(result); }
                  resolve(result);
                }
              } else {
                exec('ps -o comm | grep -v grep | egrep "' + srvString + '"', { maxBuffer: 1024 * 20000 }, function (error, stdout) {
                  if (!error) {
                    let lines = stdout.toString().replace(/ +/g, ' ').replace(/,+/g, '.').split('\n');
                    srvs.forEach(function (srv) {
                      let ps = lines.filter(function (e) {
                        return e.indexOf(srv) !== -1;
                      });
                      result.push({
                        name: srv,
                        running: ps.length > 0,
                        startmode: '',
                        pcpu: 0,
                        pmem: 0
                      });
                    });
                    if (callback) { callback(result); }
                    resolve(result);
                  } else {
                    srvs.forEach(function (srv) {
                      result.push({
                        name: srv,
                        running: false,
                        startmode: '',
                        pcpu: 0,
                        pmem: 0
                      });
                    });
                    if (callback) { callback(result); }
                    resolve(result);
                  }
                });
              }
            });
          } else {
            if (callback) { callback(result); }
            resolve(result);
          }
        }
        if (_windows) {
          try {
            util.wmic('service get /value').then((stdout, error) => {
              if (!error) {
                let serviceSections = stdout.split(/\n\s*\n/);
                for (let i = 0; i < serviceSections.length; i++) {
                  if (serviceSections[i].trim() !== '') {
                    let lines = serviceSections[i].trim().split('\r\n');
                    let srvName = util.getValue(lines, 'Name', '=', true).toLowerCase();
                    let started = util.getValue(lines, 'Started', '=', true);
                    let startMode = util.getValue(lines, 'StartMode', '=', true);
                    let pid = util.getValue(lines, 'ProcessId', '=', true);
                    if (srvString === '*' || srvs.indexOf(srvName) >= 0) {
                      result.push({
                        name: srvName,
                        running: (started === 'TRUE'),
                        startmode: startMode,
                        pids: [pid],
                        pcpu: 0,
                        pmem: 0
                      });
                      dataSrv.push(srvName);
                    }
                  }
                }
                if (srvString !== '*') {
                  let srvsMissing = srvs.filter(function (e) {
                    return dataSrv.indexOf(e) === -1;
                  });
                  srvsMissing.forEach(function (srvName) {
                    result.push({
                      name: srvName,
                      running: false,
                      startmode: '',
                      pids: [],
                      pcpu: 0,
                      pmem: 0
                    });
                  });
                }
                if (callback) { callback(result); }
                resolve(result);
              } else {
                srvs.forEach(function (srvName) {
                  result.push({
                    name: srvName,
                    running: false,
                    startmode: '',
                    pcpu: 0,
                    pmem: 0
                  });
                });
                if (callback) { callback(result); }
                resolve(result);
              }
            });
          } catch (e) {
            if (callback) { callback(result); }
            resolve(result);
          }
        }
      } else {
        if (callback) { callback({}); }
        resolve({});
      }
    });
  });
}

exports.services = services;

function parseProcStat(line) {
  let parts = line.replace(/ +/g, ' ').split(' ');
  let user = (parts.length >= 2 ? parseInt(parts[1]) : 0);
  let nice = (parts.length >= 3 ? parseInt(parts[2]) : 0);
  let system = (parts.length >= 4 ? parseInt(parts[3]) : 0);
  let idle = (parts.length >= 5 ? parseInt(parts[4]) : 0);
  let iowait = (parts.length >= 6 ? parseInt(parts[5]) : 0);
  let irq = (parts.length >= 7 ? parseInt(parts[6]) : 0);
  let softirq = (parts.length >= 8 ? parseInt(parts[7]) : 0);
  let steal = (parts.length >= 9 ? parseInt(parts[8]) : 0);
  let guest = (parts.length >= 10 ? parseInt(parts[9]) : 0);
  let guest_nice = (parts.length >= 11 ? parseInt(parts[10]) : 0);
  return user + nice + system + idle + iowait + irq + softirq + steal + guest + guest_nice;
}

function calcProcStatLinux(line, all, _cpu_old) {
  let statparts = line.replace(/ +/g, ' ').split(')');
  if (statparts.length >= 2) {
    let parts = statparts[1].split(' ');
    if (parts.length >= 16) {
      let pid = parseInt(statparts[0].split(' ')[0]);
      let utime = parseInt(parts[12]);
      let stime = parseInt(parts[13]);
      let cutime = parseInt(parts[14]);
      let cstime = parseInt(parts[15]);

      // calc
      let pcpuu = 0;
      let pcpus = 0;
      if (_cpu_old.all > 0 && _cpu_old.list[pid]) {
        pcpuu = (utime + cutime - _cpu_old.list[pid].utime - _cpu_old.list[pid].cutime) / (all - _cpu_old.all) * 100; // user
        pcpus = (stime + cstime - _cpu_old.list[pid].stime - _cpu_old.list[pid].cstime) / (all - _cpu_old.all) * 100; // system
      } else {
        pcpuu = (utime + cutime) / (all) * 100; // user
        pcpus = (stime + cstime) / (all) * 100; // system
      }
      return {
        pid: pid,
        utime: utime,
        stime: stime,
        cutime: cutime,
        cstime: cstime,
        pcpuu: pcpuu,
        pcpus: pcpus
      };
    } else {
      return {
        pid: 0,
        utime: 0,
        stime: 0,
        cutime: 0,
        cstime: 0,
        pcpuu: 0,
        pcpus: 0
      };
    }
  } else {
    return {
      pid: 0,
      utime: 0,
      stime: 0,
      cutime: 0,
      cstime: 0,
      pcpuu: 0,
      pcpus: 0
    };
  }
}

function calcProcStatWin(procStat, all, _cpu_old) {
  // calc
  let pcpuu = 0;
  let pcpus = 0;
  if (_cpu_old.all > 0 && _cpu_old.list[procStat.pid]) {
    pcpuu = (procStat.utime - _cpu_old.list[procStat.pid].utime) / (all - _cpu_old.all) * 100; // user
    pcpus = (procStat.stime - _cpu_old.list[procStat.pid].stime) / (all - _cpu_old.all) * 100; // system
  } else {
    pcpuu = (procStat.utime) / (all) * 100; // user
    pcpus = (procStat.stime) / (all) * 100; // system
  }
  return {
    pid: procStat.pid,
    utime: procStat.utime,
    stime: procStat.stime,
    pcpuu: pcpuu,
    pcpus: pcpus
  };
}



// --------------------------
// running processes

function processes(callback) {

  let parsedhead = [];

  function getName(command) {
    command = command || '';
    let result = command.split(' ')[0];
    if (result.substr(-1) === ':') {
      result = result.substr(0, result.length - 1);
    }
    if (result.substr(0, 1) !== '[') {
      let parts = result.split('/');
      if (isNaN(parseInt(parts[parts.length - 1]))) {
        result = parts[parts.length - 1];
      } else {
        result = parts[0];
      }
    }
    return result;
  }

  function parseLine(line) {

    let offset = 0;
    let offset2 = 0;

    function checkColumn(i) {
      offset = offset2;
      offset2 = line.substring(parsedhead[i].to + offset, 1000).indexOf(' ');
    }

    checkColumn(0);
    const pid = parseInt(line.substring(parsedhead[0].from + offset, parsedhead[0].to + offset2));
    checkColumn(1);
    const ppid = parseInt(line.substring(parsedhead[1].from + offset, parsedhead[1].to + offset2));
    checkColumn(2);
    const pcpu = parseFloat(line.substring(parsedhead[2].from + offset, parsedhead[2].to + offset2).replace(/,/g, '.'));
    checkColumn(3);
    const pmem = parseFloat(line.substring(parsedhead[3].from + offset, parsedhead[3].to + offset2).replace(/,/g, '.'));
    checkColumn(4);
    const priority = parseInt(line.substring(parsedhead[4].from + offset, parsedhead[4].to + offset2));
    checkColumn(5);
    const vsz = parseInt(line.substring(parsedhead[5].from + offset, parsedhead[5].to + offset2));
    checkColumn(6);
    const rss = parseInt(line.substring(parsedhead[6].from + offset, parsedhead[6].to + offset2));
    checkColumn(7);
    const nice = parseInt(line.substring(parsedhead[7].from + offset, parsedhead[7].to + offset2)) || 0;
    checkColumn(8);
    const started = parseTimeUnix(line.substring(parsedhead[8].from + offset, parsedhead[8].to + offset2).trim());
    checkColumn(9);
    let state = line.substring(parsedhead[9].from + offset, parsedhead[9].to + offset2).trim();
    state = (state[0] === 'R' ? 'running' : (state[0] === 'S' ? 'sleeping' : (state[0] === 'T' ? 'stopped' : (state[0] === 'W' ? 'paging' : (state[0] === 'X' ? 'dead' : (state[0] === 'Z' ? 'zombie' : ((state[0] === 'D' || state[0] === 'U') ? 'blocked' : 'unknown')))))));
    checkColumn(10);
    let tty = line.substring(parsedhead[10].from + offset, parsedhead[10].to + offset2).trim();
    if (tty === '?' || tty === '??') tty = '';
    checkColumn(11);
    const user = line.substring(parsedhead[11].from + offset, parsedhead[11].to + offset2).trim();
    checkColumn(12);
    const fullcommand = line.substring(parsedhead[12].from + offset, parsedhead[12].to + offset2).trim().replace(/\[/g, '').replace(/]/g, '');
    let cmdPath = '';
    let command = '';
    let params = '';
    // try to figure out where parameter starts
    let firstParamPos = fullcommand.indexOf(' -');
    let firstParamPathPos = fullcommand.indexOf(' /');
    firstParamPos = (firstParamPos >= 0 ? firstParamPos : 10000);
    firstParamPathPos = (firstParamPathPos >= 0 ? firstParamPathPos : 10000);
    const firstPos = Math.min(firstParamPos, firstParamPathPos);
    let tmpCommand = fullcommand.substr(0, firstPos);
    const tmpParams = fullcommand.substr(firstPos);
    const lastSlashPos = tmpCommand.lastIndexOf('/');
    if (lastSlashPos >= 0) {
      cmdPath = tmpCommand.substr(0, lastSlashPos);
      tmpCommand = tmpCommand.substr(lastSlashPos + 1);
    }

    if (firstPos === 10000 && tmpCommand.indexOf(' ') > -1) {
      const parts = tmpCommand.split(' ');
      if (fs.existsSync(path.join(cmdPath, parts[0]))) {
        command = parts.shift();
        params = (parts.join(' ') + ' ' + tmpParams).trim();
      } else {
        command = tmpCommand.trim();
        params = tmpParams.trim();
      }
    } else {
      command = tmpCommand.trim();
      params = tmpParams.trim();
    }

    return ({
      pid: pid,
      parentPid: ppid,
      name: _linux ? getName(command) : command,
      pcpu: pcpu,
      pcpuu: 0,
      pcpus: 0,
      pmem: pmem,
      priority: priority,
      mem_vsz: vsz,
      mem_rss: rss,
      nice: nice,
      started: started,
      state: state,
      tty: tty,
      user: user,
      command: command,
      params: params,
      path: cmdPath
    });
  }

  function parseProcesses(lines) {
    let result = [];
    if (lines.length > 1) {
      let head = lines[0];
      parsedhead = util.parseHead(head, 8);
      lines.shift();
      lines.forEach(function (line) {
        if (line.trim() !== '') {
          result.push(parseLine(line));
        }
      });
    }
    return result;
  }
  function parseProcesses2(lines) {

    function formatDateTime(time) {
      const month = ('0' + (time.getMonth() + 1).toString()).substr(-2);
      const year = time.getFullYear().toString();
      const day = ('0' + time.getDay().toString()).substr(-2);
      const hours = time.getHours().toString();
      const mins = time.getMinutes().toString();
      const secs = ('0' + time.getSeconds().toString()).substr(-2);

      return (year + '-' + month + '-' + day + ' ' + hours + ':' + mins + ':' + secs);
    }

    let result = [];
    lines.forEach(function (line) {
      if (line.trim() !== '') {
        line = line.trim().replace(/ +/g, ' ').replace(/,+/g, '.');
        const parts = line.split(' ');
        const command = parts.slice(9).join(' ');
        const pmem = parseFloat((1.0 * parseInt(parts[3]) * 1024 / os.totalmem()).toFixed(1));
        const elapsed_parts = parts[5].split(':');
        const started = formatDateTime(new Date(Date.now() - (elapsed_parts.length > 1 ? (elapsed_parts[0] * 60 + elapsed_parts[1]) * 1000 : elapsed_parts[0] * 1000)));

        result.push({
          pid: parseInt(parts[0]),
          parentPid: parseInt(parts[1]),
          name: getName(command),
          pcpu: 0,
          pcpuu: 0,
          pcpus: 0,
          pmem: pmem,
          priority: 0,
          mem_vsz: parseInt(parts[2]),
          mem_rss: parseInt(parts[3]),
          nice: parseInt(parts[4]),
          started: started,
          state: (parts[6] === 'R' ? 'running' : (parts[6] === 'S' ? 'sleeping' : (parts[6] === 'T' ? 'stopped' : (parts[6] === 'W' ? 'paging' : (parts[6] === 'X' ? 'dead' : (parts[6] === 'Z' ? 'zombie' : ((parts[6] === 'D' || parts[6] === 'U') ? 'blocked' : 'unknown'))))))),
          tty: parts[7],
          user: parts[8],
          command: command
        });
      }
    });
    return result;
  }

  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = {
        all: 0,
        running: 0,
        blocked: 0,
        sleeping: 0,
        unknown: 0,
        list: []
      };

      let cmd = '';

      if ((_processes_cpu.ms && Date.now() - _processes_cpu.ms >= 500) || _processes_cpu.ms === 0) {
        if (_linux || _freebsd || _openbsd || _netbsd || _darwin || _sunos) {
          if (_linux) cmd = 'export LC_ALL=C; ps -axo pid:11,ppid:11,pcpu:6,pmem:6,pri:5,vsz:11,rss:11,ni:5,lstart:30,state:5,tty:15,user:20,command; unset LC_ALL';
          if (_freebsd || _openbsd || _netbsd) cmd = 'export LC_ALL=C; ps -axo pid,ppid,pcpu,pmem,pri,vsz,rss,ni,lstart,state,tty,user,command; unset LC_ALL';
          if (_darwin) cmd = 'export LC_ALL=C; ps -axo pid,ppid,pcpu,pmem,pri,vsz,rss,nice,lstart,state,tty,user,command -r; unset LC_ALL';
          if (_sunos) cmd = 'ps -Ao pid,ppid,pcpu,pmem,pri,vsz,rss,nice,stime,s,tty,user,comm';
          exec(cmd, { maxBuffer: 1024 * 20000 }, function (error, stdout) {
            if (!error) {
              result.list = (parseProcesses(stdout.toString().split('\n'))).slice();
              result.all = result.list.length;
              result.running = result.list.filter(function (e) {
                return e.state === 'running';
              }).length;
              result.blocked = result.list.filter(function (e) {
                return e.state === 'blocked';
              }).length;
              result.sleeping = result.list.filter(function (e) {
                return e.state === 'sleeping';
              }).length;

              if (_linux) {
                // calc process_cpu - ps is not accurate in linux!
                cmd = 'cat /proc/stat | grep "cpu "';
                for (let i = 0; i < result.list.length; i++) {
                  cmd += (';cat /proc/' + result.list[i].pid + '/stat');
                }
                exec(cmd, { maxBuffer: 1024 * 20000 }, function (error, stdout) {
                  let curr_processes = stdout.toString().split('\n');

                  // first line (all - /proc/stat)
                  let all = parseProcStat(curr_processes.shift());

                  // process
                  let list_new = {};
                  let resultProcess = {};
                  for (let i = 0; i < curr_processes.length; i++) {
                    resultProcess = calcProcStatLinux(curr_processes[i], all, _processes_cpu);

                    if (resultProcess.pid) {

                      // store pcpu in outer array
                      let listPos = result.list.map(function (e) { return e.pid; }).indexOf(resultProcess.pid);
                      if (listPos >= 0) {
                        result.list[listPos].pcpu = resultProcess.pcpuu + resultProcess.pcpus;
                        result.list[listPos].pcpuu = resultProcess.pcpuu;
                        result.list[listPos].pcpus = resultProcess.pcpus;
                      }

                      // save new values
                      list_new[resultProcess.pid] = {
                        pcpuu: resultProcess.pcpuu,
                        pcpus: resultProcess.pcpus,
                        utime: resultProcess.utime,
                        stime: resultProcess.stime,
                        cutime: resultProcess.cutime,
                        cstime: resultProcess.cstime
                      };
                    }
                  }

                  // store old values
                  _processes_cpu.all = all;
                  // _processes_cpu.list = list_new;
                  _processes_cpu.list = Object.assign({}, list_new);
                  _processes_cpu.ms = Date.now() - _processes_cpu.ms;
                  // _processes_cpu.result = result;
                  _processes_cpu.result = Object.assign({}, result);
                  if (callback) { callback(result); }
                  resolve(result);
                });
              } else {
                if (callback) { callback(result); }
                resolve(result);
              }
            } else {
              cmd = 'ps -o pid,ppid,vsz,rss,nice,etime,stat,tty,user,comm';
              if (_sunos) {
                cmd = 'ps -o pid,ppid,vsz,rss,nice,etime,s,tty,user,comm';
              }
              exec(cmd, { maxBuffer: 1024 * 20000 }, function (error, stdout) {
                if (!error) {
                  let lines = stdout.toString().split('\n');
                  lines.shift();

                  result.list = parseProcesses2(lines).slice();
                  result.all = result.list.length;
                  result.running = result.list.filter(function (e) {
                    return e.state === 'running';
                  }).length;
                  result.blocked = result.list.filter(function (e) {
                    return e.state === 'blocked';
                  }).length;
                  result.sleeping = result.list.filter(function (e) {
                    return e.state === 'sleeping';
                  }).length;
                  if (callback) { callback(result); }
                  resolve(result);
                } else {
                  if (callback) { callback(result); }
                  resolve(result);
                }
              });
            }
          });
        } else if (_windows) {
          try {
            util.wmic('process get /value').then((stdout, error) => {
              if (!error) {
                let processSections = stdout.split(/\n\s*\n/);
                let procs = [];
                let procStats = [];
                let list_new = {};
                let allcpuu = 0;
                let allcpus = 0;
                for (let i = 0; i < processSections.length; i++) {
                  if (processSections[i].trim() !== '') {
                    let lines = processSections[i].trim().split('\r\n');
                    let pid = parseInt(util.getValue(lines, 'ProcessId', '=', true), 10);
                    let parentPid = parseInt(util.getValue(lines, 'ParentProcessId', '=', true), 10);
                    let statusValue = util.getValue(lines, 'ExecutionState', '=');
                    let name = util.getValue(lines, 'Caption', '=', true);
                    let commandLine = util.getValue(lines, 'CommandLine', '=', true);
                    let commandPath = util.getValue(lines, 'ExecutablePath', '=', true);
                    let utime = parseInt(util.getValue(lines, 'UserModeTime', '=', true), 10);
                    let stime = parseInt(util.getValue(lines, 'KernelModeTime', '=', true), 10);
                    let mem = parseInt(util.getValue(lines, 'WorkingSetSize', '=', true), 10);
                    allcpuu = allcpuu + utime;
                    allcpus = allcpus + stime;
                    result.all++;
                    if (!statusValue) { result.unknown++; }
                    if (statusValue === '3') { result.running++; }
                    if (statusValue === '4' || statusValue === '5') { result.blocked++; }

                    procStats.push({
                      pid: pid,
                      utime: utime,
                      stime: stime,
                      pcpu: 0,
                      pcpuu: 0,
                      pcpus: 0,
                    });
                    procs.push({
                      pid: pid,
                      parentPid: parentPid,
                      name: name,
                      pcpu: 0,
                      pcpuu: 0,
                      pcpus: 0,
                      pmem: mem / os.totalmem() * 100,
                      priority: parseInt(util.getValue(lines, 'Priority', '=', true), 10),
                      mem_vsz: parseInt(util.getValue(lines, 'PageFileUsage', '=', true), 10),
                      mem_rss: Math.floor(parseInt(util.getValue(lines, 'WorkingSetSize', '=', true), 10) / 1024),
                      nice: 0,
                      started: parseTimeWin(util.getValue(lines, 'CreationDate', '=', true)),
                      state: (!statusValue ? _winStatusValues[0] : _winStatusValues[statusValue]),
                      tty: '',
                      user: '',
                      command: commandLine || name,
                      path: commandPath,
                      params: ''
                    });
                  }
                }
                result.sleeping = result.all - result.running - result.blocked - result.unknown;
                result.list = procs;
                for (let i = 0; i < procStats.length; i++) {
                  let resultProcess = calcProcStatWin(procStats[i], allcpuu + allcpus, _processes_cpu);

                  // store pcpu in outer array
                  let listPos = result.list.map(function (e) { return e.pid; }).indexOf(resultProcess.pid);
                  if (listPos >= 0) {
                    result.list[listPos].pcpu = resultProcess.pcpuu + resultProcess.pcpus;
                    result.list[listPos].pcpuu = resultProcess.pcpuu;
                    result.list[listPos].pcpus = resultProcess.pcpus;
                  }

                  // save new values
                  list_new[resultProcess.pid] = {
                    pcpuu: resultProcess.pcpuu,
                    pcpus: resultProcess.pcpus,
                    utime: resultProcess.utime,
                    stime: resultProcess.stime
                  };
                }
                // store old values
                _processes_cpu.all = allcpuu + allcpus;
                // _processes_cpu.list = list_new;
                _processes_cpu.list = Object.assign({}, list_new);
                _processes_cpu.ms = Date.now() - _processes_cpu.ms;
                // _processes_cpu.result = result;
                _processes_cpu.result = Object.assign({}, result);
              }
              if (callback) {
                callback(result);
              }
              resolve(result);
            });
          } catch (e) {
            if (callback) { callback(result); }
            resolve(result);
          }
        } else {
          if (callback) { callback(result); }
          resolve(result);
        }
      } else {
        if (callback) { callback(_processes_cpu.result); }
        resolve(_processes_cpu.result);
      }
    });
  });
}

exports.processes = processes;

// --------------------------
// PS - process load
// get detailed information about a certain process
// (PID, CPU-Usage %, Mem-Usage %)

function processLoad(proc, callback) {

  // fallback - if only callback is given
  if (util.isFunction(proc) && !callback) {
    callback = proc;
    proc = '';
  }

  return new Promise((resolve) => {
    process.nextTick(() => {
      const procSanitized = util.sanitizeShellString(proc);

      let result = {
        'proc': procSanitized,
        'pid': -1,
        'cpu': 0,
        'mem': 0
      };

      if (procSanitized) {
        if (_windows) {
          try {
            util.wmic('process get /value').then((stdout, error) => {
              if (!error) {
                let processSections = stdout.split(/\n\s*\n/);
                let procStats = [];
                let list_new = {};
                let allcpuu = 0;
                let allcpus = 0;
                for (let i = 0; i < processSections.length; i++) {
                  if (processSections[i].trim() !== '') {
                    let lines = processSections[i].trim().split('\r\n');
                    let pid = parseInt(util.getValue(lines, 'ProcessId', '=', true), 10);
                    let name = util.getValue(lines, 'Caption', '=', true);
                    let utime = parseInt(util.getValue(lines, 'UserModeTime', '=', true), 10);
                    let stime = parseInt(util.getValue(lines, 'KernelModeTime', '=', true), 10);
                    let mem = parseInt(util.getValue(lines, 'WorkingSetSize', '=', true), 10);
                    allcpuu = allcpuu + utime;
                    allcpus = allcpus + stime;

                    procStats.push({
                      pid: pid,
                      utime: utime,
                      stime: stime,
                      pcpu: 0,
                      pcpuu: 0,
                      pcpus: 0,
                    });
                    if (name.toLowerCase().indexOf(procSanitized.toLowerCase()) >= 0) {
                      if (result.pid === -1) {
                        result = {
                          proc: name,
                          pid: pid,
                          pids: [pid],
                          cpu: 0,
                          mem: mem / os.totalmem() * 100
                        };
                      } else {
                        result.pids.push(pid);
                        result.mem += mem / os.totalmem() * 100;
                      }
                    }
                  }
                }
                for (let i = 0; i < procStats.length; i++) {
                  let resultProcess = calcProcStatWin(procStats[i], allcpuu + allcpus, _process_cpu);

                  // store pcpu in outer array
                  if (result && result.pids && result.pids.length > 0) {
                    let listPos = result.pids.indexOf(resultProcess.pid);
                    if (listPos >= 0) {
                      result.cpu = resultProcess.pcpuu + resultProcess.pcpus;
                    }
                  }

                  // save new values
                  list_new[resultProcess.pid] = {
                    pcpuu: resultProcess.pcpuu,
                    pcpus: resultProcess.pcpus,
                    utime: resultProcess.utime,
                    stime: resultProcess.stime
                  };
                }
                // store old values
                _process_cpu.all = allcpuu + allcpus;
                // _process_cpu.list = list_new;
                _process_cpu.list = Object.assign({}, list_new);
                _process_cpu.ms = Date.now() - _process_cpu.ms;
                // _process_cpu.result = result;
                _process_cpu.result = Object.assign({}, result);
                if (callback) {
                  callback(result);
                }
                resolve(result);
              }
            });
          } catch (e) {
            if (callback) { callback(result); }
            resolve(result);
          }
        }

        if (_darwin || _linux) {
          exec('ps -axo pid,pcpu,pmem,comm | grep -i ' + procSanitized + ' | grep -v grep', { maxBuffer: 1024 * 20000 }, function (error, stdout) {
            if (!error) {
              let lines = stdout.toString().split('\n');

              let pid = 0;
              let pids = [];
              let cpu = 0;
              let mem = 0;

              lines.forEach(function (line) {
                let data = line.trim().replace(/ +/g, ' ').split(' ');
                if (data.length > 3) {
                  pid = (!pid ? parseInt(data[0]) : 0);
                  pids.push(parseInt(data[0], 10));
                  cpu = cpu + parseFloat(data[1].replace(',', '.'));
                  mem = mem + parseFloat(data[2].replace(',', '.'));
                }
              });

              result = {
                'proc': procSanitized,
                'pid': pid,
                'pids': pids,
                'cpu': parseFloat((cpu / lines.length).toFixed(2)),
                'mem': parseFloat((mem / lines.length).toFixed(2))
              };
              if (_linux) {
                // calc process_cpu - ps is not accurate in linux!
                let cmd = 'cat /proc/stat | grep "cpu "';
                for (let i = 0; i < result.pids.length; i++) {
                  cmd += (';cat /proc/' + result.pids[i] + '/stat');
                }

                exec(cmd, { maxBuffer: 1024 * 20000 }, function (error, stdout) {
                  let curr_processes = stdout.toString().split('\n');

                  // first line (all - /proc/stat)
                  let all = parseProcStat(curr_processes.shift());

                  // process
                  let list_new = {};
                  let resultProcess = {};
                  result.cpu = 0;
                  for (let i = 0; i < curr_processes.length; i++) {
                    resultProcess = calcProcStatLinux(curr_processes[i], all, _process_cpu);

                    if (resultProcess.pid) {

                      // store pcpu in outer result
                      result.cpu += resultProcess.pcpuu + resultProcess.pcpus;

                      // save new values
                      list_new[resultProcess.pid] = {
                        pcpuu: resultProcess.pcpuu,
                        pcpus: resultProcess.pcpus,
                        utime: resultProcess.utime,
                        stime: resultProcess.stime,
                        cutime: resultProcess.cutime,
                        cstime: resultProcess.cstime
                      };
                    }
                  }

                  result.cpu = Math.round(result.cpu * 100) / 100;

                  _process_cpu.all = all;
                  // _process_cpu.list = list_new;
                  _process_cpu.list = Object.assign({}, list_new);
                  _process_cpu.ms = Date.now() - _process_cpu.ms;
                  // _process_cpu.result = result;
                  _process_cpu.result = Object.assign({}, result);
                  if (callback) { callback(result); }
                  resolve(result);
                });
              } else {
                if (callback) { callback(result); }
                resolve(result);
              }
            } else {
              if (callback) { callback(result); }
              resolve(result);
            }
          });
        }
      }
    });
  });
}

exports.processLoad = processLoad;
