import { getValue, nextTick } from '../common';
import { MemLayoutData } from '../common/types';
import { execCmd } from '../common/exec';
import { getManufacturerDarwin } from '../common/mappings';

export const darwinMemLayout = async () => {
  const result: MemLayoutData[] = [];
  try {
    const stdout = await execCmd('system_profiler SPMemoryDataType');
    const allLines = stdout.toString().split('\n');
    const eccStatus = getValue(allLines, 'ecc', ':', true).toLowerCase();
    let devices = stdout.toString().split('        BANK ');
    let hasBank = true;
    if (devices.length === 1) {
      devices = stdout.toString().split('        DIMM');
      hasBank = false;
    }
    devices.shift();
    devices.forEach((device: string) => {
      const lines = device.split('\n');
      const bank = (hasBank ? 'BANK ' : 'DIMM') + lines[0].trim().split('/')[0];
      const size = parseInt(getValue(lines, '          Size'));
      if (size) {
        result.push({
          size: size * 1024 * 1024 * 1024,
          bank: bank,
          type: getValue(lines, '          Type:'),
          ecc: eccStatus ? eccStatus === 'enabled' : null,
          clockSpeed: parseInt(getValue(lines, '          Speed:'), 10),
          formFactor: '',
          manufacturer: getManufacturerDarwin(getValue(lines, '          Manufacturer:')),
          partNum: getValue(lines, '          Part Number:'),
          serialNum: getValue(lines, '          Serial Number:'),
          voltageConfigured: null,
          voltageMin: null,
          voltageMax: null,
        });
      } else {
        result.push({
          size: 0,
          bank: bank,
          type: 'Empty',
          ecc: null,
          clockSpeed: 0,
          formFactor: '',
          manufacturer: '',
          partNum: '',
          serialNum: '',
          voltageConfigured: null,
          voltageMin: null,
          voltageMax: null,
        });
      }
    });
    if (!result.length) {
      const lines = stdout.toString().split('\n');
      const size = parseInt(getValue(lines, '      Memory:'));
      const type = getValue(lines, '      Type:');
      if (size && type) {
        result.push({
          size: size * 1024 * 1024 * 1024,
          bank: '0',
          type,
          ecc: false,
          clockSpeed: 0,
          formFactor: '',
          manufacturer: 'Apple',
          partNum: '',
          serialNum: '',
          voltageConfigured: null,
          voltageMin: null,
          voltageMax: null,
        });
      }
    }

  } catch { }
  return result;
};

export const memLayout = async () => {
  await nextTick();
  return darwinMemLayout();
};
