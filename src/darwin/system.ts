'use strict';

import { getValue } from '../common';
import { execCmd } from '../common/exec';
import { initSystem } from '../common/initials';
import { SystemData } from './../common/types';

export const darwinSystem = async () => {
  const result = initSystem;
  const stdout = await execCmd('ioreg -c IOPlatformExpertDevice -d 2');
  if (stdout) {
    let lines = stdout.toString().replace(/[<>"]/g, '').split('\n');
    result.manufacturer = getValue(lines, 'manufacturer', '=', true);
    result.model = getValue(lines, 'model', '=', true);
    result.version = getValue(lines, 'version', '=', true);
    result.serial = getValue(lines, 'ioplatformserialnumber', '=', true);
    result.uuid = getValue(lines, 'ioplatformuuid', '=', true).toLowerCase();
    result.sku = getValue(lines, 'board-id', '=', true);
  }
  return result;
};

export const system = () => {
  return new Promise<SystemData>(resolve => {
    process.nextTick(() => {
      return resolve(darwinSystem());
    });
  });
};

