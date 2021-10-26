import { execCmd } from '../common/exec';
import { CpuCacheData } from '../common/types';
import { initCpuCacheResult } from '../common/initials';
import { nextTick } from '../common';

export const linuxCpuCache = async () => {
  const result = initCpuCacheResult;
  try {
    const stdout = await execCmd('export LC_ALL=C; lscpu; unset LC_ALL');
    let lines = stdout.toString().split('\n');
    lines.forEach((line: string) => {
      let parts = line.split(':');
      if (parts[0].toUpperCase().indexOf('L1D CACHE') !== -1) {
        result.l1d = parseInt(parts[1].trim()) * (parts[1].indexOf('M') !== -1 ? 1024 * 1024 : (parts[1].indexOf('K') !== -1 ? 1024 : 1));
      }
      if (parts[0].toUpperCase().indexOf('L1I CACHE') !== -1) {
        result.l1i = parseInt(parts[1].trim()) * (parts[1].indexOf('M') !== -1 ? 1024 * 1024 : (parts[1].indexOf('K') !== -1 ? 1024 : 1));
      }
      if (parts[0].toUpperCase().indexOf('L2 CACHE') !== -1) {
        result.l2 = parseInt(parts[1].trim()) * (parts[1].indexOf('M') !== -1 ? 1024 * 1024 : (parts[1].indexOf('K') !== -1 ? 1024 : 1));
      }
      if (parts[0].toUpperCase().indexOf('L3 CACHE') !== -1) {
        result.l3 = parseInt(parts[1].trim()) * (parts[1].indexOf('M') !== -1 ? 1024 * 1024 : (parts[1].indexOf('K') !== -1 ? 1024 : 1));
      }
    });
    return result;
  } catch (e) {
    return result;
  }
};

export const cpuCache = async () => {
  await nextTick();
  return linuxCpuCache();
};
