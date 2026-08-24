import { plistParser } from './../common/darwin';
import { exec } from '../common/exec';
import { initUUID } from '../common/defaults';
import { UuidData } from '../common/types';
import { nextTick } from '../common';
import { diskLayout } from './disk-layout';

export const uuid = async () => {
  await nextTick();
  const defaults: UuidData = initUUID;
  let os = defaults.os;
  let hardware = defaults.hardware;
  try {
    const { stdout } = await exec('system_profiler SPHardwareDataType -xml');
    const jsonObj = plistParser(stdout.toString());
    if (jsonObj && jsonObj.length > 0) {
      const spHardware = jsonObj[0];
      os = spHardware.platform_UUID.toLowerCase();
      hardware = spHardware.serial_number;
    }
    const blockDevs = await diskLayout();
    const disks: string[] = [];
    blockDevs.forEach((dev) => {
      if (dev.serialNum) {
        disks.push(dev.serialNum);
      }
    });

    return {
      ...defaults,
      os,
      hardware,
      disks
    };
  } catch {}
  return defaults;
};
