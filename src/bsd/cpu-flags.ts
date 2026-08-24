import { nextTick } from '../common';
import { exec } from '../common/exec';

export const cpuFlags = async () => {
  await nextTick();
  let result = '';
  try {
    const { stdout } = await exec('dmidecode -t 4');
    const flagsArray: string[] = [];
    const parts = stdout.toString().split('\tFlags:');
    const parts2: string[] = parts.length > 1 ? parts[1].split('\tVersion:') : [''];
    const lines = parts2[0].split('\n');
    lines.forEach((line) => {
      const flag = (line.indexOf('(') ? line.split('(')[0].toLowerCase() : '').trim().replace(/\t/g, '');
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
