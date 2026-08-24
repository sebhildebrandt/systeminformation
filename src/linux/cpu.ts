import { readFile } from 'node:fs/promises';
import { cpus } from 'node:os';
import { cleanString, cloneObj, getValue, nextTick, toInt } from '../common';
import { execOptsLinux } from '../common/const';
import { setCpuSpeed } from '../common/cpu';
import { initCpuCacheResult, initCpuResult } from '../common/defaults';
import { exec } from '../common/exec';
import { cpuBrandManufacturer, cpuManufacturer, getAMDSpeed } from '../common/mappings';
import { kFactor } from '../common/parse';
import { isRaspberry } from './../common/raspberry';
import { decodePiCpuinfo } from '../common/raspberry';
import { getCpuCurrentSpeed } from '../cpu-current-speed';
import { cpuFlags } from './cpu-flags';

setCpuSpeed(0);

export const cpu = async () => {
  await nextTick();
  const defaults = cloneObj(initCpuResult);
  const cores = defaults.cores;
  const flags = await cpuFlags();
  const virtualization = flags.indexOf('vmx') > -1 || flags.indexOf('svm') > -1;
  let modelline = '';
  if (cpus()[0] && cpus()[0].model) {
    modelline = cpus()[0].model;
  }
  let { stdout } = await exec('export LC_ALL=C; lscpu; echo -n "Governor: "; cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor 2>/dev/null; echo; unset LC_ALL', execOptsLinux);
  let lines = stdout.toString().split('\n');
  modelline = getValue(lines, 'model name') || modelline;
  modelline = getValue(lines, 'bios model name') || modelline;
  modelline = cleanString(modelline);
  const modellineParts = modelline.split('@');
  let brand = modellineParts[0].trim();
  if (brand.indexOf('Unknown') >= 0) {
    brand = brand.split('Unknown')[0].trim();
  }

  let speed = modellineParts[1] ? parseFloat(modellineParts[1].trim()) : 0;
  if (speed === 0 && (brand.indexOf('AMD') > -1 || brand.toLowerCase().indexOf('ryzen') > -1)) {
    speed = getAMDSpeed(brand);
  }
  if (speed === 0) {
    const current = await getCpuCurrentSpeed();
    if (current.avg !== 0) {
      speed = current.avg;
    }
  }
  setCpuSpeed(speed);
  const speedMin = Math.round(parseFloat(getValue(lines, 'cpu min mhz').replace(/,/g, '.')) / 10.0) / 100 || defaults.speedMin;
  const speedMax = Math.round(parseFloat(getValue(lines, 'cpu max mhz').replace(/,/g, '.')) / 10.0) / 100 || defaults.speedMax;

  const brandManufacturer = cpuBrandManufacturer(brand);
  brand = brandManufacturer.brand;
  let manufacturer = brandManufacturer.manufacturer;
  const vendor = cpuManufacturer(getValue(lines, 'vendor id'));
  let family = getValue(lines, 'cpu family');
  const model = getValue(lines, 'model:');
  const stepping = getValue(lines, 'stepping');
  let revision = getValue(lines, 'cpu revision');
  const cache = initCpuCacheResult;
  const l1d = getValue(lines, 'l1d cache');
  if (l1d) {
    cache.l1d = toInt(l1d) * (l1d.indexOf('M') !== -1 ? 1024 * 1024 : kFactor(l1d));
  }
  const l1i = getValue(lines, 'l1i cache');
  if (l1i) {
    cache.l1i = toInt(l1i) * (l1i.indexOf('M') !== -1 ? 1024 * 1024 : kFactor(l1i));
  }
  const l2 = getValue(lines, 'l2 cache');
  if (l2) {
    cache.l2 = toInt(l2) * (l2.indexOf('M') !== -1 ? 1024 * 1024 : kFactor(l2));
  }
  const l3 = getValue(lines, 'l3 cache');
  if (l3) {
    cache.l3 = toInt(l3) * (l3.indexOf('M') !== -1 ? 1024 * 1024 : kFactor(l3));
  }

  const threadsPerCore = getValue(lines, 'thread(s) per core') || '1';

  let processors = toInt(getValue(lines, 'socket(s)')) || 1;
  const threadsPerCoreInt = toInt(threadsPerCore);
  const processorsInt = toInt(processors);
  const coresPerSocket = toInt(getValue(lines, 'core(s) per socket')); // number of cores (e.g. 16 on i12900)
  const physicalCores = coresPerSocket ? coresPerSocket * processorsInt : cores / threadsPerCoreInt;
  const performanceCores = threadsPerCoreInt > 1 ? cores - physicalCores : cores;
  const efficiencyCores = threadsPerCoreInt > 1 ? cores - threadsPerCoreInt * performanceCores : 0;

  processors = processorsInt;
  const governor = getValue(lines, 'governor') || '';
  let socket = vendor === 'ARM' ? 'SOC' : defaults.socket;

  // Test Raspberry
  if (vendor === 'ARM' && (await isRaspberry())) {
    const rPIRevision = decodePiCpuinfo();
    family = manufacturer;
    manufacturer = rPIRevision.manufacturer;
    brand = rPIRevision.processor;
    revision = rPIRevision.revisionCode;
    socket = 'SOC';
  }

  // Test RISC-V
  if (getValue(lines, 'architecture') === 'riscv64') {
    try {
      const linesRiscV = (await readFile('/proc/cpuinfo')).toString().split('\n');
      const uarch = getValue(linesRiscV, 'uarch') || '';
      if (uarch.indexOf(',') > -1) {
        const split = uarch.split(',');
        manufacturer = cpuManufacturer(split[0]);
        brand = split[1];
      }
    } catch {}
  }

  // socket type
  ({ stdout } = await exec('export LC_ALL=C; dmidecode -t 4 2>/dev/null | grep "Upgrade: Socket"; unset LC_ALL', execOptsLinux));
  lines = stdout.toString().split('\n');
  if (lines && lines.length) {
    socket = getValue(lines, 'Upgrade').replace('Socket', '').trim() || socket;
  }
  return {
    ...defaults,
    manufacturer,
    brand,
    vendor,
    family,
    model,
    stepping,
    revision,
    speed,
    speedMin,
    speedMax,
    governor,
    physicalCores,
    performanceCores,
    efficiencyCores,
    processors,
    socket,
    flags,
    virtualization,
    cache
  };
};
