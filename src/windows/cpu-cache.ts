import { cloneObj, nextTick, toInt } from '../common';
import { initCpuCacheResult } from '../common/defaults';
import { ps, psArray } from '../common/windows';

export const parseWinCache = (processorObj: any, cacheParts: any[]) => {
  const result = cloneObj(initCpuCacheResult);

  // Win32_processor
  result.l1d = 0;
  result.l1i = 0;
  result.l2 = processorObj?.L2CacheSize ? toInt(processorObj.L2CacheSize) * 1024 : 0;
  result.l3 = processorObj?.L3CacheSize ? toInt(processorObj.L3CacheSize) * 1024 : 0;

  // Win32_CacheMemory
  let l1i = 0;
  let l1d = 0;
  let l2 = 0;
  cacheParts.forEach((part: any) => {
    const cacheType = part.CacheType != null ? String(part.CacheType) : '';
    const level = part.Level != null ? String(part.Level) : '';
    const installedSize = part.InstalledSize;
    // L1 Instructions
    if (level === '3' && cacheType === '3') {
      result.l1i = result.l1i + toInt(installedSize) * 1024;
    }
    // L1 Data
    if (level === '3' && cacheType === '4') {
      result.l1d = result.l1d + toInt(installedSize) * 1024;
    }
    // L1 all
    if (level === '3' && cacheType === '5') {
      l1i = toInt(installedSize) / 2;
      l1d = toInt(installedSize) / 2;
    }
    // L2
    if (level === '4' && cacheType === '5') {
      l2 = l2 + toInt(installedSize) * 1024;
    }
  });
  if (!result.l1i && !result.l1d) {
    result.l1i = l1i;
    result.l1d = l1d;
  }
  if (l2) {
    result.l2 = l2;
  }
  return result;
};

export const cpuCache = async () => {
  await nextTick();
  const defaults = cloneObj(initCpuCacheResult);

  try {
    const workload = [];
    workload.push(ps.exec('Get-CimInstance Win32_Processor | select L2CacheSize, L3CacheSize | ConvertTo-Json'));
    workload.push(ps.exec('Get-CimInstance Win32_CacheMemory | select CacheType,InstalledSize,Level | ConvertTo-Json'));
    const data = await Promise.all(workload);
    const processors = psArray(data[0]);

    return parseWinCache(processors[0], psArray(data[1]));
  } catch {
    return defaults;
  }
};
