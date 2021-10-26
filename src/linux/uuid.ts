'use strict';

import { execCmd } from "./../common/exec";
import { initUUID } from "./../common/initials";
import { promises as fs } from "fs";
import { UuidData } from "./../common/types";
import { getValue, noop } from "./../common";

export const linuxUuid = async () => {
  let result: UuidData = initUUID;
  try {
    const cmd = `echo -n "os: "; cat /var/lib/dbus/machine-id 2> /dev/null; echo;
echo -n "os: "; cat /etc/machine-id 2> /dev/null; echo;
echo -n "hardware: "; cat /sys/class/dmi/id/product_uuid 2> /dev/null; echo;`;
    const stdout = await execCmd(cmd);
    const lines = stdout.toString().split('\n');
    result.os = getValue(lines, 'os').toLowerCase();
    result.hardware = getValue(lines, 'hardware').toLowerCase();
    if (!result.hardware) {
      const lines = (await fs.readFile('/proc/cpuinfo')).toString().split('\n');
      const serial = getValue(lines, 'serial');
      result.hardware = serial || '';
    }
  } catch (e) {
    noop();
  }
  return result;
};

export const uuid = () => {
  return new Promise<UuidData | null>(resolve => {
    process.nextTick(() => {
      return resolve(linuxUuid());
    });
  });
};
