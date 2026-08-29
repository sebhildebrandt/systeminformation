import { execSave, execSecure } from '../common/exec';
import { ProcessLoadData, ProcStatData, ProcStatsData } from '../common/types';
import { execOptsLinux, LINUX } from '../common/const';
import { nextTick } from '../common';
import { isPrototypePolluted, sanitizeServiceString } from '../common/security';
import { calcProcStatLinux, parseProcStat } from '../common/parse';

const _process_cpu = {
  all: 0,
  all_utime: 0,
  all_stime: 0,
  list: {},
  ms: 0,
  result: {}
};

export const processLoad = async (proc: string): Promise<ProcessLoadData[]> => {
  await nextTick();
  const result: ProcessLoadData[] = [];
  if (!isPrototypePolluted()) {
    let stdout = '';
    const processes = sanitizeServiceString(proc);

    if (processes.length) {
      const args = ['-axo', 'pid,ppid,pcpu,pmem,comm'];
      stdout = await execSecure('ps', args);
      if (stdout) {
        const procStats: ProcStatsData[] = [];
        const lines = stdout.split('\n').filter((line: string) => {
          if (processes.length === 1 && processes[0] === '*') {
            return true;
          }
          if (line.toLowerCase().indexOf('grep') !== -1) {
            return false;
          } // remove this??
          let found = false;
          processes.forEach((item: string) => {
            found = found || line.toLowerCase().indexOf(item.toLowerCase()) >= 0;
          });
          return found;
        });

        if (processes.length === 1 && processes[0] === '*') {
          lines.shift();
        }

        lines.forEach(function (line) {
          const data = line.trim().replace(/ +/g, ' ').split(' ');
          if (data.length > 4) {
            procStats.push({
              name: data[4].substring(data[4].lastIndexOf('/') + 1),
              pid: parseInt(data[0]) || 0,
              ppid: parseInt(data[1]) || 0,
              cpu: parseFloat(data[2].replace(',', '.')),
              mem: parseFloat(data[3].replace(',', '.'))
            });
          }
        });

        procStats.forEach(function (item) {
          let listPos = -1;
          let inList = false;
          let name = '';
          for (let j = 0; j < result.length; j++) {
            if (item.name.toLowerCase().indexOf(result[j].proc.toLowerCase()) >= 0) {
              listPos = j;
            }
          }
          processes.forEach((proc: string) => {
            if (item.name.toLowerCase().indexOf(proc.toLowerCase()) >= 0 && !inList) {
              inList = true;
              name = proc;
            }
          });
          // console.log(item);
          // console.log(listPos);
          if ((processes.length === 1 && processes[0] === '*') || inList) {
            if (listPos < 0) {
              result.push({
                proc: name,
                pid: item.pid,
                pids: [item.pid],
                cpu: item.cpu,
                mem: item.mem
              });
            } else {
              if (item.ppid < 10) {
                result[listPos].pid = item.pid;
              }
              result[listPos].pids.push(item.pid);
              result[listPos].cpu += item.cpu;
              result[listPos].mem += item.mem;
            }
          }
        });

        if (processes.length !== 1 || processes[0] !== '*') {
          // add missing processes
          const processesMissing = processes.filter((name: string) => {
            return (
              procStats.filter(function (item) {
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
        if (LINUX) {
          // calc process_cpu - ps is not accurate in linux!
          result.forEach(function (item) {
            item.cpu = 0;
          });
          let cmd = 'cat /proc/stat | grep "cpu "';
          for (const i in result) {
            for (const j in result[i].pids) {
              cmd += ';cat /proc/' + result[i].pids[j] + '/stat';
            }
          }
          ({ stdout } = await execSave(cmd, execOptsLinux));
          let curr_processes = stdout.toString().split('\n');

          // first line (all - /proc/stat)
          const all = parseProcStat(curr_processes[0]);
          curr_processes = curr_processes.slice(1);

          // process
          const list_new: any = {};

          curr_processes.forEach((element) => {
            const resultProcess: ProcStatData = calcProcStatLinux(element, all, _process_cpu);

            if (resultProcess.pid) {
              // find result item
              let resultItemId = -1;
              for (let i = 0; i < result.length; i++) {
                if (result[i].pids.indexOf(resultProcess.pid) >= 0) {
                  resultItemId = i;
                }
              }
              // store pcpu in outer result
              if (resultItemId >= 0) {
                result[resultItemId].cpu += resultProcess.cpuu + resultProcess.cpus;
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

          result.forEach(function (item) {
            item.cpu = Math.round(item.cpu * 100) / 100;
          });

          _process_cpu.all = all;
          _process_cpu.list = Object.assign({}, list_new);
          _process_cpu.ms = Date.now();
          _process_cpu.result = Object.assign({}, result);
          return result;
        } else {
          return result;
        }
      } else {
        return result;
      }
    }
  }
  return result;
};
