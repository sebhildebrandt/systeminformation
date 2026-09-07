import { totalmem } from 'node:os';
import { join } from 'node:path';
import { nextTick, toInt } from '../common';
import { ANDROID, DARWIN, execOptsLinux, FREEBSD, LINUX, NETBSD, OPENBSD, SUNOS } from '../common/const';
import { parseElapsedTime, parseTimeUnix } from '../common/datetime';
import { initProcesses } from '../common/defaults';
import { exec } from '../common/exec';
import { fileExists, readProcStats } from '../common/files';
import { cloneObj } from '../common/index';
import { calcProcStatLinux, parseProcStat } from '../common/parse';
import type { ProcessesData, ProcessesProcessData, ProcStatData } from '../common/types';

const _processes_cpu = {
  all: 0,
  all_utime: 0,
  all_stime: 0,
  list: {},
  ms: 0,
  result: <ProcessesData>{}
};

const getName = (command: string) => {
  command = command || '';
  let result = command.split(' ')[0];
  if (result.endsWith(':')) {
    result = result.substring(0, result.length - 1);
  }
  if (!result.startsWith('[')) {
    const parts = result.split('/');
    if (isNaN(toInt(parts[parts.length - 1]))) {
      result = parts[parts.length - 1];
    } else {
      result = parts[0];
    }
  }
  return result;
};

// ps pads its columns with spaces and none of the fields ahead of the command contains one,
// so split those off from the left and keep the untouched remainder as the command. The
// previous header-offset parser mis-assigned columns as soon as a value was wider than its
// header - a user name longer than the USER column shifted the command field into the
// neighbouring column.
const splitPsLine = (line: string, count: number) => {
  const fields: string[] = [];
  let pos = 0;
  while (fields.length < count) {
    while (pos < line.length && line[pos] === ' ') {
      pos++;
    }
    const start = pos;
    while (pos < line.length && line[pos] !== ' ') {
      pos++;
    }
    if (pos === start) {
      return null;
    }
    fields.push(line.substring(start, pos));
  }
  while (pos < line.length && line[pos] === ' ') {
    pos++;
  }
  return { fields, rest: line.substring(pos) };
};

// accumulated cpu time as ps prints it: [[DD-]HH:]MM:SS[.ss] - linux uses HH:MM:SS,
// darwin and the BSDs MM:SS.ss with unbounded minutes, SunOS MM:SS
const parseCpuTime = (value: string) => {
  const dayParts = value.split('-');
  const days = dayParts.length > 1 ? toInt(dayParts[0]) : 0;
  const parts = dayParts[dayParts.length - 1].split(':');
  if (parts.length < 2 || parts.length > 3) {
    return null;
  }
  const seconds = parseFloat(parts[parts.length - 1]);
  if (Number.isNaN(seconds)) {
    return null;
  }
  const minutes = toInt(parts[parts.length - 2]);
  const hours = parts.length === 3 ? toInt(parts[0]) : 0;
  return days * 86400 + hours * 3600 + minutes * 60 + seconds;
};

