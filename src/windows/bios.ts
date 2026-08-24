import { cloneObj, getValue, nextTick } from '../common';
import { initBios } from '../common/defaults';
import { cleanDefaults } from '../common/parse';
import { ps } from '../common/windows';

export const bios = async () => {
  await nextTick();
  const result = cloneObj(initBios);
  try {
    const stdout = await ps.exec(
      'Get-CimInstance Win32_bios | select Description,Version,Manufacturer,@{n="ReleaseDate";e={$_.ReleaseDate.ToString("yyyy-MM-dd")}},BuildNumber,SerialNumber,SMBIOSBIOSVersion | fl'
    );
    if (stdout) {
      const lines = stdout.toString().split('\r\n');
      const description = getValue(lines, 'description', ':');
      const version = getValue(lines, 'SMBIOSBIOSVersion', ':');
      if (description.indexOf(' Version ') !== -1) {
        // ... Phoenix ROM BIOS PLUS Version 1.10 A04
        result.vendor = description.split(' Version ')[0].trim();
        result.version = description.split(' Version ')[1].trim();
      } else if (description.indexOf(' Ver: ') !== -1) {
        // ... BIOS Date: 06/27/16 17:50:16 Ver: 1.4.5
        result.vendor = getValue(lines, 'manufacturer', ':');
        result.version = description.split(' Ver: ')[1].trim();
      } else {
        result.vendor = getValue(lines, 'manufacturer', ':');
        result.version = version || getValue(lines, 'version', ':');
      }
      result.releaseDate = getValue(lines, 'releasedate', ':');
      result.revision = getValue(lines, 'buildnumber', ':');
      result.serial = cleanDefaults(getValue(lines, 'serialnumber', ':'));
    }
  } catch {}

  return result;
};
