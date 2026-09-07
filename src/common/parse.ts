import { toInt } from './index';
import type { CpuData, ProcStatData } from './types';

export const parseProcStat = (line: string) => {
  const parts = line.replace(/ +/g, ' ').split(' ');
  const user = parts.length >= 2 ? toInt(parts[1]) : 0;
  const nice = parts.length >= 3 ? toInt(parts[2]) : 0;
  const system = parts.length >= 4 ? toInt(parts[3]) : 0;
  const idle = parts.length >= 5 ? toInt(parts[4]) : 0;
  const iowait = parts.length >= 6 ? toInt(parts[5]) : 0;
  const irq = parts.length >= 7 ? toInt(parts[6]) : 0;
  const softirq = parts.length >= 8 ? toInt(parts[7]) : 0;
  const steal = parts.length >= 9 ? toInt(parts[8]) : 0;
  const guest = parts.length >= 10 ? toInt(parts[9]) : 0;
  const guest_nice = parts.length >= 11 ? toInt(parts[10]) : 0;
  return user + nice + system + idle + iowait + irq + softirq + steal + guest + guest_nice;
};

// drops NaN/Infinity/negative values and scales cpuu + cpus down proportionally
// if their sum exceeds 100 (normalized against all cores)
export const clampCpuPair = (cpuu: number, cpus: number) => {
  if (!Number.isFinite(cpuu) || cpuu < 0) {
    cpuu = 0;
  }
  if (!Number.isFinite(cpus) || cpus < 0) {
    cpus = 0;
  }
  const total = cpuu + cpus;
  if (total > 100) {
    cpuu = (cpuu / total) * 100;
    cpus = (cpus / total) * 100;
  }
  return { cpuu, cpus };
};

export const calcProcStatLinux = (line: string, all: number, _cpu_old: CpuData): ProcStatData => {
  const statparts = line.replace(/ +/g, ' ').split(')');
  if (statparts.length >= 2) {
    const parts = statparts[1].split(' ');
    if (parts.length >= 16) {
      const pid = toInt(statparts[0].split(' ')[0]);
      const utime = toInt(parts[12]);
      const stime = toInt(parts[13]);
      // calc - child times (cutime/cstime) are deliberately left out: reaping a child adds its
      // whole lifetime in one interval, which is what produced the >100% spikes in #1007.
      // top, htop and Task Manager exclude them too.
      let cpuu = 0;
      let cpus = 0;
      if (_cpu_old.all > 0 && _cpu_old.list[pid]) {
        const delta = all - _cpu_old.all;
        cpuu = delta > 0 ? ((utime - _cpu_old.list[pid].utime) / delta) * 100 : 0; // user
        cpus = delta > 0 ? ((stime - _cpu_old.list[pid].stime) / delta) * 100 : 0; // system
      } else {
        cpuu = all > 0 ? (utime / all) * 100 : 0; // user
        cpus = all > 0 ? (stime / all) * 100 : 0; // system
      }
      // normalized against all cores, so 100 is the ceiling for cpuu + cpus
      const clamped = clampCpuPair(cpuu, cpus);
      return {
        pid: pid,
        name: '',
        utime: utime,
        stime: stime,
        cpuu: clamped.cpuu,
        cpus: clamped.cpus
      };
    }
  }
  return {
    pid: 0,
    name: '',
    utime: 0,
    stime: 0,
    cpuu: 0,
    cpus: 0
  };
};

export const parseJsonArray = (data: string): any[] => {
  try {
    const jsonData = JSON.parse(data);
    return Array.isArray(jsonData) ? jsonData : [jsonData];
  } catch (e) {
    return [];
  }
};

export const cleanDefaults = (str: string): string => {
  const cmpStr = str.toLowerCase();
  if (cmpStr.indexOf('o.e.m.') === -1 && cmpStr.indexOf('default string') === -1 && cmpStr !== 'default') {
    return str || '';
  }
  return '';
};

export const kFactor = (str: string): number => {
  return str.indexOf('K') !== -1 ? 1024 : 1;
};

export const splitByNumber = (str: string) => {
  let numberStarted = false;
  let num = '';
  let cpart = '';
  for (const c of str) {
    if ((c >= '0' && c <= '9') || numberStarted) {
      numberStarted = true;
      num += c;
    } else {
      cpart += c;
    }
  }
  return [cpart, num];
};
