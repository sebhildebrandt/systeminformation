import { execCmd } from '../common/exec';
import { cloneObj, getValue, nextTick } from '../common';
import { initCpuCacheResult } from '../common/defaults';

export const bsdCpuCache = async () => {
  const result = cloneObj(initCpuCacheResult);
  const stdout = (await execCmd('export LC_ALL=C; dmidecode -t 7 2>/dev/null; unset LC_ALL')).toString();
  let cache: string[] = [];
  cache = stdout.split('Cache Information');
  cache.shift();
  for (let i = 0; i < cache.length; i++) {
    const lines = cache[i].split('\n');
    const cacheTypeParts = getValue(lines, 'Socket Designation').toLowerCase().replace(' ', '-').split('-');
    const cacheType = cacheTypeParts.length ? cacheTypeParts[0] : '';
    const sizeParts = getValue(lines, 'Installed Size').split(' ');
    let size = parseInt(sizeParts[0], 10);
    const unit = sizeParts.length > 1 ? sizeParts[1] : 'kb';
    size = size * (unit === 'kb' ? 1024 : (unit === 'mb' ? 1024 * 1024 : (unit === 'gb' ? 1024 * 1024 * 1024 : 1)));
    if (cacheType) {
      switch (true) {
        case cacheType === 'l1':
          result.l1d = size / 2;
          result.l1i = size / 2;
          break;
        case cacheType === 'l2': result.l2 = size; break;
        case cacheType === 'l3': result.l3 = size;
      }
    }
  }
  return result;
};

export const cpuCache = async () => {
  await nextTick();
  return bsdCpuCache();
};