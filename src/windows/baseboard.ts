import { getValue, nextTick, toInt } from '../common';
import { powerShell } from '../common/exec';
import { initBaseboard } from '../common/defaults';

export const windowsBaseboard = async () => {
  const result = initBaseboard;
  try {
    const workload = [];
    workload.push(powerShell('Get-WmiObject Win32_baseboard | fl *'));
    workload.push(powerShell('Get-WmiObject Win32_physicalmemoryarray | select MaxCapacity, MemoryDevices | fl'));
    const data = await Promise.allSettled(workload).then(results => results.map(result => result.status === 'fulfilled' ? result.value : null));
    let lines = data[0] ? data[0].toString().split('\r\n') : [''];

    result.manufacturer = getValue(lines, 'manufacturer', ':');
    result.model = getValue(lines, 'model', ':');
    if (!result.model) {
      result.model = getValue(lines, 'product', ':');
    }
    result.version = getValue(lines, 'version', ':');
    result.serial = getValue(lines, 'serialnumber', ':');
    result.assetTag = getValue(lines, 'partnumber', ':');
    if (!result.assetTag) {
      result.assetTag = getValue(lines, 'sku', ':');
    }

    // memphysical
    lines = data[1] ? data[1].toString().split('\r\n') : [''];
    result.memMax = toInt(getValue(lines, 'MaxCapacity', ':')) || null;
    result.memSlots = toInt(getValue(lines, 'MemoryDevices', ':')) || null;

  } catch { }
  return result;
};

export const baseboard = async () => {
  await nextTick();
  return windowsBaseboard();
};

