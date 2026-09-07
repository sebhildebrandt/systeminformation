import { cloneObj, getValue, nextTick } from '../common';
import { DMI_PATH, readSysfsMany } from '../common/files';
import { initChassis } from '../common/defaults';
import { chassisTypes } from '../common/mappings';
import { ChassisData } from '../common/types';
import { cleanDefaults } from '../common/parse';

const parseChassis = (lines: string[], defaults: ChassisData): ChassisData => {
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
  try {
    const lines = await readSysfsMany(DMI_PATH, ['chassis_asset_tag', 'chassis_serial', 'chassis_type', 'chassis_vendor', 'chassis_version']);
    return parseChassis(lines, defaults);
  } catch {}
  return defaults;
};
