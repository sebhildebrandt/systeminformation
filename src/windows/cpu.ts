import { cpus } from 'node:os';
import { cloneObj, nextTick } from '../common';
import { setCpuSpeed } from '../common/cpu';
import { initCpuResult } from '../common/defaults';
import { cpuBrandManufacturer, getAMDSpeed, getSocketTypesByName, socketTypes } from '../common/mappings';
import { ps, psArray } from '../common/windows';
import { parseWinCache } from './cpu-cache';
import { cpuFlags } from './cpu-flags';

setCpuSpeed(0);

export const cpu = async () => {
  await nextTick();
  const result = cloneObj(initCpuResult);
  const flags = await cpuFlags();
  result.flags = flags;
  result.virtualization = flags.indexOf('vmx') > -1 || flags.indexOf('svm') > -1;
  try {
    const workload = [];
    workload.push(
      ps.exec(
        'Get-CimInstance Win32_Processor | select Name, Revision, L2CacheSize, L3CacheSize, Manufacturer, MaxClockSpeed, Description, UpgradeMethod, Caption, NumberOfLogicalProcessors, NumberOfCores | ConvertTo-Json'
      )
    );
    workload.push(ps.exec('Get-CimInstance Win32_CacheMemory | select CacheType,InstalledSize,Level | ConvertTo-Json'));
    workload.push(ps.exec('(Get-CimInstance Win32_ComputerSystem).HypervisorPresent'));
    const data = await Promise.all(workload);
    const processors = psArray(data[0]);
    const cacheParts = psArray(data[1]);
    if (processors.length) {
      const processorObj = processors[0];
      const name = processorObj.Name != null ? String(processorObj.Name) : '';
      if (name.indexOf('@') >= 0) {
        result.brand = name.split('@')[0].trim();
        result.speed = name.split('@')[1] ? parseFloat(name.split('@')[1].trim()) : 0;
        setCpuSpeed(result.speed);
      } else {
        result.brand = name.trim();
        result.speed = 0;
      }
      const brandManufacturer = cpuBrandManufacturer(result.brand);
      result.brand = brandManufacturer.brand;
      result.manufacturer = brandManufacturer.manufacturer;

      result.revision = processorObj.Revision != null ? String(processorObj.Revision) : '';
      result.cache = parseWinCache(processorObj, cacheParts);

      result.vendor = processorObj.Manufacturer != null ? String(processorObj.Manufacturer) : '';
      result.speedMax = Math.round(parseFloat(String(processorObj.MaxClockSpeed ?? '').replace(/,/g, '.')) / 10.0) / 100 || result.speedMax;
      if (result.speed === 0 && (result.brand.indexOf('AMD') > -1 || result.brand.toLowerCase().indexOf('ryzen') > -1)) {
        result.speed = getAMDSpeed(result.brand);
      }
      if (result.speed === 0) {
        result.speed = result.speedMax;
      }
      result.speedMin = result.speed;

      const description = String(processorObj.Description ?? '').split(' ');
      for (let i = 0; i < description.length; i++) {
        if (description[i].toLowerCase().startsWith('family') && i + 1 < description.length && description[i + 1]) {
          result.family = description[i + 1];
        }
        if (description[i].toLowerCase().startsWith('model') && i + 1 < description.length && description[i + 1]) {
          result.model = description[i + 1];
        }
        if (description[i].toLowerCase().startsWith('stepping') && i + 1 < description.length && description[i + 1]) {
          result.stepping = description[i + 1];
        }
      }
      // socket type
      const socketId = processorObj.UpgradeMethod != null ? String(processorObj.UpgradeMethod) : '';
      if (socketTypes[socketId]) {
        result.socket = socketTypes[socketId];
      }
      const socketByName = getSocketTypesByName(name);
      if (socketByName) {
        result.socket = socketByName;
      }

      // # threads / # cores
      const countProcessors = processors.length;
      const countThreads = processorObj.NumberOfLogicalProcessors;
      const countCores = processorObj.NumberOfCores;
      if (countProcessors) {
        result.processors = countProcessors || 1;
      }
      if (countCores && countThreads) {
        result.cores = Number.parseInt(countThreads, 10) || cpus().length;
        result.physicalCores = Number.parseInt(countCores, 10) || cpus().length;
      }
      if (countProcessors > 1) {
        result.cores = result.cores * countProcessors;
        result.physicalCores = result.physicalCores * countProcessors;
      }
      const hyperv = data[2] ? data[2].toString().toLowerCase() : '';
      result.virtualization = hyperv.indexOf('true') !== -1;
    }

    return result;
  } catch {
    return result;
  }
};
