import { cpus } from 'os';
import { execCmd } from '../common/exec';
import { getValue, nextTick } from '../common';
import { getAMDSpeed, cpuBrandManufacturer } from '../common/mappings';
import { cpuFlags } from './cpu-flags';
import { getCpuCurrentSpeed } from '../cpu-current-speed';

import { initCpuCacheResult, initCpuResult } from '../common/defaults';

let _cpu_speed = 0;

export const bsdCpu = async () => {
  let result = initCpuResult;
  const flags = await cpuFlags();
  result.flags = flags;
  result.virtualization = flags.indexOf('vmx') > -1 || flags.indexOf('svm') > -1;

  let modelline = '';
  if (cpus()[0] && cpus()[0].model) { modelline = cpus()[0].model; }
  const stdout = (await execCmd('export LC_ALL=C; dmidecode -t 4; dmidecode -t 7 unset LC_ALL')).toString();
  let cache = [];
  const data = stdout.toString().split('# dmidecode');
  const processor = data.length > 1 ? data[1] : '';
  cache = data.length > 2 ? data[2].split('Cache Information') : [];

  let lines = processor.split('\n');
  result.brand = modelline.split('@')[0].trim();
  result.speed = modelline.split('@')[1] ? parseFloat(modelline.split('@')[1].trim()) : 0;
  if (result.speed === 0 && (result.brand.indexOf('AMD') > -1 || result.brand.toLowerCase().indexOf('ryzen') > -1)) {
    result.speed = getAMDSpeed(result.brand);
  }
  if (result.speed === 0) {
    const current = getCpuCurrentSpeed();
    if (current.avg !== 0) { result.speed = current.avg; }
  }
  _cpu_speed = result.speed;
  result.speedMin = result.speed;
  result.speedMax = Math.round(parseFloat(getValue(lines, 'max speed').replace(/Mhz/g, '')) / 10.0) / 100;

  result = cpuBrandManufacturer(result);
  result.vendor = getValue(lines, 'manufacturer');
  const sig = getValue(lines, 'signature');
  const sigParts = sig.split(',');
  for (let i = 0; i < sigParts.length; i++) {
    sigParts[i] = sigParts[i].trim();
  }
  result.family = getValue(sigParts, 'Family', ' ', true);
  result.model = getValue(sigParts, 'Model', ' ', true);
  result.stepping = getValue(sigParts, 'Stepping', ' ', true);
  result.revision = '';
  const voltage = parseFloat(getValue(lines, 'voltage'));
  result.voltage = isNaN(voltage) ? '' : voltage.toFixed(2);
  result.cache = initCpuCacheResult;
  for (let i = 0; i < cache.length; i++) {
    lines = cache[i].split('\n');
    const cacheTypeParts = getValue(lines, 'Socket Designation').toLowerCase().replace(' ', '-').split('-');
    const cacheType = cacheTypeParts.length ? cacheTypeParts[0] : '';
    const sizeParts = getValue(lines, 'Installed Size').split(' ');
    let size = parseInt(sizeParts[0], 10);
    const unit = sizeParts.length > 1 ? sizeParts[1] : 'kb';
    size = size * (unit === 'kb' ? 1024 : (unit === 'mb' ? 1024 * 1024 : (unit === 'gb' ? 1024 * 1024 * 1024 : 1)));
    if (cacheType) {
      switch (true) {
        case cacheType === 'l1':
          result.cache.l1d = size / 2;
          result.cache.l1i = size / 2;
          break;
        case cacheType === 'l2': result.cache.l2 = size; break;
        case cacheType === 'l3': result.cache.l3 = size;
      }
    }
  }
  // socket type
  result.socket = getValue(lines, 'Upgrade').replace('Socket', '').trim();
  // # threads / # cores
  const threadCount = getValue(lines, 'thread count').trim();
  const coreCount = getValue(lines, 'core count').trim();
  if (coreCount && threadCount) {
    result.cores = parseInt(threadCount, 10);
    result.physicalCores = parseInt(coreCount, 10);
  }
  return result;
};

export const cpu = async () => {
  await nextTick();
  return bsdCpu();
};
