import { BiosData } from './../common/types';
import { cloneObj, getValue, nextTick } from '../common';
import { initBios } from '../common/defaults';
import { parseDateTime } from '../common/datetime';
import { execSave } from '../common/exec';
import { DMI_PATH, readFileLines, readSysfsMany } from '../common/files';
import { execOptsLinux } from '../common/const';

export const bios = async () => {
  await nextTick();
  const result: BiosData = cloneObj(initBios);
  let lines =
    process.arch === 'arm'
      ? (await readFileLines('/proc/cpuinfo')).filter((line) => line.indexOf('Serial') >= 0)
      : (await execSave('export LC_ALL=C; dmidecode -t bios 2>/dev/null; unset LC_ALL', execOptsLinux)).stdout.split('\n');
  result.vendor = getValue(lines, 'Vendor');
  result.version = getValue(lines, 'Version');
  let datetime = getValue(lines, 'Release Date');
  result.releaseDate = parseDateTime(datetime).date;
  result.revision = getValue(lines, 'BIOS Revision');
  result.serial = getValue(lines, 'SerialNumber');
  const language = getValue(lines, 'Currently Installed Language').split('|')[0];
  if (language) {
    result.language = language;
  }
  if (lines.some((line: string) => line.indexOf('Characteristics:') >= 0)) {
    const features: string[] = [];
    lines.forEach((line: string) => {
      if (line.indexOf(' is supported') >= 0) {
        const feature = line.split(' is supported')[0].trim();
        features.push(feature);
      }
    });
    result.features = features;
  }
  // Non-Root values
  try {
    lines = await readSysfsMany(DMI_PATH, ['bios_date', 'bios_vendor', 'bios_version']);
    result.vendor = !result.vendor ? getValue(lines, 'bios_vendor') : result.vendor;
    result.version = !result.version ? getValue(lines, 'bios_version') : result.version;
    datetime = getValue(lines, 'bios_date');
    result.releaseDate = !result.releaseDate ? parseDateTime(datetime).date : result.releaseDate;
  } catch {}
  return result;
};
