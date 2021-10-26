import * as os from 'os';
import { getValue, nextTick, toInt } from '../common';
import { MemLayoutData } from '../common/types';
import { execCmd } from '../common/exec';
import { getManufacturerLinux, raspberryClockSpeed } from '../common/mappings';

export const nixMemLayout = async () => {
  const result: MemLayoutData[] = [];
  try {

    let stdout = (await execCmd('export LC_ALL=C; dmidecode -t memory 2>/dev/null | grep -iE "Size:|Type|Speed|Manufacturer|Form Factor|Locator|Memory Device|Serial Number|Voltage|Part Number"; unset LC_ALL')).toString();
    const devices = stdout.toString().split('Memory Device');
    devices.shift();
    devices.forEach(function (device) {
      const lines = device.split('\n');
      const sizeString = getValue(lines, 'Size');
      const size = sizeString.indexOf('GB') >= 0 ? parseInt(sizeString, 10) * 1024 * 1024 * 1024 : parseInt(sizeString, 10) * 1024 * 1024;
      if (parseInt(getValue(lines, 'Size'), 10) > 0) {
        const totalWidth = toInt(getValue(lines, 'Total Width'));
        const dataWidth = toInt(getValue(lines, 'Data Width'));
        result.push({
          size,
          bank: getValue(lines, 'Bank Locator'),
          type: getValue(lines, 'Type:'),
          ecc: dataWidth && totalWidth ? totalWidth > dataWidth : false,
          clockSpeed: (getValue(lines, 'Configured Clock Speed:') ? parseInt(getValue(lines, 'Configured Clock Speed:'), 10) : (getValue(lines, 'Speed:') ? parseInt(getValue(lines, 'Speed:'), 10) : null)),
          formFactor: getValue(lines, 'Form Factor:'),
          manufacturer: getManufacturerLinux(getValue(lines, 'Manufacturer:')),
          partNum: getValue(lines, 'Part Number:'),
          serialNum: getValue(lines, 'Serial Number:'),
          voltageConfigured: parseFloat(getValue(lines, 'Configured Voltage:')) || null,
          voltageMin: parseFloat(getValue(lines, 'Minimum Voltage:')) || null,
          voltageMax: parseFloat(getValue(lines, 'Maximum Voltage:')) || null,
        });
      } else {
        result.push({
          size: 0,
          bank: getValue(lines, 'Bank Locator'),
          type: 'Empty',
          ecc: null,
          clockSpeed: 0,
          formFactor: getValue(lines, 'Form Factor:'),
          partNum: '',
          serialNum: '',
          voltageConfigured: null,
          voltageMin: null,
          voltageMax: null,
        });
      }
    });
    if (!result.length) {
      result.push({
        size: os.totalmem(),
        bank: '',
        type: '',
        ecc: null,
        clockSpeed: 0,
        formFactor: '',
        partNum: '',
        serialNum: '',
        voltageConfigured: null,
        voltageMin: null,
        voltageMax: null,
      });

      // Try Raspberry PI
      stdout = (await execCmd('cat /proc/cpuinfo 2>/dev/null')).toString();
      let lines = stdout.split('\n');
      const model = getValue(lines, 'hardware', ':', true).toUpperCase();
      const version = getValue(lines, 'revision', ':', true).toLowerCase();

      if (model === 'BCM2835' || model === 'BCM2708' || model === 'BCM2709' || model === 'BCM2835' || model === 'BCM2837') {

        result[0].type = 'LPDDR2';
        result[0].type = version && version[2] && version[2] === '3' ? 'LPDDR4' : result[0].type;
        result[0].ecc = false;
        result[0].clockSpeed = version && version[2] && raspberryClockSpeed[version[2]] || 400;
        result[0].clockSpeed = version && version[4] && version[4] === 'd' ? 500 : result[0].clockSpeed;
        result[0].formFactor = 'SoC';

        stdout = (await execCmd('vcgencmd get_config sdram_freq 2>/dev/null')).toString();
        lines = stdout.split('\n');
        const freq = parseInt(getValue(lines, 'sdram_freq', '=', true), 10) || 0;
        if (freq) {
          result[0].clockSpeed = freq;
        }

        stdout = (await execCmd('vcgencmd measure_volts sdram_p 2>/dev/null')).toString();
        lines = stdout.split('\n');
        const voltage = parseFloat(getValue(lines, 'volt', '=', true)) || 0;
        if (voltage) {
          result[0].voltageConfigured = voltage;
          result[0].voltageMin = voltage;
          result[0].voltageMax = voltage;
        }
      }
    }
  } catch { }
  return result;
};

export const memLayout = async () => {
  await nextTick();
  return nixMemLayout();
};
