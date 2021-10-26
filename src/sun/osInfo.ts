'use strict';

import { execCmd } from '../common/exec';
import { initOsInfo } from '../common/initials';
import { getLogoFile } from '../common/mappings';
import { nextTick } from '../common';

export const sunOsInfo = async () => {
  const result = await initOsInfo();
  try {
    result.release = result.kernel;
    const stdout = await execCmd('uname -o');
    const lines = stdout.toString().split('\n');
    result.distro = lines[0];
    result.logofile = getLogoFile(result.distro);
  } catch (e) {
  }
  return result;
};

export const osInfo = async () => {
  await nextTick();
  return sunOsInfo();
};
