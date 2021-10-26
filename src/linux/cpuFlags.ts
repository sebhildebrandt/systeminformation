'use strict';

import { promises as fs } from "fs";
import { execCmd } from '../common/exec';
import { getValue, nextTick } from '../common';

export const linuxCpuFlags = async () => {
  let result: string = '';
  try {

    let stdout = (await execCmd('export LC_ALL=C; lscpu; unset LC_ALL')).toString();
    let lines = stdout.toString().split('\n');
    lines.forEach((line: string) => {
      if (line.split(':')[0].toUpperCase().indexOf('FLAGS') !== -1) {
        result = line.split(':')[1].trim().toLowerCase();
      }
    });
    if (!result) {
      stdout = (await fs.readFile('/proc/cpuinfo')).toString();
      let lines = stdout.toString().split('\n');
      result = getValue(lines, 'features', ':', true).toLowerCase();
      return result;
    } else {
      return result;
    }
  } catch (e) {
    return result;
  }
};

export const cpuFlags = async () => {
  await nextTick();
  return linuxCpuFlags();
};
