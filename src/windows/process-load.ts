import { totalmem } from 'node:os';
import { nextTick } from '../common';
import { isPrototypePolluted, sanitizeServiceString } from '../common/security';
import type { ProcessLoadData, ProcStatData } from '../common/types';
import { ps, psArray } from '../common/windows';
import { calcProcStatWin } from './processes';

const _process_cpu = {
  all: 0,
  all_utime: 0,
  all_stime: 0,
  list: {},
  ms: 0,
  result: {}
};

// --- processes ------------
// --------------------------

export const processLoad = async (proc: string): Promise<ProcessLoadData[]> => {
  await nextTick();
  const result: ProcessLoadData[] = [];
  if (!isPrototypePolluted()) {
    const processes = sanitizeServiceString(proc);

    if (processes.length) {
      try {
        const processArray: any[] = psArray(
          await ps.exec('Get-CimInstance Win32_Process | select ProcessId,Caption,UserModeTime,KernelModeTime,WorkingSetSize | ConvertTo-Json -compress')
        );
        const procStats: ProcStatData[] = [];
        const list_new: any = {};
        let allcpuu = 0;
        let allcpus = 0;

        // go through all processes
        processArray.forEach((element) => {
          const pid = element.ProcessId;
          const name = element.Caption;
          const utime = element.UserModeTime;
          const stime = element.KernelModeTime;
          const mem = element.WorkingSetSize;
          allcpuu = allcpuu + utime;
          allcpus = allcpus + stime;

          procStats.push({
            pid: pid,
            name,
            utime: utime,
            stime: stime,
            cpu: 0,
            cpuu: 0,
            cpus: 0,
            mem
          });
          let pname = '';
          let inList = false;
          processes.forEach((proc: string) => {
            if (name.toLowerCase().indexOf(proc.toLowerCase()) >= 0 && !inList) {
              inList = true;
              pname = proc;
            }
          });

          if ((processes.length === 1 && processes[0] === '*') || inList) {
            let processFound = false;
            result.forEach((item) => {
              if (item.proc.toLowerCase() === pname.toLowerCase()) {
                item.pids.push(pid);
                item.mem += (mem / totalmem()) * 100;
                processFound = true;
              }
            });
            if (!processFound) {
              result.push({
                proc: pname,
                pid: pid,
                pids: [pid],
                cpu: 0,
                mem: (mem / totalmem()) * 100
              });
            }
          }
        });
        // add missing processes
        if (processes.length !== 1 || processes[0] !== '*') {
          const processesMissing = processes.filter((name: string) => {
            return (
              procStats.filter((item) => {
                return item.name.toLowerCase().indexOf(name) >= 0;
              }).length === 0
            );
          });
          processesMissing.forEach((procName: string) => {
            result.push({
              proc: procName,
              pid: null,
              pids: [],
              cpu: 0,
              mem: 0
            });
          });
        }

        // calculate proc stats for each proc
        procStats.forEach((element) => {
          const resultProcess = calcProcStatWin(element, allcpuu + allcpus, _process_cpu);

          let listPos = -1;
          for (let j = 0; j < result.length; j++) {
            if (result[j].pid === resultProcess.pid || result[j].pids.indexOf(resultProcess.pid) >= 0) {
              listPos = j;
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
            stime: resultProcess.stime
          };
        });
        // store old values
        _process_cpu.all = allcpuu + allcpus;
        _process_cpu.all_utime = allcpuu;
        _process_cpu.all_stime = allcpus;
        _process_cpu.list = Object.assign({}, list_new);
        _process_cpu.ms = Date.now();
        _process_cpu.result = JSON.parse(JSON.stringify(result));
      } catch {}
    }
  }
  return result;
};
