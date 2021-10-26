'use strict';

import { getValue, nextTick, noop, promiseAll, toInt } from '../common';
import { powerShell } from '../common/exec';
import { initBaseboard } from '../common/initials';
import { BaseboardData } from './../common/types';

export const windowsBaseboard = async () => {
  const result = initBaseboard;
  try {
    const workload = [];
    workload.push(powerShell('Get-WmiObject Win32_baseboard | fl *'));
    workload.push(powerShell('Get-WmiObject Win32_physicalmemoryarray | select MaxCapacity, MemoryDevices | fl'));
    const data = await promiseAll(workload);
    let lines = data.results[0] ? data.results[0].toString().split('\r\n') : [''];

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
    lines = data.results[1] ? data.results[1].toString().split('\r\n') : [''];
    result.memMax = toInt(getValue(lines, 'MaxCapacity', ':')) || null;
    result.memSlots = toInt(getValue(lines, 'MemoryDevices', ':')) || null;

  } catch (e) {
    noop();
  }
  return result;
};

export const baseboard = async () => {
  await nextTick();
  return windowsBaseboard();
};

