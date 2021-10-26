'use strict';

import { getValue, nextTick, toInt } from '../common';
import { MemLayoutData } from '../common/types';
import { powerShell } from '../common/exec';

export const windowsMemLayout = async () => {
  const result: MemLayoutData[] = [];
  try {
    const memoryTypes = 'Unknown|Other|DRAM|Synchronous DRAM|Cache DRAM|EDO|EDRAM|VRAM|SRAM|RAM|ROM|FLASH|EEPROM|FEPROM|EPROM|CDRAM|3DRAM|SDRAM|SGRAM|RDRAM|DDR|DDR2|DDR2 FB-DIMM|Reserved|DDR3|FBD2|DDR4|LPDDR|LPDDR2|LPDDR3|LPDDR4'.split('|');
    const FormFactors = 'Unknown|Other|SIP|DIP|ZIP|SOJ|Proprietary|SIMM|DIMM|TSOP|PGA|RIMM|SODIMM|SRIMM|SMD|SSMP|QFP|TQFP|SOIC|LCC|PLCC|BGA|FPBGA|LGA'.split('|');

    const stdout = await powerShell('Get-WmiObject Win32_PhysicalMemory | fl *');
    const devices = stdout.toString().split(/\n\s*\n/);
    devices.shift();
    devices.forEach(function (device) {
      const lines = device.split('\r\n');
      const dataWidth = toInt(getValue(lines, 'DataWidth', ':'));
      const totalWidth = toInt(getValue(lines, 'TotalWidth', ':'));
      const size = parseInt(getValue(lines, 'Capacity', ':'), 10) || 0;
      if (size) {
        result.push({
          size,
          bank: getValue(lines, 'BankLabel', ':'), // BankLabel
          type: memoryTypes[parseInt(getValue(lines, 'MemoryType', ':'), 10) || parseInt(getValue(lines, 'SMBIOSMemoryType', ':'), 10)],
          ecc: dataWidth && totalWidth ? totalWidth > dataWidth : false,
          clockSpeed: parseInt(getValue(lines, 'ConfiguredClockSpeed', ':'), 10) || parseInt(getValue(lines, 'Speed', ':'), 10) || 0,
          formFactor: FormFactors[parseInt(getValue(lines, 'FormFactor', ':'), 10) || 0],
          manufacturer: getValue(lines, 'Manufacturer', ':'),
          partNum: getValue(lines, 'PartNumber', ':'),
          serialNum: getValue(lines, 'SerialNumber', ':'),
          voltageConfigured: (parseInt(getValue(lines, 'ConfiguredVoltage', ':'), 10) || 0) / 1000.0,
          voltageMin: (parseInt(getValue(lines, 'MinVoltage', ':'), 10) || 0) / 1000.0,
          voltageMax: (parseInt(getValue(lines, 'MaxVoltage', ':'), 10) || 0) / 1000.0,
        });
      }
    });
  } catch (e) {
  }
  return result;
};

export const memLayout = async () => {
  await nextTick();
  return windowsMemLayout();
};
