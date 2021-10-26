'use strict';

import { execCmd } from '../common/exec';
import { initUUID } from '../common/initials';
import { UuidData } from '../common/types';
import { getValue, nextTick, noop } from '../common';

export const bsdUuid = async () => {
  let result: UuidData = initUUID;
  try {
    const cmd = `echo -n "os: "; sysctl -n kern.hostid; echo;
echo -n "hardware: "; sysctl -n kern.hostuuid; echo;`;
    const stdout = await execCmd(cmd);
    const lines = stdout.toString().split('\n');
    result.os = getValue(lines, 'os').toLowerCase();
    result.hardware = getValue(lines, 'hardware').toLowerCase();
    if (result.os.indexOf('unknown') >= 0) { result.os = ''; }
    if (result.hardware.indexOf('unknown') >= 0) { result.hardware = ''; }
  } catch (e) {
    noop();
  }
  return result;
};

export const uuid = async () => {
  await nextTick();
  return bsdUuid();
};
