'use strict';
// ==================================================================================
// processes.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2017
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 10. Processes
// ----------------------------------------------------------------------------------

const os = require('os');
const exec = require('child_process').exec;
const fs = require('fs');
const util = require('./util');

let _platform = os.type();

const _linux = (_platform === 'Linux');
const _darwin = (_platform === 'Darwin');
const _windows = (_platform === 'Windows_NT');
const NOT_SUPPORTED = 'not supported';

let _process_cpu = {
  all: 0,
  list: {},
  ms: 0,
  result: {}
};

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

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) { callback(NOT_SUPPORTED) }
        reject(error);
      }

      srv = srv.trim().replace(/,+/g, " ").replace(/  +/g, " ").replace(/ +/g, "|");
      let srvs = srv.split('|');
      let comm = (_darwin) ? "ps -caxm -o pcpu,pmem,comm" : "ps axo pcpu,pmem,comm";
      let data = [];
      if (srv !== '' && srvs.length > 0) {
        exec(comm + " | grep -v grep | egrep '" + srv + "'", function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().replace(/ +/g, " ").replace(/,+/g, ".").split('\n');
            srvs.forEach(function (srv) {
              let ps = lines.filter(function (e) {
                return e.indexOf(srv) !== -1
              });
              data.push({
                'name': srv,
                'running': ps.length > 0,
                'pcpu': parseFloat((ps.reduce(function (pv, cv) {
                  return pv + parseFloat(cv.trim().split(' ')[0]);
                }, 0)).toFixed(2)),
                'pmem': parseFloat((ps.reduce(function (pv, cv) {
                  return pv + parseFloat(cv.trim().split(' ')[1]);
                }, 0)).toFixed(2))
              })
            });
            if (callback) { callback(data) }
            resolve(data);
          } else {
            srvs.forEach(function (srv) {
              data.push({
                'name': srv,
                'running': false,
                'pcpu': 0,
                'pmem': 0
              })
            });
            if (callback) { callback(data) }
            resolve(data);
          }
        });
      } else {
        if (callback) { callback(data) }
        resolve(data);
      }
    });
  });
}

exports.services = services;

// --------------------------
// running processes

