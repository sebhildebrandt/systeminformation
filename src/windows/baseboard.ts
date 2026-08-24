import { release } from 'node:os';
import { cloneObj, nextTick } from '../common';
import { initBaseboard } from '../common/defaults';
import { cleanDefaults } from '../common/parse';
import { ps, psArray } from '../common/windows';

export const baseboard = async () => {
  await nextTick();
  const result = cloneObj(initBaseboard);
  try {
    const workload = [];
    const win10plus = Number.parseInt(release(), 10) >= 10;
    const maxCapacityAttribute = win10plus ? 'MaxCapacityEx' : 'MaxCapacity';

    workload.push(ps.exec('Get-CimInstance Win32_baseboard | select Model,Manufacturer,Product,Version,SerialNumber,PartNumber,SKU | ConvertTo-Json -Depth 5'));
    workload.push(ps.exec(`Get-CimInstance Win32_physicalmemoryarray | select ${maxCapacityAttribute}, MemoryDevices | ConvertTo-Json -Depth 5`));
    const data = await Promise.allSettled(workload).then((results) => results.map((result) => (result.status === 'fulfilled' ? result.value : null)));
    const baseBoard = psArray(data[0])[0] || {};
    const physicalMemory = psArray(data[1])[0] || {};
    return {
      ...result,
      manufacturer: cleanDefaults(baseBoard.Manufacturer || ''),
      model: cleanDefaults(baseBoard.Model || '') || cleanDefaults(baseBoard.Product || ''),
      version: cleanDefaults(baseBoard.Version || ''),
      serial: cleanDefaults(baseBoard.SerialNumber || ''),
      assetTag: cleanDefaults(baseBoard.PartNumber || '') || cleanDefaults(baseBoard.SKU || ''),
      memMax: Number(physicalMemory[maxCapacityAttribute]) * (win10plus ? 1024 : 1) || null,
      memSlots: Number(physicalMemory.MemoryDevices) || null
    };
  } catch {}
  return result;
};
