'use strict';

import { execCmd } from "../common/exec";
import { initOsInfo } from "../common/initials";
import { getLogoFile } from "../common/mappings";
import { OsData } from "../common/types";
import { nextTick, noop } from "../common";

export const sunOsInfo = async () => {
  let result = await initOsInfo();
  try {
    result.release = result.kernel;
    const stdout = await execCmd('uname -o');
    let lines = stdout.toString().split('\n');
    result.distro = lines[0];
    result.logofile = getLogoFile(result.distro);
  } catch (e) {
    noop();
  }
  return result;
};

export const osInfo = async () => {
  await nextTick();
  return sunOsInfo();
};
