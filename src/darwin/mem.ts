import { MemData } from '../common/types';
import { cloneObj, getValue, nextTick, toInt } from '../common';
import { initMemData } from '../common/defaults';
import { exec } from '../common/exec';
import { execSave } from './../common/exec';

export const mem = async (): Promise<MemData> => {
  await nextTick();
  const result = cloneObj(initMemData);
  try {
    let pageSize = 4096;
    try {
      const { stdout } = await exec('sysctl -n vm.pagesize');
      const sysPpageSize = toInt(stdout);
      pageSize = sysPpageSize || pageSize;
    } catch {}
    let { stdout } = await exec(
      'vm_stat 2>/dev/null | egrep "Pages active|Pages inactive|Pages speculative|Pages wired down|Pages occupied by compressor|Pages purgeable|File-backed pages|Anonymous pages"'
    );
    let lines = stdout.split('\n');

    const wired = (parseInt(getValue(lines, 'Pages wired down'), 10) || 0) * pageSize;
    const compressed = (parseInt(getValue(lines, 'Pages occupied by compressor'), 10) || 0) * pageSize;
    const purgeable = (parseInt(getValue(lines, 'Pages purgeable'), 10) || 0) * pageSize;
    const anonymous = (parseInt(getValue(lines, 'Anonymous pages'), 10) || 0) * pageSize;

    result.active = anonymous - purgeable + wired + compressed;
    result.reclaimable = (parseInt(getValue(lines, 'Pages inactive'), 10) || 0) * pageSize;
    result.buffcache = result.used - result.active;
    result.available = result.free + result.buffcache;

    ({ stdout } = await execSave('sysctl -in vm.swapusage 2>/dev/null'));
    lines = stdout.split('\n');
    if (lines.length > 0) {
      const firstline = lines[0].replace(/,/g, '.').replace(/M/g, '');
      const lineArray = firstline.trim().split('  ');
      lineArray.forEach((line) => {
        if (line.toLowerCase().indexOf('total') !== -1) {
          result.swaptotal = parseFloat(line.split('=')[1].trim()) * 1024 * 1024;
        }
        if (line.toLowerCase().indexOf('used') !== -1) {
          result.swapused = parseFloat(line.split('=')[1].trim()) * 1024 * 1024;
        }
        if (line.toLowerCase().indexOf('free') !== -1) {
          result.swapfree = parseFloat(line.split('=')[1].trim()) * 1024 * 1024;
        }
      });
    }
  } catch {}
  return result;
};
