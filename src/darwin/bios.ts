import { cloneObj, nextTick } from '../common';
import { execCmd } from '../common/exec';
import { initBios } from '../common/defaults';

export const darwinBios = async () => {
  const result = cloneObj(initBios);
  result.vendor = 'Apple Inc.';
  const stdout = await execCmd('system_profiler SPHardwareDataType -json');
  try {
    const hardwareData = JSON.parse(stdout.toString());
    if (hardwareData && hardwareData.SPHardwareDataType && hardwareData.SPHardwareDataType.length) {
      let bootRomVersion = hardwareData.SPHardwareDataType[0].boot_rom_version;
      bootRomVersion = bootRomVersion ? bootRomVersion.split('(')[0].trim() : null;
      result.version = bootRomVersion;
    }
  } catch { }
  return result;
};

export const bios = async () => {
  await nextTick();
  return darwinBios();
};
