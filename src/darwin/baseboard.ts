import { arch, totalmem } from 'node:os';
import { cloneObj, getValue, nextTick } from '../common';
import { plistParser } from './../common/darwin';
import { initBaseboard } from '../common/defaults';
import { exec } from '../common/exec';
import { getAppleModel } from '../common/mappings';

const parseBaseboardObject = (platformData: string, memoryData: string) => {
  const defaults = cloneObj(initBaseboard);

  let memSlots = 1;
  let isUpgradable = true;
  if (memoryData) {
    const memDataObject = plistParser(memoryData);
    if (memDataObject && memDataObject[0] && memDataObject[0]._items) {
      memSlots = memDataObject[0]._items.length;
    }
    if (memDataObject && memDataObject[0] && memDataObject[0].is_memory_upgradeable) {
      isUpgradable = memDataObject[0].is_memory_upgradeable === 'Yes';
    }
  }
  if (arch() === 'arm64') {
    memSlots = 0;
  }
  const lines = platformData.replace(/[<>"]/g, '').split('\n');
  const model = getAppleModel(getValue(lines, 'model', '=', true));

  return {
    ...defaults,
    manufacturer: getValue(lines, 'manufacturer', '=', true),
    model: model.model,
    version: model.version,
    serial: getValue(lines, 'ioplatformserialnumber', '=', true),
    assetTag: getValue(lines, 'board-id', '=', true),
    sku: model.key,
    memSlots,
    memMax: arch() === 'arm64' || !isUpgradable ? totalmem() : null
  };
};

export const baseboard = async () => {
  await nextTick();
  const workload = [];
  workload.push(exec('ioreg -c IOPlatformExpertDevice -d 2'));
  workload.push(exec('system_profiler SPMemoryDataType -xml'));
  const data = await Promise.allSettled(workload).then((results) => results.map((result) => (result.status === 'fulfilled' ? result.value : { stdout: '', stderr: '' })));
  return parseBaseboardObject(data[0].stdout, data[1].stdout);
};