function processes(callback) {

  let parsedhead = [];

  function parseHead(head, rights) {
    let space = (rights > 0);
    let count = 1;
    let from = 0;
    let to = 0;
    let result = [];
    for (let i = 0; i < head.length; i++) {
      if (count <= rights) {
        if (head[i] === ' ' && !space) {
          to = i - 1;
          result.push({
            from: from,
            to: to + 1,
            cap: head.substring(from, to + 1)
          });
          from = to + 2;
          count++;
        }
        space = head[i] === ' ';
      } else {
        if (head[i] !== ' ' && space) {
          to = i - 1;
          if (from < to) {
            result.push({
              from: from,
              to: to,
              cap: head.substring(from, to)
            });
          }
          from = to + 1;
          count++;
        }
        space = head[i] === ' ';
      }
    }
    to = 1000;
    result.push({
      from: from,
      to: to,
      cap: head.substring(from, to)
    });
    return result;

  }

  function parseLine(line) {
    let offset = 0;
    let offset2 = 0;

    function checkColumn(i) {
      offset = offset2;
      offset2 = line.substring(parsedhead[i].to + offset, 1000).indexOf(' ')
//      if (line.substring(parsedhead[i].to + offset, parsedhead[i].to + offset + 1) !== ' ') {
//        offset2++;
//      }
    }

    checkColumn(0);
    let pid = parseInt(line.substring(parsedhead[0].from + offset, parsedhead[0].to + offset2));
    checkColumn(1);
    let pcpu = parseFloat(line.substring(parsedhead[1].from + offset, parsedhead[1].to + offset2).replace(/,/g, "."));
    checkColumn(2);
    let pmem = parseFloat(line.substring(parsedhead[2].from + offset, parsedhead[2].to + offset2).replace(/,/g, "."));
    checkColumn(3);
    let priority = parseInt(line.substring(parsedhead[3].from + offset, parsedhead[3].to + offset2));
    checkColumn(4);
    let vsz = parseInt(line.substring(parsedhead[4].from + offset, parsedhead[4].to + offset2));
    checkColumn(5);
    let rss = parseInt(line.substring(parsedhead[5].from + offset, parsedhead[5].to + offset2));
    checkColumn(6);
    let nice = parseInt(line.substring(parsedhead[6].from + offset, parsedhead[6].to + offset2));
    checkColumn(7);
    let started = line.substring(parsedhead[7].from + offset, parsedhead[7].to + offset2).trim();
    checkColumn(8);
    let state = line.substring(parsedhead[8].from + offset, parsedhead[8].to + offset2).trim();
    state = (state[0] === 'R' ? 'running' : (state[0] === 'S' ? 'sleeping' : (state[0] === 'T' ? 'stopped' : (state[0] === 'W' ? 'paging' : (state[0] === 'X' ? 'dead' : (state[0] === 'Z' ? 'zombie' : ((state[0] === 'D' || state[0] === 'U') ? 'blocked' : 'unknown')))))));
    checkColumn(9);
    let tty = line.substring(parsedhead[9].from + offset, parsedhead[9].to + offset2).trim();
    if (tty === '?' || tty === '??') tty = '';
    checkColumn(10);
    let user = line.substring(parsedhead[10].from + offset, parsedhead[10].to + offset2).trim();
    checkColumn(11);
    let command = line.substring(parsedhead[11].from + offset, parsedhead[11].to + offset2).trim().replace(/\[/g, "").replace(/]/g, "");

    return ({
      pid: pid,
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
      command: command
    })
  }

  function parseProcesses(lines) {
    let result = [];
    if (lines.length > 1) {
      let head = lines[0];
      parsedhead = parseHead(head, 8);
      lines.shift();
      lines.forEach(function (line) {
        if (line.trim() !== '') {
          result.push(parseLine(line));
        }
      });
    }
    return result;
  }

  function parseProcStat(line) {
    let parts = line.replace(/ +/g, " ").split(' ');
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

  function parseProcPidStat(line, all) {
    let statparts = line.replace(/ +/g, " ").split(')');
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
        if (_process_cpu.all > 0 && _process_cpu.list[pid]) {
          pcpuu = (utime + cutime - _process_cpu.list[pid].utime - _process_cpu.list[pid].cutime) / (all - _process_cpu.all) * 100; // user
          pcpus = (stime + cstime - _process_cpu.list[pid].stime - _process_cpu.list[pid].cstime) / (all - _process_cpu.all) * 100; // system
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
        }
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
      }
    }
  }

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) { callback(NOT_SUPPORTED) }
        reject(error);
      }
      let result = {
        all: 0,
        running: 0,
        blocked: 0,
        sleeping: 0,
        list: []
      };

      let cmd = "";

      if ((_process_cpu.ms && Date.now() - _process_cpu.ms >= 500) || _process_cpu.ms === 0) {
        if (_linux) cmd = "ps axo pid:10,pcpu:6,pmem:6,pri:5,vsz:10,rss:10,ni:5,start:20,state:20,tty:20,user:20,command";
        if (_darwin) cmd = "ps acxo pid,pcpu,pmem,pri,vsz,rss,nice,start,state,tty,user,command -r";
        exec(cmd, function (error, stdout) {
          if (!error) {
            result.list = parseProcesses(stdout.toString().split('\n'));
            result.all = result.list.length;
            result.running = result.list.filter(function (e) {
              return e.state === 'running'
            }).length;
            result.blocked = result.list.filter(function (e) {
              return e.state === 'blocked'
            }).length;
            result.sleeping = result.list.filter(function (e) {
              return e.state === 'sleeping'
            }).length;

            if (_linux) {
              // calc process_cpu - ps is not accurate in linux!
              cmd = "cat /proc/stat | grep 'cpu '";
              for (let i = 0; i < result.list.length; i++) {
                cmd += (';cat /proc/' + result.list[i].pid + '/stat')
              }
              exec(cmd, function (error, stdout) {
                let curr_processes = stdout.toString().split('\n');

                // first line (all - /proc/stat)
                let all = parseProcStat(curr_processes.shift());

                // process
                let list_new = {};
                let resultProcess = {};
                for (let i = 0; i < curr_processes.length; i++) {
                  resultProcess = parseProcPidStat(curr_processes[i], all);

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
                    }
                  }
                }

                // store old values
                _process_cpu.all = all;
                _process_cpu.list = list_new;
                _process_cpu.ms = Date.now() - _process_cpu.ms;
                _process_cpu.result = result;
                if (callback) { callback(result) }
                resolve(result);
              })
            } else {
              if (callback) { callback(result) }
              resolve(result);
            }
          }
        });
      } else {
        if (callback) { callback(_process_cpu.result) }
        resolve(_process_cpu.result);
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

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) { callback(NOT_SUPPORTED) }
        reject(error);
      }

      let result = {
        'proc': proc,
        'pid': -1,
        'cpu': 0,
        'mem': 0
      };

      if (proc) {
        exec("ps aux | grep " + proc + " | grep -v grep", function (error, stdout) {
          if (!error) {
            let data = stdout.replace(/ +/g, " ").split(' ');

            if (data.length > 2) {
              result = {
                'proc': proc,
                'pid': data[1],
                'cpu': parseFloat(data[2].replace(',', '.')),
                'mem': parseFloat(data[3].replace(',', '.'))
              }
            }
          }
          if (callback) { callback(result) }
          resolve(result);
        });
      } else {
        if (callback) { callback(result) }
        resolve(result);
      }
    });
  });
}

exports.processLoad = processLoad;



