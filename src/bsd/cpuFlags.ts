'use strict';

import { nextTick } from '../common';
import { execCmd } from '../common/exec';

export const bsdCpuFlags = async () => {
  let result: string = '';
  try {
    const stdout = (await execCmd('export LC_ALL=C; dmidecode -t 4 2>/dev/null; unset LC_ALL')).toString();
    let flagsArray: string[] = [];
    let parts = stdout.toString().split('\tFlags:');
    const parts2: string[] = parts.length > 1 ? parts[1].split('\tVersion:') : [''];
    const lines = parts2[0].split('\n');
    lines.forEach(function (line) {
      let flag = (line.indexOf('(') ? line.split('(')[0].toLowerCase() : '').trim().replace(/\t/g, '');
      if (flag) {
        flagsArray.push(flag);
      }
    });
    result = flagsArray.join(' ').trim().toLowerCase();
    return result;

  } catch (e) {
    return result;
  }
};

export const cpuFlags = async () => {
  await nextTick();
  return bsdCpuFlags();
};
