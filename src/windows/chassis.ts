import { cloneObj, getValue, nextTick } from '../common';
import { initChassis } from '../common/defaults';
import { chassisTypes } from '../common/mappings';
import { cleanDefaults } from '../common/parse';
import { ps } from '../common/windows';

export const chassis = async () => {
  await nextTick();
  const result = cloneObj(initChassis);
  try {
    const stdout = await ps.exec('Get-CimInstance Win32_SystemEnclosure | select Model,Manufacturer,ChassisTypes,Version,SerialNumber,PartNumber,SKU,SMBIOSAssetTag | fl');
    if (stdout) {
      const lines = stdout.toString().split('\r\n');

      result.manufacturer = cleanDefaults(getValue(lines, 'manufacturer', ':'));
      result.model = cleanDefaults(getValue(lines, 'model', ':'));
      const ctype = Number.parseInt(getValue(lines, 'ChassisTypes', ':').replace(/\D/g, ''), 10);
      result.type = ctype && !Number.isNaN(ctype) && ctype <= chassisTypes.length ? chassisTypes[ctype - 1] : '';
      result.version = cleanDefaults(getValue(lines, 'version', ':'));
      result.serial = cleanDefaults(getValue(lines, 'serialnumber', ':'));
      result.assetTag = cleanDefaults(getValue(lines, 'partnumber', ':')) || cleanDefaults(getValue(lines, 'SMBIOSAssetTag', ':'));
      result.sku = cleanDefaults(getValue(lines, 'sku', ':'));
    }
  } catch {}
  return result;
};
