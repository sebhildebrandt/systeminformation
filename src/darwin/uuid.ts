'use strict';

import { execCmd } from "./../common/exec";
import { initUUID } from "./../common/initials";
import { UuidData } from "./../common/types";
import { noop } from "./../common";

export const darwinUuid = async () => {
  let result: UuidData = initUUID;
  try {
    const stdout = await execCmd('system_profiler SPHardwareDataType -json');
    const jsonObj = JSON.parse(stdout.toString());
    if (jsonObj.SPHardwareDataType && jsonObj.SPHardwareDataType.length > 0) {
      const spHardware = jsonObj.SPHardwareDataType[0];
      result.os = spHardware.platform_UUID.toLowerCase();
      result.hardware = spHardware.serial_number;
    }
  } catch (e) {
    noop();
  }
  return result;
};

export const uuid = () => {
  return new Promise<UuidData | null>(resolve => {
    process.nextTick(() => {
      return resolve(darwinUuid());
    });
  });
};
