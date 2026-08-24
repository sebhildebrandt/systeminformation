import { nextTick, toInt } from '../common';
import { DARWIN, execOptsLinux, LINUX } from '../common/const';
import { exec, execSecure } from '../common/exec';
import { calcProcStatLinux, parseProcStat } from '../common/parse';
import { isPrototypePolluted, sanitizeServiceString, stringReplace, stringSplit, stringStartWith, stringSubstr, stringSubstring, stringToLower, stringToString, stringTrim } from '../common/security';
import { ServicesData } from '../common/types';

const _services_cpu = {
  all: 0,
  all_utime: 0,
  all_stime: 0,
  list: {},
  ms: 0,
  result: {}
};

const nixGetServices = async () => {
  let stdout = '';
  const srvs: string[] = [];
  try {
    ({ stdout } = await exec('systemctl --all --type=service --no-legend 2> /dev/null', execOptsLinux));
    const tmpsrv = stdout.split('\n');
    for (const s of tmpsrv) {
      const name = s.split('.service')[0];
      if (name && s.indexOf(' not-found ') === -1) {
        srvs.push(name.trim());
      }
    }
  } catch (d) {
    try {
      ({ stdout } = await exec('service --status-all 2> /dev/null', execOptsLinux));
      const tmpsrv = stdout.split('\n');
      for (const s of tmpsrv) {
        const parts = s.split(']');
        if (parts.length === 2) {
          srvs.push(parts[1].trim());
        }
      }
    } catch (e) {
      try {
        ({ stdout } = await exec('ls /etc/init.d/ -m 2> /dev/null', execOptsLinux));
        const srvStr = stdout.split('\n').join('');
        if (srvStr) {
          const tmpsrv = srvStr.split(',');
          for (const s of tmpsrv) {
            const name = s.trim();
            if (name) {
              srvs.push(name);
            }
          }
        }
      } catch {}
    }
  }
  return srvs;
};

const darwinGetServices = async () => {
  const srvs: string[] = [];
  try {
    const { stdout } = await exec('launchctl list', execOptsLinux);
    const tmpsrv = stdout.split('\n');
    tmpsrv.forEach((line: any) => {
      Object.setPrototypeOf(line, {
        replace: stringReplace,
        toLowerCase: stringToLower,
        toString: stringToString,
        substr: stringSubstr,
        substring: stringSubstring,
        trim: stringTrim,
        split: stringSplit,
        startsWith: stringStartWith
      });
      const parts = line.trim().replace(/\s+/g, ' ').split(' ');
      if (parts.length === 3) {
        srvs.push(parts[2]);
      }
    });
  } catch {}
  return srvs;
};

export const services = async (srv: string): Promise<ServicesData[]> => {
  await nextTick();
  const result: ServicesData[] = [];
  if (!isPrototypePolluted()) {
    let srvs = sanitizeServiceString(srv);

    if (srvs.length === 1 && srvs[0] === '*') {
      srvs = DARWIN ? await darwinGetServices() : await nixGetServices();
    }
    let args = DARWIN ? ['-caxo', 'pcpu,pmem,pid,command'] : ['-axo', 'pcpu,pmem,pid,command'];
    if (srvs.length > 0) {
      let stdout = await execSecure('ps', args);
      if (stdout) {
        const lines = stdout.replace(/ +/g, ' ').replace(/,+/g, '.').split('\n');
        srvs.forEach((srv: string) => {
          let ps;
          if (DARWIN) {
            ps = lines.filter(function (e) {
              return e.toLowerCase().indexOf(srv) !== -1;
            });
          } else {
            ps = lines.filter(function (e) {
              return (
                e.toLowerCase().indexOf(' ' + srv.toLowerCase() + ':') !== -1 ||
                e.toLowerCase().indexOf('(' + srv.toLowerCase() + ' ') !== -1 ||
                e.toLowerCase().indexOf('(' + srv.toLowerCase() + ')') !== -1 ||
                e.toLowerCase().indexOf(' ' + srv.toLowerCase().replace(/[0-9.]/g, '') + ':') !== -1 ||
                e.toLowerCase().indexOf('/' + srv.toLowerCase()) !== -1
              );
            });
          }
          const pids = [];
          for (const p of ps) {
            const pid = p.trim().split(' ')[2];
            if (pid) {
              pids.push(toInt(pid));
            }
          }
          result.push({
            name: srv,
            running: ps.length > 0,
            startmode: '',
            pids: pids,
            cpu: parseFloat(
              ps
                .reduce(function (pv, cv) {
                  return pv + parseFloat(cv.trim().split(' ')[0]);
                }, 0)
                .toFixed(2)
            ),
            mem: parseFloat(
              ps
                .reduce(function (pv, cv) {
                  return pv + parseFloat(cv.trim().split(' ')[1]);
                }, 0)
                .toFixed(2)
            )
          });
        });
        if (LINUX) {
          // calc process_cpu - ps is not accurate in linux!
          let cmd = 'cat /proc/stat | grep "cpu "';
          for (const i in result) {
            for (const j in result[i].pids) {
              cmd += ';cat /proc/' + result[i].pids[j] + '/stat';
            }
          }
          const { stdout } = await exec(cmd, execOptsLinux);
          let curr_processes = stdout.toString().split('\n');

          // first line (all - /proc/stat)
          const all = parseProcStat(curr_processes[0]);
          curr_processes = curr_processes.slice(1);

          // process
          const list_new: any = {};
          curr_processes.forEach((element) => {
            const resultProcess = calcProcStatLinux(element, all, _services_cpu);

            if (resultProcess.pid) {
              let listPos = -1;
              for (let i = 0; i < result.length; i++) {
                for (let j = 0; j < result[i].pids.length; j++) {
                  if (result[i].pids[j] === resultProcess.pid) {
                    listPos = i;
                  }
                }
              }
              if (listPos >= 0) {
                result[listPos].cpu += resultProcess.cpuu + resultProcess.cpus;
              }

              // save new values
              list_new[resultProcess.pid] = {
                cpuu: resultProcess.cpuu,
                cpus: resultProcess.cpus,
                utime: resultProcess.utime,
                stime: resultProcess.stime,
                cutime: resultProcess.cutime,
                cstime: resultProcess.cstime
              };
            }
          });

          // store old values
          _services_cpu.all = all;
          _services_cpu.list = Object.assign({}, list_new);
          _services_cpu.ms = Date.now();
          _services_cpu.result = Object.assign({}, result);

          return result;
        } else {
          return result;
        }
      } else {
        args = ['-o', 'comm'];
        stdout = await execSecure('ps', args);
        if (stdout) {
          const lines = stdout.replace(/ +/g, ' ').replace(/,+/g, '.').split('\n');
          srvs.forEach((srv: string) => {
            const ps = lines.filter((e: string) => {
              return e.indexOf(srv) !== -1;
            });
            result.push({
              name: srv,
              running: ps.length > 0,
              startmode: '',
              pids: [],
              cpu: 0,
              mem: 0
            });
          });
          return result;
        } else {
          srvs.forEach((srv: string) => {
            result.push({
              name: srv,
              running: false,
              startmode: '',
              pids: [],
              cpu: 0,
              mem: 0
            });
          });
          return result;
        }
      }
    }
  }
  return result;
};
