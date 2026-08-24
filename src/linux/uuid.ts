import { readFile } from 'fs/promises';
import { getValue, nextTick } from '../common';
import { initUUID } from '../common/defaults';
import { execSave } from '../common/exec';
import { UuidData } from '../common/types';
import { diskLayout } from './disk-layout';

export const uuid = async () => {
  await nextTick();
  const defaults: UuidData = initUUID;
  try {
    const cmd = `echo -n "os: "; cat /var/lib/dbus/machine-id 2> /dev/null ||
cat /etc/machine-id 2> /dev/null; echo;
echo -n "hardware: "; cat /sys/class/dmi/id/product_uuid 2> /dev/null; echo;
echo -n "systemuuid: "; cat /sys/devices/virtual/dmi/id/product_uuid 2>/dev/null; echo;`;
    const { stdout } = await execSave(cmd);
    const lines = stdout.toString().split('\n');
    const os = getValue(lines, 'os').toLowerCase();
    let hardware = getValue(lines, 'hardware').toLowerCase();
    const systemuuid = getValue(lines, 'systemuuid').toLowerCase();
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
