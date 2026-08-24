import { totalmem } from 'node:os';
import { nextTick, toInt } from '../common';
import { plistParser } from './../common/darwin';
import { exec } from '../common/exec';
import { getMemManufacturer } from '../common/mappings';
import type { MemLayoutData } from '../common/types';

type DarwinMemObject = {
  _name: string;
  dimm_size: string;
  dimm_type: string;
  dimm_speed: string;
  dimm_part_number: string;
  dimm_serial_number: string;
  dimm_manufacturer: string;
};

export const memLayout = async () => {
  await nextTick();
  const result: MemLayoutData[] = [];
  try {
    const { stdout } = await exec('system_profiler SPMemoryDataType -xml');
    const memData = plistParser(stdout);
    if (memData && memData[0] && memData[0]._items) {
      const eccStatus = memData[0].global_ecc_state ? memData[0].global_ecc_state.indexOf('enabled') >= 0 : false;
      memData[0]._items.forEach((item: DarwinMemObject) => {
        const sizeString = (item.dimm_size || '').toLowerCase();
        const sizeUnit = sizeString.indexOf('mb') >= 0 ? 1024 * 1024 : sizeString.indexOf('tb') >= 0 ? 1024 * 1024 * 1024 * 1024 : 1024 * 1024 * 1024;
        const size = toInt(item.dimm_size) * sizeUnit;
        const name = item._name.trim();
        result.push({
          size: size,
          bank: name.split('/')[0],
          channel: name.split('/')[1] ? name.split('/')[1] : '',
          type: item.dimm_type || 'empty',
          ecc: eccStatus,
          clockSpeed: toInt(item.dimm_speed),
          formFactor: '',
          manufacturer: getMemManufacturer(item.dimm_manufacturer),
          partNum: item.dimm_part_number || '',
          serialNum: item.dimm_serial_number || '',
          voltageConfigured: null,
          voltageMin: null,
          voltageMax: null
        });
      });
    }

    if (!result.length) {
      result.push({
        size: totalmem(),
        bank: null,
        channel: null,
        type: memData[0].dimm_type || 'SOC',
        ecc: false,
        clockSpeed: null,
        formFactor: 'SOC',
        manufacturer: memData[0].dimm_manufacturer || 'Apple',
        partNum: '',
        serialNum: '',
        voltageConfigured: null,
        voltageMin: null,
        voltageMax: null
      });
    }
  } catch {}
  return result;
};
