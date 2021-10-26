import { powerShell } from '../common/exec';
import { getValue, nextTick } from '../common';
import { initCpuCacheResult } from '../common/defaults';

export const windowsCpuCache = async () => {
  const result = initCpuCacheResult;
  try {
    powerShell('Get-WmiObject Win32_processor | fl *').then((stdout) => {
      const lines = stdout.split('\r\n');
      result.l1d = 0;
      result.l1i = 0;
      const l2 = getValue(lines, 'l2cachesize', ':');
      const l3 = getValue(lines, 'l3cachesize', ':');
      if (l2) { result.l2 = parseInt(l2, 10) * 1024; }
      if (l3) { result.l3 = parseInt(l3, 10) * 1024; }
      powerShell('Get-WmiObject Win32_CacheMemory | select CacheType,InstalledSize,Purpose | fl ').then((stdout) => {
        const parts = stdout.split(/\n\s*\n/);
        parts.forEach(function (part) {
          const lines = part.split('\r\n');
          const cacheType = getValue(lines, 'CacheType');
          const purpose = getValue(lines, 'Purpose');
          const installedSize = getValue(lines, 'InstalledSize');
          // L1 Instructions
          if (purpose === 'L1 Cache' && cacheType === '3') {
            result.l1i = parseInt(installedSize, 10);
          }
          // L1 Data
          if (purpose === 'L1 Cache' && cacheType === '4') {
            result.l1d = parseInt(installedSize, 10);
          }
        });
        return result;
      });
    });
  } catch (e) {
    return result;
  }
};

export const cpuCache = async () => {
  await nextTick();
  return windowsCpuCache();
};
