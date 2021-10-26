import { cpus } from 'os';
import { promises as fs } from 'fs';
import { execCmd } from '../common/exec';
import { cloneObj, getValue, nextTick } from '../common';
import { decodePiCpuinfo } from '../common/raspberry';
import { getAMDSpeed, cpuBrandManufacturer } from '../common/mappings';
import { cpuFlags } from './cpu-flags';
import { getCpuCurrentSpeed } from '../cpu-current-speed';
import { initCpuCacheResult, initCpuResult } from '../common/defaults';

let _cpu_speed = 0;

export const linuxCpu = async () => {
  let result = cloneObj(initCpuResult);
  const flags = await cpuFlags();
  result.flags = flags;
  result.virtualization = flags.indexOf('vmx') > -1 || flags.indexOf('svm') > -1;
  let modelline = '';
  if (cpus()[0] && cpus()[0].model) { modelline = cpus()[0].model; }
  let stdout = await execCmd('export LC_ALL=C; lscpu; echo -n "Governor: "; cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor 2>/dev/null; echo; unset LC_ALL');
  let lines = stdout.toString().split('\n');
  modelline = getValue(lines, 'model name') || modelline;
  const modellineParts = modelline.split('@');
  result.brand = modellineParts[0].trim();
  result.speed = modellineParts[1] ? parseFloat(modellineParts[1].trim()) : 0;
  if (result.speed === 0 && (result.brand.indexOf('AMD') > -1 || result.brand.toLowerCase().indexOf('ryzen') > -1)) {
    result.speed = getAMDSpeed(result.brand);
  }
  if (result.speed === 0) {
    const current = getCpuCurrentSpeed();
    if (current.avg !== 0) { result.speed = current.avg; }
  }
  _cpu_speed = result.speed;
  result.speedMin = Math.round(parseFloat(getValue(lines, 'cpu min mhz').replace(/,/g, '.')) / 10.0) / 100;
  result.speedMax = Math.round(parseFloat(getValue(lines, 'cpu max mhz').replace(/,/g, '.')) / 10.0) / 100;

  result = cpuBrandManufacturer(result);
  result.vendor = getValue(lines, 'vendor id');
  // if (!result.vendor) { result.vendor = getValue(lines, 'anbieterkennung'); }

  result.family = getValue(lines, 'cpu family');
  // if (!result.family) { result.family = getValue(lines, 'prozessorfamilie'); }
  result.model = getValue(lines, 'model:');
  // if (!result.model) { result.model = getValue(lines, 'modell:'); }
  result.stepping = getValue(lines, 'stepping');
  result.revision = getValue(lines, 'cpu revision');
  result.cache = initCpuCacheResult;
  const l1d = getValue(lines, 'l1d cache');
  if (l1d) { result.cache.l1d = parseInt(l1d) * (l1d.indexOf('M') !== -1 ? 1024 * 1024 : (l1d.indexOf('K') !== -1 ? 1024 : 1)); }
  const l1i = getValue(lines, 'l1i cache');
  if (l1i) { result.cache.l1i = parseInt(l1i) * (l1i.indexOf('M') !== -1 ? 1024 * 1024 : (l1i.indexOf('K') !== -1 ? 1024 : 1)); }
  const l2 = getValue(lines, 'l2 cache');
  if (l2) { result.cache.l2 = parseInt(l2) * (l2.indexOf('M') !== -1 ? 1024 * 1024 : (l2.indexOf('K') !== -1 ? 1024 : 1)); }
  const l3 = getValue(lines, 'l3 cache');
  if (l3) { result.cache.l3 = parseInt(l3) * (l3.indexOf('M') !== -1 ? 1024 * 1024 : (l3.indexOf('K') !== -1 ? 1024 : 1)); }

  const threadsPerCore = getValue(lines, 'thread(s) per core') || '1';
  // const coresPerSocketInt = parseInt(getValue(lines, 'cores(s) per socket') || '1', 10);
  const processors = getValue(lines, 'socket(s)') || '1';
  const threadsPerCoreInt = parseInt(threadsPerCore, 10);
  const processorsInt = parseInt(processors, 10);
  result.physicalCores = result.cores / threadsPerCoreInt;
  result.processors = processorsInt;
  result.governor = getValue(lines, 'governor') || '';

  // Test Raspberry
  if (result.vendor === 'ARM') {
    const linesRpi = (await fs.readFile('/proc/cpuinfo')).toString().split('\n');
    const rPIRevision = decodePiCpuinfo(linesRpi);
    if (rPIRevision.model.toLowerCase().indexOf('raspberry') >= 0) {
      result.family = result.manufacturer;
      result.manufacturer = rPIRevision.manufacturer;
      result.brand = rPIRevision.processor;
      result.revision = rPIRevision.revisionCode;
      result.socket = 'SOC';
    }
  }

  // socket type
  stdout = await execCmd('export LC_ALL=C; dmidecode –t 4 2>/dev/null | grep "Upgrade: Socket"; unset LC_ALL');
  lines = stdout.toString().split('\n');
  if (lines && lines.length) {
    result.socket = getValue(lines, 'Upgrade').replace('Socket', '').trim() || result.socket;
  }
  return result;
};

export const cpu = async () => {
  await nextTick();
  return linuxCpu();
};
