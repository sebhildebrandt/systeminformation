import { arch, cpus } from 'node:os';
import { cloneObj, getValue, nextTick, toInt } from '../common';
import { setCpuSpeed } from '../common/cpu';
import { initCpuResult } from '../common/defaults';
import { exec } from '../common/exec';
import { cpuBrandManufacturer } from '../common/mappings';
import { cpuCache } from './cpu-cache';
import { cpuFlags } from './cpu-flags';

export const cpu = async () => {
  await nextTick();

  const defaults = cloneObj(initCpuResult);
  const flags = await cpuFlags();
  let stdout = '';
  try {
    ({ stdout } = await exec('sysctl -i machdep.cpu hw.cpufrequency_max hw.cpufrequency_min hw.packages hw.physicalcpu_max hw.ncpu hw.tbfrequency hw.cpufamily hw.cpusubfamily'));
  } catch {}
  const lines = stdout.split('\n');
  const modelline = getValue(lines, 'machdep.cpu.brand_string');
  const modellineParts = modelline.split('@');
  const speedStr = modellineParts[1] ? modellineParts[1].trim() : '0';
  let speed = parseFloat(speedStr.replace(/GHz+/g, ''));

  let tbFrequency = parseInt(getValue(lines, 'hw.tbfrequency'), 10) / 1000000000.0;
  tbFrequency = tbFrequency < 0.1 ? tbFrequency * 100 : tbFrequency;
  speed = speed === 0 ? tbFrequency : speed;

  setCpuSpeed(speed);
  const brandObject = cpuBrandManufacturer(modellineParts[0].trim());
  const countProcessors = getValue(lines, 'hw.packages');
  const countCores = getValue(lines, 'hw.physicalcpu_max');
  const countThreads = getValue(lines, 'hw.ncpu');
  let socket = defaults.socket;
  let efficiencyCores: number | null = null;
  let performanceCores: number | null = null;
  if (arch() === 'arm64') {
    try {
      const { stdout } = await exec('ioreg -c IOPlatformDevice -d 3 -r | grep cluster-type');
      const clusters = stdout.split('\n');
      efficiencyCores = clusters.filter((line: string) => line.indexOf('"E"') >= 0).length + clusters.filter((line) => line.indexOf('"M"') >= 0).length;
      performanceCores = clusters.filter((line: string) => line.indexOf('"P"') >= 0).length;
      socket = 'SOC';
    } catch {}
  }

  return {
    ...defaults,
    flags,
    virtualization: flags.indexOf('vmx') > -1 || flags.indexOf('svm') > -1,
    brand: brandObject.brand,
    manufacturer: brandObject.manufacturer,
    speed,
    speedMin: getValue(lines, 'hw.cpufrequency_min') ? toInt(getValue(lines, 'hw.cpufrequency_min')) / 1000000000.0 : speed,
    speedMax: getValue(lines, 'hw.cpufrequency_max') ? toInt(getValue(lines, 'hw.cpufrequency_max')) / 1000000000.0 : speed,
    vendor: getValue(lines, 'machdep.cpu.vendor') || 'Apple',
    family: getValue(lines, 'machdep.cpu.family') || getValue(lines, 'hw.cpufamily'),
    model: getValue(lines, 'machdep.cpu.model'),
    stepping: getValue(lines, 'machdep.cpu.stepping') || getValue(lines, 'hw.cpusubfamily'),
    socket,
    processors: toInt(countProcessors) || 1,
    cores: toInt(countThreads) || cpus().length,
    physicalCores: toInt(countCores) || cpus().length,
    efficiencyCores,
    performanceCores,
    cache: await cpuCache()
  };
};
