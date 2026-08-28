import { getValue, nextTick, toInt } from '../common';
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

const calcServicesCpuLinux = async (result: ServicesData[]) => {
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
};

type SystemdUnit = { name: string; running: boolean; startmode: string; lastChanged: Date | null; mainPid: number };

// 'Thu 2026-08-28 10:12:13 CEST' - systemd prints the host timezone, which node parses as local time as well
const systemdTimestamp = (value: string): Date | null => {
  const parts = value.match(/(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})(?: (\S+))?/);
  if (!parts) {
    return null;
  }
  const utc = parts[3] === 'UTC' || parts[3] === 'GMT';
  const date = new Date(`${parts[1]}T${parts[2]}${utc ? 'Z' : ''}`);
  return Number.isNaN(date.getTime()) ? null : date;
};

// systemd knows state and main PID of every unit - matching process names against ps output is unreliable (#818, #899)
const systemdUnits = async (): Promise<SystemdUnit[]> => {
  const units: SystemdUnit[] = [];
  // fixed arguments - all units are queried at once, requested names are matched in code (no shell interpolation)
  const stdout = await execSecure('systemctl', [
    'show',
    '--no-pager',
    '--property=Id',
    '--property=LoadState',
    '--property=ActiveState',
    '--property=UnitFileState',
    '--property=ActiveEnterTimestamp',
    '--property=ActiveExitTimestamp',
    '--property=MainPID',
    '*.service'
  ]);
  stdout.split(/\n\s*\n/).forEach((block: string) => {
    const lines = block.split('\n');
    const id = getValue(lines, 'Id', '=', false, true);
    if (id && getValue(lines, 'LoadState', '=', false, true) !== 'not-found') {
      const mainPid = toInt(getValue(lines, 'MainPID', '=', false, true));
      const activeState = getValue(lines, 'ActiveState', '=', false, true);
      // systemd state is the truth - 'active (exited)' oneshot units are running too, even without a process
      const running = activeState === 'active' || activeState === 'reloading';
      const enter = systemdTimestamp(getValue(lines, 'ActiveEnterTimestamp', '=', false, true));
      const exit = systemdTimestamp(getValue(lines, 'ActiveExitTimestamp', '=', false, true));
      units.push({
        name: id.replace(/\.service$/, ''),
        running,
        startmode: getValue(lines, 'UnitFileState', '=', false, true),
        // last state change: started when running, stopped otherwise (#886)
        lastChanged: (running ? enter || exit : exit || enter) || null,
        mainPid
      });
    }
  });
  return units;
};

// ps ELAPSED column: [[dd-]hh:]mm:ss - the oldest process of a service marks its start (#886)
const elapsedToDate = (elapsed: string): Date | null => {
  const parts = elapsed.split('-');
  const days = parts.length > 1 ? toInt(parts[0]) : 0;
  const time = (parts.length > 1 ? parts[1] : parts[0]).split(':');
  if (time.length < 2 || time.length > 3) {
    return null;
  }
  const seconds = time.reduce((total, part) => total * 60 + toInt(part), 0) + days * 86400;
  return seconds > 0 ? new Date(Date.now() - seconds * 1000) : null;
};

const psProcessesLinux = async () => {
  const procs: { pid: number; ppid: number; cpu: number; mem: number }[] = [];
  const stdout = await execSecure('ps', ['-axo', 'pcpu,pmem,pid,ppid']);
  stdout
    .replace(/ +/g, ' ')
    .replace(/,+/g, '.')
    .split('\n')
    .forEach((line: string) => {
      const parts = line.trim().split(' ');
      if (parts.length >= 4) {
        const pid = toInt(parts[2]);
        if (pid) {
          procs.push({ pid, ppid: toInt(parts[3]), cpu: parseFloat(parts[0]) || 0, mem: parseFloat(parts[1]) || 0 });
        }
      }
    });
  return procs;
};

const servicesFromSystemd = async (srvs: string[], units: SystemdUnit[]): Promise<ServicesData[]> => {
  const all = srvs.length === 1 && srvs[0] === '*';
  const matches = (unit: SystemdUnit) => {
    const name = unit.name.toLowerCase();
    return srvs.indexOf(name) >= 0 || srvs.indexOf(`${name}.service`) >= 0;
  };
  const selected = all ? units : units.filter(matches);

  const procs = await psProcessesLinux();
  const byPid: { [index: number]: { cpu: number; mem: number } } = {};
  const children: { [index: number]: number[] } = {};
  procs.forEach((proc) => {
    byPid[proc.pid] = { cpu: proc.cpu, mem: proc.mem };
    children[proc.ppid] = (children[proc.ppid] || []).concat(proc.pid);
  });

  const result: ServicesData[] = [];
  selected.forEach((unit) => {
    const pids: number[] = [];
    // main process plus its children - e.g. php-fpm workers, which carry a different process name
    const collect = (pid: number) => {
      pids.push(pid);
      (children[pid] || []).forEach(collect);
    };
    if (unit.mainPid && byPid[unit.mainPid]) {
      collect(unit.mainPid);
    }
    result.push({
      name: unit.name,
      running: unit.running,
      startmode: unit.startmode,
      lastChanged: unit.lastChanged,
      pids,
      cpu: parseFloat(pids.reduce((sum, pid) => sum + (byPid[pid] ? byPid[pid].cpu : 0), 0).toFixed(2)),
      mem: parseFloat(pids.reduce((sum, pid) => sum + (byPid[pid] ? byPid[pid].mem : 0), 0).toFixed(2))
    });
  });
  if (!all) {
    // requested services unknown to systemd
    srvs
      .filter((srv: string) => !selected.some((unit) => unit.name.toLowerCase() === srv || `${unit.name.toLowerCase()}.service` === srv))
      .forEach((srv: string) => {
        result.push({ name: srv, running: false, startmode: '', lastChanged: null, pids: [], cpu: 0, mem: 0 });
      });
  }
  await calcServicesCpuLinux(result);
  return result;
};

export const services = async (srv: string): Promise<ServicesData[]> => {
  await nextTick();
  const result: ServicesData[] = [];
  if (!isPrototypePolluted()) {
    let srvs = sanitizeServiceString(srv);

    if (LINUX) {
      try {
        const units = await systemdUnits();
        if (units.length) {
          return await servicesFromSystemd(srvs, units);
        }
      } catch {}
    }

    if (srvs.length === 1 && srvs[0] === '*') {
      srvs = DARWIN ? await darwinGetServices() : await nixGetServices();
    }
    let args = DARWIN ? ['-caxo', 'pcpu,pmem,pid,etime,command'] : ['-axo', 'pcpu,pmem,pid,etime,command'];
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
          let lastChanged: Date | null = null;
          for (const p of ps) {
            const parts = p.trim().split(' ');
            if (parts[2]) {
              pids.push(toInt(parts[2]));
              const started = elapsedToDate(parts[3] || '');
              if (started && (!lastChanged || started < lastChanged)) {
                lastChanged = started;
              }
            }
          }
          result.push({
            name: srv,
            running: ps.length > 0,
            startmode: '',
            lastChanged,
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
          await calcServicesCpuLinux(result);
        }
        return result;
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
              lastChanged: null,
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
              lastChanged: null,
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
