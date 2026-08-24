import { readFile } from 'fs/promises';
import { exec } from '../common/exec';
import { getValue, nextTick } from '../common';
import { execOptsLinux } from '../common/const';

export const cpuFlags = async () => {
  await nextTick();
  let result = '';
  try {
    let { stdout } = await exec('export LC_ALL=C; lscpu; unset LC_ALL', execOptsLinux);
    const lines = stdout.toString().split('\n');
    lines.forEach((line: string) => {
      if (line.split(':')[0].toUpperCase().indexOf('FLAGS') !== -1) {
        result = line.split(':')[1].trim().toLowerCase();
      }
    });
    if (!result) {
      stdout = (await readFile('/proc/cpuinfo')).toString();
      const lines = stdout.toString().split('\n');
      result = getValue(lines, 'features', ':', true).toLowerCase();
      return result;
    } else {
      return result;
    }
  } catch (e) {
    return result;
  }
};