const parseLine = async (line: string): Promise<ProcessesProcessData | null> => {
  // 13 fields ahead of the command, the last one being the accumulated cpu time
  const split = splitPsLine(line, 13);
  if (!split) {
    return null;
  }
  const [pidValue, ppidValue, cpuValue, memValue, priValue, vszValue, rssValue, niceValue, timeValue, stateValue, ttyValue, user] = split.fields;
  const pid = toInt(pidValue);
  if (!pid) {
    return null;
  }
  const ppid = toInt(ppidValue);
  const cpu = parseFloat(cpuValue.replace(/,/g, '.'));
  const mem = parseFloat(memValue.replace(/,/g, '.'));
  const priority = toInt(priValue);
  const vsz = toInt(vszValue);
  const rss = toInt(rssValue);
  const nice = toInt(niceValue) || 0;
  const started = !SUNOS ? parseElapsedTime(timeValue) : parseTimeUnix(timeValue);
  const state =
    stateValue[0] === 'R'
      ? 'running'
      : stateValue[0] === 'S'
        ? 'sleeping'
        : stateValue[0] === 'T'
          ? 'stopped'
          : stateValue[0] === 'W'
            ? 'paging'
            : stateValue[0] === 'X'
              ? 'dead'
              : stateValue[0] === 'Z'
                ? 'zombie'
                : stateValue[0] === 'D' || stateValue[0] === 'U'
                  ? 'blocked'
                  : 'unknown';
  const tty = ttyValue === '?' || ttyValue === '??' ? '' : ttyValue;
  const cpuTime = parseCpuTime(split.fields[12]);

  let cmdPath = '';
  let command = '';
  let params = '';
  let fullcommand = split.rest.trim();
  // zombies are printed as "[name] <defunct>" - drop the marker so the bracket handling below
  // sees a plain "[name]" and does not leak "] <defunct>" into command and name
  if (fullcommand.endsWith(' <defunct>')) {
    fullcommand = fullcommand.slice(0, -10).trim();
  }
  if (fullcommand.endsWith(']')) {
    fullcommand = fullcommand.slice(0, -1);
  }
  if (fullcommand.startsWith('[')) {
    command = fullcommand.substring(1);
  } else {
    const p1 = fullcommand.indexOf('(');
    const p2 = fullcommand.indexOf(')');
    const p3 = fullcommand.indexOf('/');
    const p4 = fullcommand.indexOf(':');
    if (p1 < p2 && p1 < p3 && p3 < p2) {
      command = fullcommand.split(' ')[0];
      command = command.replace(/:/g, '');
    } else {
      if (p4 > 0 && (p3 === -1 || p3 > 3)) {
        command = fullcommand.split(' ')[0];
        command = command.replace(/:/g, '');
      } else {
        // try to figure out where parameter starts
        let firstParamPos = fullcommand.indexOf(' -');
        let firstParamPathPos = fullcommand.indexOf(' /');
        firstParamPos = firstParamPos >= 0 ? firstParamPos : 10000;
        firstParamPathPos = firstParamPathPos >= 0 ? firstParamPathPos : 10000;
        const firstPos = Math.min(firstParamPos, firstParamPathPos);
        let tmpCommand = fullcommand.substring(0, firstPos);
        const tmpParams = fullcommand.substring(firstPos);
        const lastSlashPos = tmpCommand.lastIndexOf('/');
        if (lastSlashPos >= 0) {
          cmdPath = tmpCommand.substring(0, lastSlashPos);
          tmpCommand = tmpCommand.substring(lastSlashPos + 1);
        }

        if (firstPos === 10000 && tmpCommand.indexOf(' ') > -1) {
          const parts = tmpCommand.split(' ');
          if (await fileExists(join(cmdPath, parts[0]))) {
            command = parts.shift() || '';
            params = (parts.join(' ') + ' ' + tmpParams).trim();
          } else {
            command = tmpCommand.trim();
            params = tmpParams.trim();
          }
        } else {
          command = tmpCommand.trim();
          params = tmpParams.trim();
        }
      }
    }
  }

  return {
    pid: pid,
    parentPid: ppid,
    name: LINUX ? getName(command) : command,
    cpu: cpu,
    cpuu: 0,
    cpus: 0,
    cpuTime,
    mem: mem,
    priority: priority,
    memVsz: vsz,
    memRss: rss,
    nice: nice,
    started: started,
    state: state,
    tty: tty,
    user: user,
    command: command,
    params: params,
    path: cmdPath
  };
};

const parseProcesses = async (lines: string[]) => {
  const result: ProcessesProcessData[] = [];
  if (lines.length > 1) {
    lines = lines.splice(1);
    for (const line of lines) {
      if (line.trim() !== '') {
        const parsed = await parseLine(line);
        if (parsed) {
          result.push(parsed);
        }
      }
    }
  }
  return result;
};
const parseProcesses2 = (lines: string[]) => {
  function formatDateTime(time: Date) {
    const month = ('0' + (time.getMonth() + 1).toString()).slice(-2);
    const year = time.getFullYear().toString();
    const day = ('0' + time.getDate().toString()).slice(-2);
    const hours = ('0' + time.getHours().toString()).slice(-2);
    const mins = ('0' + time.getMinutes().toString()).slice(-2);
    const secs = ('0' + time.getSeconds().toString()).slice(-2);

    return year + '-' + month + '-' + day + ' ' + hours + ':' + mins + ':' + secs;
  }

  const parseElapsed = (etime: string) => {
    let started = '';
    if (etime.indexOf('d') >= 0) {
      const elapsed_parts = etime.split('d');
      started = formatDateTime(new Date(Date.now() - (toInt(elapsed_parts[0]) * 24 + toInt(elapsed_parts[1]) * 1) * 60 * 60 * 1000));
    } else if (etime.indexOf('h') >= 0) {
      const elapsed_parts = etime.split('h');
      started = formatDateTime(new Date(Date.now() - (toInt(elapsed_parts[0]) * 60 + toInt(elapsed_parts[1]) * 1) * 60 * 1000));
    } else if (etime.indexOf(':') >= 0) {
      const elapsed_parts = etime.split(':');
      started = formatDateTime(new Date(Date.now() - (elapsed_parts.length > 1 ? (toInt(elapsed_parts[0]) * 60 + toInt(elapsed_parts[1])) * 1000 : toInt(elapsed_parts[0]) * 1000)));
    }
    return started;
  };

  const result: ProcessesProcessData[] = [];
  lines.forEach((line) => {
    if (line.trim() !== '') {
      line = line.trim().replace(/ +/g, ' ').replace(/,+/g, '.');
      const parts = line.split(' ');
      const command = parts.slice(9).join(' ');
      const pmem = parseFloat(((1.0 * toInt(parts[3]) * 1024) / totalmem()).toFixed(1));
      const started = parseElapsed(parts[5]);

      result.push({
        pid: toInt(parts[0]),
        parentPid: toInt(parts[1]),
        name: getName(command),
        cpu: 0,
        cpuu: 0,
        cpus: 0,
        mem: pmem,
        priority: 0,
        memVsz: toInt(parts[2]),
        memRss: toInt(parts[3]),
        nice: toInt(parts[4]),
        started: started,
        state:
          parts[6] === 'R'
            ? 'running'
            : parts[6] === 'S'
              ? 'sleeping'
              : parts[6] === 'T'
                ? 'stopped'
                : parts[6] === 'W'
                  ? 'paging'
                  : parts[6] === 'X'
                    ? 'dead'
                    : parts[6] === 'Z'
                      ? 'zombie'
                      : parts[6] === 'D' || parts[6] === 'U'
                        ? 'blocked'
                        : 'unknown',
        tty: parts[7],
        user: parts[8],
        cpuTime: null,
        command: command,
        params: '',
        path: ''
      });
    }
  });
  return result;
};

