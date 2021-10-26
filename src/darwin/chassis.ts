'use strict';

import { getValue, nextTick } from '../common';
import { execCmd } from '../common/exec';
import { initChassis } from '../common/initials';

export const darwinChassis = async () => {
  const result = initChassis;
  const stdout = await execCmd('ioreg -c IOPlatformExpertDevice -d 2');
  if (stdout) {
    const lines = stdout.toString().replace(/[<>"]/g, '').split('\n');
    result.manufacturer = getValue(lines, 'manufacturer', '=', true);
    result.model = getValue(lines, 'model', '=', true);
    result.version = getValue(lines, 'version', '=', true);
    result.serial = getValue(lines, 'ioplatformserialnumber', '=', true);
    result.assetTag = getValue(lines, 'board-id', '=', true);
  }
  return result;
};

export const chassis = async () => {
  await nextTick();
  return darwinChassis();
};

