'use strict';

import { nextTick, noop } from '../common';
import { execCmd } from '../common/exec';
import { initBios } from '../common/initials';
import { BiosData } from './../common/types';

export const darwinBios = async () => {
  const result = initBios;
  result.vendor = 'Apple Inc.';
  const stdout = await execCmd('system_profiler SPHardwareDataType -json');
  try {
    const hardwareData = JSON.parse(stdout.toString());
    if (hardwareData && hardwareData.SPHardwareDataType && hardwareData.SPHardwareDataType.length) {
      let bootRomVersion = hardwareData.SPHardwareDataType[0].boot_rom_version;
      bootRomVersion = bootRomVersion ? bootRomVersion.split('(')[0].trim() : null;
      result.version = bootRomVersion;
    }
  } catch (e) {
    noop();
  }
  return result;
};

export const bios = async () => {
  await nextTick();
  return darwinBios();
};
