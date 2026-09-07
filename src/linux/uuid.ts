import { readFile } from 'fs/promises';
import { getValue, nextTick } from '../common';
import { initUUID } from '../common/defaults';
import { DMI_PATH, readSysfs } from '../common/files';
import { UuidData } from '../common/types';
import { diskLayout } from './disk-layout';

export const uuid = async () => {
  await nextTick();
  const defaults: UuidData = initUUID;
  try {
    const os = ((await readSysfs('/var/lib/dbus/machine-id')) || (await readSysfs('/etc/machine-id'))).toLowerCase();
    let hardware = (await readSysfs('/sys/class/dmi/id/product_uuid')).toLowerCase();
    const systemuuid = (await readSysfs(`${DMI_PATH}/product_uuid`)).toLowerCase();
    if (!hardware) {
      const lines = (await readFile('/proc/cpuinfo')).toString().split('\n');
      const serial = getValue(lines, 'serial');
      hardware = serial || systemuuid || '';
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
