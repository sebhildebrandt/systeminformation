import { getValue, toInt } from '../common/index';
import { CpuCacheData } from '../common/types';
import { exec } from '../common/exec';
import { nextTick } from '../common';

const parseCpuCache = (data: string): CpuCacheData => {
  // const defaults = cloneObj(initCpuCacheResult);
  const lines = data.toString().split('\n');
  const l1dString = getValue(lines, 'hw.l1dcachesize');
  const l1iString = getValue(lines, 'hw.l1icachesize');
  const l2String = getValue(lines, 'hw.l2cachesize');
  const l3String = getValue(lines, 'hw.l3cachesize');
  return {
    l1d: toInt(l1dString) * (l1dString.indexOf('K') >= 0 ? 1024 : 1),
    l1i: toInt(l1iString) * (l1iString.indexOf('K') >= 0 ? 1024 : 1),
    l2: toInt(l2String) * (l2String.indexOf('K') >= 0 ? 1024 : 1),
    l3: toInt(l3String) * (l3String.indexOf('K') >= 0 ? 1024 : 1)
  };
};

export const cpuCache = async () => {
  await nextTick();
  let stdout = '';
  try {
    ({ stdout } = await exec('sysctl -i hw.l1icachesize hw.l1dcachesize hw.l2cachesize hw.l3cachesize'));
  } catch {}
  return parseCpuCache(stdout);
};