export const processes = async (): Promise<ProcessesData> => {
  await nextTick();
  const result: ProcessesData = cloneObj(initProcesses);
  let cmd = '';
  let stdout = '';
  if ((_processes_cpu.ms && Date.now() - _processes_cpu.ms >= 500) || _processes_cpu.ms === 0) {
    try {
      if (LINUX || ANDROID) {
        cmd = 'export LC_ALL=C; ps -axo pid:11,ppid:11,pcpu:6,pmem:6,pri:5,vsz:11,rss:11,ni:5,etime:30,state:5,tty:15,user:20,time,command; unset LC_ALL';
      }
      if (FREEBSD || NETBSD || OPENBSD) {
        cmd = 'export LC_ALL=C; ps -axo pid,ppid,pcpu,pmem,pri,vsz,rss,ni,etime,state,tty,user,time,command; unset LC_ALL';
      }
      if (DARWIN) {
        cmd = 'ps -axo pid,ppid,pcpu,pmem,pri,vsz=temp_title_1,rss=temp_title_2,nice,etime=temp_title_3,state,tty,user,time,command -r';
      }
      if (SUNOS) {
        cmd = 'ps -Ao pid,ppid,pcpu,pmem,pri,vsz,rss,nice,stime,s,tty,user,time,comm';
      }
      ({ stdout } = await exec(cmd, execOptsLinux));
      if (stdout.trim()) {
        const lines = stdout.split('\n');
        result.list = (await parseProcesses(lines)).slice();
        result.all = result.list.length;
        result.running = result.list.filter((e) => e.state === 'running').length;
        result.blocked = result.list.filter((e) => e.state === 'blocked').length;
        result.sleeping = result.list.filter((e) => e.state === 'sleeping').length;

        if (LINUX) {
          // calc process_cpu - ps is not accurate in linux!
          // freeze the baseline before awaiting: a concurrent call overwrites _processes_cpu
          // and would leave this one dividing by a few jiffies (#1007)
          const cpuBaseline = { ..._processes_cpu };
          const stats = await readProcStats(result.list.map((element) => element.pid));
          const all = parseProcStat(stats.all);
          const curr_processes = stats.procs;

          // process
          const list_new: any = {};
          curr_processes.forEach((element) => {
            const resultProcess: ProcStatData = calcProcStatLinux(element, all, cpuBaseline);

            if (resultProcess.pid) {
              // store pcpu in outer array
              const listPos = result.list.map((e) => e.pid).indexOf(resultProcess.pid);
              if (listPos >= 0) {
                result.list[listPos].cpu = resultProcess.cpuu + resultProcess.cpus;
                // absolute cpu time of the process itself, in seconds (USER_HZ is 100 for the proc ABI)
                result.list[listPos].cpuTime = (resultProcess.utime + resultProcess.stime) / 100;
                result.list[listPos].cpuu = resultProcess.cpuu;
                result.list[listPos].cpus = resultProcess.cpus;
              }

              // save new values
              list_new[resultProcess.pid] = {
                cpuu: resultProcess.cpuu,
                cpus: resultProcess.cpus,
                utime: resultProcess.utime,
                stime: resultProcess.stime
              };
            }
          });

          // store old values
          _processes_cpu.all = all;
          _processes_cpu.list = Object.assign({}, list_new);
          _processes_cpu.ms = Date.now();
          _processes_cpu.result = Object.assign({}, result);
          return result;
        } else {
          return result;
        }
      }
    } catch {}
    try {
      cmd = 'ps -o pid,ppid,vsz,rss,nice,etime,stat,tty,user,comm';
      if (SUNOS) {
        cmd = 'ps -o pid,ppid,vsz,rss,nice,etime,s,tty,user,comm';
      }
      ({ stdout } = await exec(cmd, execOptsLinux));
      if (stdout.trim()) {
        const lines = stdout.toString().split('\n').splice(1);

        result.list = parseProcesses2(lines).slice();
        result.all = result.list.length;
        result.running = result.list.filter((e) => e.state === 'running').length;
        result.blocked = result.list.filter((e) => e.state === 'blocked').length;
        result.sleeping = result.list.filter((e) => e.state === 'sleeping').length;
        return result;
      } else {
        return result;
      }
    } catch {}
    return result;
  } else {
    return _processes_cpu.result;
  }
};
