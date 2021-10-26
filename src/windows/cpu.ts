import { cpus } from 'os';
import { powerShell } from '../common/exec';
import { getValue, toInt, countLines, nextTick } from '../common';
import { getAMDSpeed, socketTypes, cpuBrandManufacturer } from '../common/mappings';
import { cpuFlags } from './cpu-flags';

import { initCpuCacheResult, initCpuResult } from '../common/defaults';

let _cpu_speed = 0;

export const windowsCpu = async () => {
  let result = initCpuResult;
  const flags = await cpuFlags();
  result.flags = flags;
  result.virtualization = flags.indexOf('vmx') > -1 || flags.indexOf('svm') > -1;
  try {
    const workload = [];
    workload.push(powerShell('Get-WmiObject Win32_processor | fl *'));
    workload.push(powerShell('Get-WmiObject Win32_CacheMemory | select CacheType,InstalledSize,Purpose | fl *'));
    // workload.push(powerShell('Get-ComputerInfo -property "HyperV*"'));
    workload.push(powerShell('(Get-CimInstance Win32_ComputerSystem).HypervisorPresent'));

    const data = await Promise.allSettled(workload).then(results => results.map(result => result.status === 'fulfilled' ? result.value : ''));
    let lines = data[0].toString().split('\r\n');
    const name = getValue(lines, 'name', ':') || '';
    if (name.indexOf('@') >= 0) {
      result.brand = name.split('@')[0].trim();
      result.speed = name.split('@')[1] ? parseFloat(name.split('@')[1].trim()) : 0;
      _cpu_speed = result.speed;
    } else {
      result.brand = name.trim();
      result.speed = 0;
    }
    result = cpuBrandManufacturer(result);
    result.revision = getValue(lines, 'revision', ':');
    result.cache = initCpuCacheResult;
    result.cache.l1d = 0;
    result.cache.l1i = 0;
    result.cache.l2 = toInt(getValue(lines, 'l2cachesize', ':')) * 1024;
    result.cache.l3 = toInt(getValue(lines, 'l3cachesize', ':')) * 1024;
    result.vendor = getValue(lines, 'manufacturer', ':');
    result.speedMax = Math.round(parseFloat(getValue(lines, 'maxclockspeed', ':').replace(/,/g, '.')) / 10.0) / 100;
    if (result.speed === 0 && (result.brand.indexOf('AMD') > -1 || result.brand.toLowerCase().indexOf('ryzen') > -1)) {
      result.speed = getAMDSpeed(result.brand);
    }
    if (result.speed === 0) {
      result.speed = result.speedMax;
    }
    result.speedMin = result.speed;

    const description = getValue(lines, 'description', ':').split(' ');
    for (let i = 0; i < description.length; i++) {
      if (description[i].toLowerCase().startsWith('family') && (i + 1) < description.length && description[i + 1]) {
        result.family = description[i + 1];
      }
      if (description[i].toLowerCase().startsWith('model') && (i + 1) < description.length && description[i + 1]) {
        result.model = description[i + 1];
      }
      if (description[i].toLowerCase().startsWith('stepping') && (i + 1) < description.length && description[i + 1]) {
        result.stepping = description[i + 1];
      }
    }
    // socket type
    const socketId = getValue(lines, 'UpgradeMethod', ':');
    if (socketTypes[socketId]) {
      result.socket = socketTypes[socketId];
    }
    // # threads / # cores
    const countProcessors = countLines(lines, 'Caption');
    const countThreads = getValue(lines, 'NumberOfLogicalProcessors', ':');
    const countCores = getValue(lines, 'NumberOfCores', ':');
    if (countProcessors) {
      result.processors = countProcessors || 1;
    }
    if (countCores && countThreads) {
      result.cores = parseInt(countThreads) || cpus().length;
      result.physicalCores = parseInt(countCores) || cpus().length;
    }
    if (countProcessors > 1) {
      result.cores = result.cores * countProcessors;
      result.physicalCores = result.physicalCores * countProcessors;
    }
    const parts = data[1].toString().split(/\n\s*\n/);
    let l1i = 0;
    let l1d = 0;
    parts.forEach((part: string) => {
      lines = part.split('\r\n');
      const cacheType = getValue(lines, 'CacheType');
      const purpose = getValue(lines, 'Purpose');
      const installedSize = getValue(lines, 'InstalledSize');
      // L1 Instructions
      if (purpose === 'L1 Cache' && cacheType === '3') {
        l1i = parseInt(installedSize, 10);
      }
      // L1 Data
      if (purpose === 'L1 Cache' && cacheType === '4') {
        l1d = parseInt(installedSize, 10);
      }
    });
    result.cache.l1i = l1i;
    result.cache.l1d = l1d;
    const hyperv = data[2] ? data[2].toString().toLowerCase() : '';
    result.virtualization = hyperv.indexOf('true') !== -1;

    return result;
  } catch (e) {
    return result;
  }
};

export const cpu = async () => {
  await nextTick();
  return windowsCpu();
};
