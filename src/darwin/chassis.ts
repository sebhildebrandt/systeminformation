'use strict';

import { getValue } from "../common";
import { execCmd } from "../common/exec";
import { initChassis } from "../common/initials";
import { ChassisData } from './../common/types';

export const darwinChassis = async () => {
  const result = initChassis;
  const stdout = await execCmd('ioreg -c IOPlatformExpertDevice -d 2');
  if (stdout) {
    let lines = stdout.toString().replace(/[<>"]/g, '').split('\n');
    result.manufacturer = getValue(lines, 'manufacturer', '=', true);
    result.model = getValue(lines, 'model', '=', true);
    result.version = getValue(lines, 'version', '=', true);
    result.serial = getValue(lines, 'ioplatformserialnumber', '=', true);
    result.assetTag = getValue(lines, 'board-id', '=', true);
  }
  return result;
};

export const chassis = () => {
  return new Promise<ChassisData>(resolve => {
    process.nextTick(() => {
      return resolve(darwinChassis());
    });
  });
};

