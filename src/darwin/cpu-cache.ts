import { execCmd } from '../common/exec';
import { initCpuCacheResult } from '../common/defaults';
import { cloneObj, nextTick } from '../common';

export const darwinCpuCache = async () => {
  const result = cloneObj(initCpuCacheResult);
  try {
    const stdout = await execCmd('sysctl hw.l1icachesize hw.l1dcachesize hw.l2cachesize hw.l3cachesize');
    const lines = stdout.toString().split('\n');
    lines.forEach(function (line) {
      const parts = line.split(':');
      if (parts[0].toLowerCase().indexOf('hw.l1icachesize') !== -1) {
        result.l1d = parseInt(parts[1].trim()) * (parts[1].indexOf('K') !== -1 ? 1024 : 1);
      }
      if (parts[0].toLowerCase().indexOf('hw.l1dcachesize') !== -1) {
        result.l1i = parseInt(parts[1].trim()) * (parts[1].indexOf('K') !== -1 ? 1024 : 1);
      }
      if (parts[0].toLowerCase().indexOf('hw.l2cachesize') !== -1) {
        result.l2 = parseInt(parts[1].trim()) * (parts[1].indexOf('K') !== -1 ? 1024 : 1);
      }
      if (parts[0].toLowerCase().indexOf('hw.l3cachesize') !== -1) {
        result.l3 = parseInt(parts[1].trim()) * (parts[1].indexOf('K') !== -1 ? 1024 : 1);
      }
    });
    return result;
  } catch (e) {
    return result;
  }
};

export const cpuCache = async () => {
  await nextTick();
  return darwinCpuCache();
};
