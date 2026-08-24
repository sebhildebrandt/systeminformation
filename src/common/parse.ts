import { toInt } from './index';
import type { CpuData, ProcStatData } from './types';

export type headerType = {
  from: number;
  to: number;
  cap: string;
};

export const parseHead = (head: string, rights: number): headerType[] => {
  let space = rights > 0;
  let count = 1;
  let from = 0;
  let to = 0;
  const result: headerType[] = [];
  for (let i = 0; i < head.length; i++) {
    if (count <= rights) {
      if (/\s/.test(head[i]) && !space) {
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
      if (!/\s/.test(head[i]) && space) {
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
  to = 5000;
  result.push({
    from: from,
    to: to,
    cap: head.substring(from, to)
  });
  let len = result.length;
  for (let i = 0; i < len; i++) {
    if (result[i].cap.replace(/\s/g, '').length === 0) {
      if (i + 1 < len) {
        result[i].to = result[i + 1].to;
        result[i].cap = result[i].cap + result[i + 1].cap;
        result.splice(i + 1, 1);
        len = len - 1;
      }
    }
  }
  return result;
};

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

export const calcProcStatLinux = (line: string, all: number, _cpu_old: CpuData): ProcStatData => {
  const statparts = line.replace(/ +/g, ' ').split(')');
  if (statparts.length >= 2) {
    const parts = statparts[1].split(' ');
    if (parts.length >= 16) {
      const pid = toInt(statparts[0].split(' ')[0]);
      const utime = toInt(parts[12]);
      const stime = toInt(parts[13]);
      const cutime = toInt(parts[14]);
      const cstime = toInt(parts[15]);

      // calc
      let cpuu = 0;
      let cpus = 0;
      if (_cpu_old.all > 0 && _cpu_old.list[pid]) {
        cpuu = ((utime + cutime - _cpu_old.list[pid].utime - _cpu_old.list[pid].cutime) / (all - _cpu_old.all)) * 100; // user
        cpus = ((stime + cstime - _cpu_old.list[pid].stime - _cpu_old.list[pid].cstime) / (all - _cpu_old.all)) * 100; // system
      } else {
        cpuu = ((utime + cutime) / all) * 100; // user
        cpus = ((stime + cstime) / all) * 100; // system
      }
      return {
        pid: pid,
        name: '',
        utime: utime,
        stime: stime,
        cutime: cutime,
        cstime: cstime,
        cpuu: cpuu,
        cpus: cpus
      };
    }
  }
  return {
    pid: 0,
    name: '',
    utime: 0,
    stime: 0,
    cutime: 0,
    cstime: 0,
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
