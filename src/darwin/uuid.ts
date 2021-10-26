import { execCmd } from '../common/exec';
import { initUUID } from '../common/defaults';
import { UuidData } from '../common/types';
import { nextTick } from '../common';

export const darwinUuid = async () => {
  const result: UuidData = initUUID;
  try {
    const stdout = await execCmd('system_profiler SPHardwareDataType -json');
    const jsonObj = JSON.parse(stdout.toString());
    if (jsonObj.SPHardwareDataType && jsonObj.SPHardwareDataType.length > 0) {
      const spHardware = jsonObj.SPHardwareDataType[0];
      result.os = spHardware.platform_UUID.toLowerCase();
      result.hardware = spHardware.serial_number;
    }
  } catch { }
  return result;
};

export const uuid = async () => {
  await nextTick();
  return darwinUuid();
};
