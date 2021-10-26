'use strict';

import { execCmd } from '../common/exec';

export const darwinCpuFlags = async () => {
  let result: string = '';
  const stdout = (await execCmd('sysctl machdep.cpu.features')).toString();
  let lines = stdout.split('\n');
  if (lines.length > 0 && lines[0].indexOf('machdep.cpu.features:') !== -1) {
    result = lines[0].split(':')[1].trim().toLowerCase();
  }
  return result;
};

export const cpuFlags = () => {
  return new Promise<string>(resolve => {
    process.nextTick(() => {
      return resolve(darwinCpuFlags());
    });
  });
};
