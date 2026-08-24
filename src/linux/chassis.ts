import { cloneObj, getValue, nextTick } from '../common';
import { execSave } from '../common/exec';
import { initChassis } from '../common/defaults';
import { chassisTypes } from '../common/mappings';
import { ChassisData } from '../common/types';
import { cleanDefaults } from '../common/parse';

const parseChassis = (stdout: string, defaults: ChassisData): ChassisData => {
  const lines = stdout.toString().split('\n');
  const manufacturer = cleanDefaults(getValue(lines, 'chassis_vendor'));
  const ctype = parseInt(getValue(lines, 'chassis_type').replace(/\D/g, ''));
  const chassisType = ctype && !isNaN(ctype) && ctype <= chassisTypes.length ? chassisTypes[ctype - 1] : '';
  const version = cleanDefaults(getValue(lines, 'chassis_version'));
  const serial = cleanDefaults(getValue(lines, 'chassis_serial'));
  const assetTag = cleanDefaults(getValue(lines, 'chassis_asset_tag'));

  return {
    ...defaults,
    manufacturer,
    type: chassisType,
    version,
    serial,
    assetTag
  };
};

export const chassis = async () => {
  await nextTick();
  const defaults = cloneObj(initChassis);
  const cmd = `echo -n "chassis_asset_tag: "; cat /sys/devices/virtual/dmi/id/chassis_asset_tag 2>/dev/null; echo;
            echo -n "chassis_serial: "; cat /sys/devices/virtual/dmi/id/chassis_serial 2>/dev/null; echo;
            echo -n "chassis_type: "; cat /sys/devices/virtual/dmi/id/chassis_type 2>/dev/null; echo;
            echo -n "chassis_vendor: "; cat /sys/devices/virtual/dmi/id/chassis_vendor 2>/dev/null; echo;
            echo -n "chassis_version: "; cat /sys/devices/virtual/dmi/id/chassis_version 2>/dev/null; echo;`;
  try {
    const { stdout } = await execSave(cmd);
    return parseChassis(stdout, defaults);
  } catch {}
  return defaults;
};
