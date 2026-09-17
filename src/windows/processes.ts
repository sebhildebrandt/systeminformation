import { totalmem } from 'node:os';
import { cloneObj, nextTick } from '../common';
import { initProcesses } from '../common/defaults';
import type { CpuData, ProcessesData, ProcessesProcessData, ProcStatData } from '../common/types';
import { ps, psArray } from '../common/windows';
import { clampCpuPair } from '../common/parse';

const _processes_cpu = {
  all: 0,
  all_utime: 0,
  all_stime: 0,
  list: <any>{},
  ms: 0,
  result: <ProcessesData>{}
};

// Win32_Process.ExecutionState is documented as not implemented and always comes back null.
// The only real state windows exposes is per thread, so it is aggregated back to the process.
export const processStateWin = (running: number, waiting: number, suspended: number) => {
  if (running > 0) {
    return 'running';
  }
  if (waiting > 0) {
    return 'sleeping';
  }
  if (suspended > 0) {
    return 'blocked';
  }
  return 'unknown';
};

// thread states: 1 ready, 2 running, 3 standby, 5 wait, 6 transition; wait reason 5 is suspended.
// .Threads throws for protected processes and .WaitReason throws unless the thread is waiting
const WIN_THREAD_STATES =
  'Get-Process -ErrorAction SilentlyContinue | ForEach-Object { $r=0;$w=0;$u=0; try { foreach ($t in $_.Threads) { $s=[int]$t.ThreadState; ' +
  'if ($s -eq 1 -or $s -eq 2 -or $s -eq 3 -or $s -eq 6) { $r++ } elseif ($s -eq 5) { if ([int]$t.WaitReason -eq 5) { $u++ } else { $w++ } } } } catch {}; ' +
  '[PSCustomObject]@{i=$_.Id;r=$r;w=$w;u=$u} } | ConvertTo-Json -compress';

const getWindowsProcessStates = async () => {
  const result: { [pid: number]: string } = {};
  try {
    for (const entry of psArray(await ps.exec(WIN_THREAD_STATES))) {
      result[entry.i] = processStateWin(entry.r || 0, entry.w || 0, entry.u || 0);
    }
  } catch {}
  return result;
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
  // same ceiling as the linux path - cpuu + cpus stays inside [0, 100] (#1007)
  const clamped = clampCpuPair(cpuu, cpus);
  return {
    pid: procStat.pid,
    utime: procStat.utime,
    stime: procStat.stime,
    cpuu: clamped.cpuu,
    cpus: clamped.cpus
  };
};

export const processes = async (): Promise<ProcessesData> => {
  await nextTick();
  const result: ProcessesData = cloneObj(initProcesses);
  if ((_processes_cpu.ms && Date.now() - _processes_cpu.ms >= 500) || _processes_cpu.ms === 0) {
    // freeze the baseline before awaiting: a concurrent call overwrites _processes_cpu
    // and would leave this one dividing by a near-zero delta (#1007)
    const cpuBaseline = { ..._processes_cpu };
    try {
      // the pool runs both queries on separate workers - the thread states cost no extra wall time
      const [processList, states] = await Promise.all([
        ps.exec(
          `Get-CimInstance Win32_Process | select-Object ProcessId,ParentProcessId,Caption,CommandLine,ExecutablePath,UserModeTime,KernelModeTime,WorkingSetSize,Priority,PageFileUsage,
        @{n="CreationDate";e={$_.CreationDate.ToString("yyyy-MM-dd HH:mm:ss")}} | ConvertTo-Json -compress`
        ),
        getWindowsProcessStates()
      ]);
      const processArray: any[] = psArray(processList);
      if (processArray.length) {
        const procs: ProcessesProcessData[] = [];
        const procStats: ProcStatData[] = [];
        const list_new: any = {};
        // accumulate from the previous totals and add deltas only - a process that exited
        // must not lower the total, otherwise the denominator turns negative (#559)
        let allcpuu = cpuBaseline.all_utime;
        let allcpus = cpuBaseline.all_stime;
        processArray.forEach((element) => {
          const pid = element.ProcessId;
          const parentPid = element.ParentProcessId;
          const name = element.Caption;
          const commandLine = element.CommandLine;
          // get additional command line data
          const commandPath = element.ExecutablePath;
          const utime = element.UserModeTime;
          const stime = element.KernelModeTime;
          const memw = element.WorkingSetSize;

          const cpuOld = cpuBaseline.list[pid];
          allcpuu += utime - (cpuOld ? cpuOld.utime : 0);
          allcpus += stime - (cpuOld ? cpuOld.stime : 0);
          result.all++;

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
            // Win32_Process reports 100-nanosecond units
            cpuTime: (utime + stime) / 1e7,
            mem: (memw / totalmem()) * 100,
            priority: element.Priority || 0,
            memVsz: element.PageFileUsage || null,
            memRss: Math.floor((element.WorkingSetSize || 0) / 1024),
            nice: 0,
            started: element.CreationDate,
            state: states[pid] || 'unknown',
            tty: '',
            user: '',
            command: commandLine || name,
            path: commandPath,
            params: ''
          });
        });
        result.running = procs.filter((proc) => proc.state === 'running').length;
        result.blocked = procs.filter((proc) => proc.state === 'blocked').length;
        result.unknown = procs.filter((proc) => proc.state === 'unknown').length;
        result.sleeping = result.all - result.running - result.blocked - result.unknown;
        result.list = procs;
        procStats.forEach((element) => {
          const resultProcess = calcProcStatWin(element, allcpuu + allcpus, cpuBaseline);

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
