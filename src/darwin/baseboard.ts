'use strict';

import * as os from 'os';
import { getValue, promiseAll } from '../common';
import { execCmd } from '../common/exec';
import { initBaseboard } from '../common/initials';
import { BaseboardData } from './../common/types';

export const darwinBaseboard = async () => {
  const result = initBaseboard;
  const workload = [];
  workload.push(execCmd('ioreg -c IOPlatformExpertDevice -d 2'));
  workload.push(execCmd('system_profiler SPMemoryDataType'));
  const data = await promiseAll(workload);
  let lines = data.results[0] ? data.results[0].toString().replace(/[<>"]/g, '').split('\n') : [''];
  result.manufacturer = getValue(lines, 'manufacturer', '=', true);
  result.model = getValue(lines, 'model', '=', true);
  result.version = getValue(lines, 'version', '=', true);
  result.serial = getValue(lines, 'ioplatformserialnumber', '=', true);
  result.assetTag = getValue(lines, 'board-id', '=', true);

  // mem
  let devices = data.results[1] ? data.results[1].toString().split('        BANK ') : [''];
  if (devices.length === 1) {
    devices = data.results[1] ? data.results[1].toString().split('        DIMM') : [''];
  }
  devices.shift();
  result.memSlots = devices.length;

  if (os.arch() === 'arm64') {
    result.memSlots = 0;
    result.memMax = os.totalmem();
  }

  return result;
};

export const baseboard = () => {
  return new Promise<BaseboardData>(resolve => {
    process.nextTick(() => {
      return resolve(darwinBaseboard());
    });
  });
};

