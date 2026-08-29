import { totalmem } from 'node:os';
import { cloneObj, nextTick } from '../common';
import { initProcesses } from '../common/defaults';
import { winProcessStatus } from '../common/mappings';
import type { CpuData, ProcessesData, ProcessesProcessData, ProcStatData } from '../common/types';
import { ps, psArray } from '../common/windows';

const _processes_cpu = {
  all: 0,
  all_utime: 0,
  all_stime: 0,
  list: <any>{},
  ms: 0,
  result: <ProcessesData>{}
};

export const calcProcStatWin = (procStat: ProcStatData, all: number, _cpu_old: CpuData) => {
  // calc
  let cpuu = 0;
  let cpus = 0;
  if (_cpu_old.all > 0 && _cpu_old.list[procStat.pid]) {
    const delta = all - _cpu_old.all;
    cpuu = delta > 0 ? ((procStat.utime - _cpu_old.list[procStat.pid].utime) / delta) * 100 : 0; // user
    cpus = delta > 0 ? ((procStat.stime - _cpu_old.list[procStat.pid].stime) / delta) * 100 : 0; // system
  } else {
    cpuu = all > 0 ? (procStat.utime / all) * 100 : 0; // user
    cpus = all > 0 ? (procStat.stime / all) * 100 : 0; // system
  }
  return {
    pid: procStat.pid,
    utime: procStat.utime,
    stime: procStat.stime,
    cpuu: cpuu > 0 ? cpuu : 0,
    cpus: cpus > 0 ? cpus : 0
  };
};

export const processes = async (): Promise<ProcessesData> => {
  await nextTick();
  const result: ProcessesData = cloneObj(initProcesses);
  if ((_processes_cpu.ms && Date.now() - _processes_cpu.ms >= 500) || _processes_cpu.ms === 0) {
    try {
      const processArray: any[] = psArray(
        await ps.exec(
          `Get-CimInstance Win32_Process | select-Object ProcessId,ParentProcessId,ExecutionState,Caption,CommandLine,ExecutablePath,UserModeTime,KernelModeTime,WorkingSetSize,Priority,PageFileUsage,
        @{n="CreationDate";e={$_.CreationDate.ToString("yyyy-MM-dd HH:mm:ss")}} | ConvertTo-Json -compress`
        )
      );
      if (processArray.length) {
        const procs: ProcessesProcessData[] = [];
        const procStats: ProcStatData[] = [];
        const list_new: any = {};
        // accumulate from the previous totals and add deltas only - a process that exited
        // must not lower the total, otherwise the denominator turns negative (#559)
        let allcpuu = _processes_cpu.all_utime;
        let allcpus = _processes_cpu.all_stime;
        processArray.forEach((element) => {
          const pid = element.ProcessId;
          const parentPid = element.ParentProcessId;
          const statusValue = element.ExecutionState || null;
          const name = element.Caption;
          const commandLine = element.CommandLine;
          // get additional command line data
          const commandPath = element.ExecutablePath;
          const utime = element.UserModeTime;
          const stime = element.KernelModeTime;
          const memw = element.WorkingSetSize;

          const cpuOld = _processes_cpu.list[pid];
          allcpuu += utime - (cpuOld ? cpuOld.utime : 0);
          allcpus += stime - (cpuOld ? cpuOld.stime : 0);
          result.all++;
          if (!statusValue) {
            result.unknown++;
          }
          if (statusValue === 3) {
            result.running++;
          }
          if (statusValue === 4 || statusValue === 5) {
            result.blocked++;
          }

          procStats.push({
            pid: pid,
            name: '',
            utime: utime,
            stime: stime,
            cpu: 0,
            cpuu: 0,
            cpus: 0
          });
          procs.push({
            pid: pid,
            parentPid: parentPid,
            name: name,
            cpu: 0,
            cpuu: 0,
            cpus: 0,
            mem: (memw / totalmem()) * 100,
            priority: element.Priority || 0,
            memVsz: element.PageFileUsage || null,
            memRss: Math.floor((element.WorkingSetSize || 0) / 1024),
            nice: 0,
            started: element.CreationDate,
            state: statusValue ? winProcessStatus[statusValue] : winProcessStatus[0],
            tty: '',
            user: '',
            command: commandLine || name,
            path: commandPath,
            params: ''
          });
        });
        result.sleeping = result.all - result.running - result.blocked - result.unknown;
        result.list = procs;
        procStats.forEach((element) => {
          const resultProcess = calcProcStatWin(element, allcpuu + allcpus, _processes_cpu);

          // store pcpu in outer array
          const listPos = result.list
            .map((e) => {
              return e.pid;
            })
            .indexOf(resultProcess.pid);
          if (listPos >= 0) {
            result.list[listPos].cpu = resultProcess.cpuu + resultProcess.cpus;
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
        });
        // store old values
        _processes_cpu.all = allcpuu + allcpus;
        _processes_cpu.all_utime = allcpuu;
        _processes_cpu.all_stime = allcpus;
        _processes_cpu.list = Object.assign({}, list_new);
        _processes_cpu.ms = Date.now();
        _processes_cpu.result = Object.assign({}, result);
      }
      return result;
    } catch {}
    return result;
  } else {
    return _processes_cpu.result;
  }
};
