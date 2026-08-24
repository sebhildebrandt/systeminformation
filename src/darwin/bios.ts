import { plistParser } from './../common/darwin';
import { cloneObj, nextTick } from '../common';
import { exec } from '../common/exec';
import { initBios } from '../common/defaults';
import { BiosIBridgeData } from '../common/types';

// iBridge / security chip (T1/T2, Apple Silicon); null if not present
const getIBridgeData = async (): Promise<BiosIBridgeData | null> => {
  try {
    const { stdout } = await exec('system_profiler SPiBridgeDataType -xml');
    const iBridgeData = plistParser(stdout);
    if (iBridgeData && iBridgeData.length) {
      return {
        modelName: iBridgeData[0].ibridge_model_name || '',
        build: iBridgeData[0].ibridge_build || '',
        bootUuid: iBridgeData[0].ibridge_boot_uuid || '',
        secureBoot: iBridgeData[0].ibridge_secure_boot || ''
      };
    }
  } catch {}
  return null;
};

export const bios = async () => {
  await nextTick();
  const defaults = cloneObj(initBios);
  let bootRomVersion: string | null = initBios.version;
  try {
    const { stdout } = await exec('system_profiler SPHardwareDataType -xml');
    const hardwareData = plistParser(stdout);
    if (hardwareData && hardwareData.length) {
      bootRomVersion = hardwareData[0].boot_rom_version;
      bootRomVersion = bootRomVersion ? bootRomVersion.split('(')[0].trim() : null;
    }
  } catch {}
  const iBridge = await getIBridgeData();
  return {
    ...defaults,
    vendor: 'Apple Inc.',
    version: bootRomVersion,
    ...(iBridge ? { iBridge } : {})
  };
};
