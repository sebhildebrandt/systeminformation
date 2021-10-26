import * as os from 'os';
import { execCmd } from '../common/exec';
import { getValue, nextTick } from '../common';
import { cpuBrandManufacturer } from '../common/mappings';
import { cpuFlags } from './cpu-flags';
import { cpuCache } from './cpu-cache';

import { initCpuResult } from '../common/defaults';

let _cpu_speed = 0;

// --------------------------
// CPU - brand, speed

export const darwinCpu = async () => {
  let result = initCpuResult;
  const flags = await cpuFlags();
  result.flags = flags;
  result.virtualization = flags.indexOf('vmx') > -1 || flags.indexOf('svm') > -1;

  const stdout = (await execCmd('sysctl machdep.cpu hw.cpufrequency_max hw.cpufrequency_min hw.packages hw.physicalcpu_max hw.ncpu hw.tbfrequency hw.cpufamily hw.cpusubfamily')).toString();
  const lines = stdout.split('\n');
  const modelline = getValue(lines, 'machdep.cpu.brand_string');
  const modellineParts = modelline.split('@');
  result.brand = modellineParts[0].trim();
  const speed = modellineParts[1] ? modellineParts[1].trim() : '0';
  result.speed = parseFloat(speed.replace(/GHz+/g, ''));
  let tbFrequency = parseInt(getValue(lines, 'hw.tbfrequency'), 10) / 1000000000.0;
  tbFrequency = tbFrequency < 0.1 ? tbFrequency * 100 : tbFrequency;
  result.speed = result.speed === 0 ? tbFrequency : result.speed;

  _cpu_speed = result.speed;
  result = cpuBrandManufacturer(result);
  result.speedMin = getValue(lines, 'hw.cpufrequency_min') ? (parseInt(getValue(lines, 'hw.cpufrequency_min'), 10) / 1000000000.0) : result.speed;
  result.speedMax = getValue(lines, 'hw.cpufrequency_max') ? (parseInt(getValue(lines, 'hw.cpufrequency_max'), 10) / 1000000000.0) : result.speed;
  result.vendor = getValue(lines, 'machdep.cpu.vendor') || 'Apple';
  result.family = getValue(lines, 'machdep.cpu.family') || getValue(lines, 'hw.cpufamily');
  result.model = getValue(lines, 'machdep.cpu.model');
  result.stepping = getValue(lines, 'machdep.cpu.stepping') || getValue(lines, 'hw.cpusubfamily');
  const countProcessors = getValue(lines, 'hw.packages');
  const countCores = getValue(lines, 'hw.physicalcpu_max');
  const countThreads = getValue(lines, 'hw.ncpu');
  if (os.arch() === 'arm64') {
    const clusters = (await execCmd('ioreg -c IOPlatformDevice -d 3 -r | grep cluster-type')).toString().split('\n');
    const efficiencyCores = clusters.filter((line: string) => line.indexOf('"E"') >= 0).length;
    const performanceCores = clusters.filter((line: string) => line.indexOf('"P"') >= 0).length;
    result.socket = 'SOC';
    result.efficiencyCores = efficiencyCores;
    result.performanceCores = performanceCores;
  }
  if (countProcessors) {
    result.processors = parseInt(countProcessors) || 1;
  }
  if (countCores && countThreads) {
    result.cores = parseInt(countThreads) || os.cpus().length;
    result.physicalCores = parseInt(countCores) || os.cpus().length;
  }
  const caches = await cpuCache();
  if (caches) { result.cache = caches; }
  return result;
};

export const cpu = async () => {
  await nextTick();
  return darwinCpu();
};
