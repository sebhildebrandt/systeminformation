import { getMemManufacturer } from '../common/mappings';
import { splitByNumber } from '../common/parse';
import { nextTick } from '../common';
import type { MemLayoutData } from '../common/types';
import { ps, psArray } from '../common/windows';

// https://www.dmtf.org/sites/default/files/standards/documents/DSP0134_3.4.0a.pdf
const memoryTypes =
  'Unknown|Other|DRAM|Synchronous DRAM|Cache DRAM|EDO|EDRAM|VRAM|SRAM|RAM|ROM|FLASH|EEPROM|FEPROM|EPROM|CDRAM|3DRAM|SDRAM|SGRAM|RDRAM|DDR|DDR2|DDR2 FB-DIMM|Reserved|DDR3|FBD2|DDR4|LPDDR|LPDDR2|LPDDR3|LPDDR4|Logical non-volatile device|HBM|HBM2|DDR5|LPDDR5'.split(
    '|'
  );
const formFactors = 'Unknown|Other|SIP|DIP|ZIP|SOJ|Proprietary|SIMM|DIMM|TSOP|PGA|RIMM|SODIMM|SRIMM|SMD|SSMP|QFP|TQFP|SOIC|LCC|PLCC|BGA|FPBGA|LGA'.split('|');

export const memLayout = async (): Promise<MemLayoutData[]> => {
  await nextTick();
  try {
    const devices = psArray(
      await ps.exec(
        'Get-CimInstance Win32_PhysicalMemory | select DataWidth,TotalWidth,Capacity,BankLabel,MemoryType,SMBIOSMemoryType,ConfiguredClockSpeed,Speed,FormFactor,Manufacturer,PartNumber,SerialNumber,ConfiguredVoltage,MinVoltage,MaxVoltage,Tag | ConvertTo-Json -Depth 5'
      )
    );

    return devices
      .filter((device: any) => device && Number(device.Capacity))
      .map((device: any) => {
        const tag = device.Tag || '';
        return {
          size: Number(device.Capacity),
          bank: (device.BankLabel || '') + (tag && splitByNumber(tag)[1] ? `/${splitByNumber(tag)[1]}` : ''),
          channel: null,
          type: memoryTypes[device.MemoryType || device.SMBIOSMemoryType || 0] || 'Unknown',
          ecc: device.DataWidth && device.TotalWidth ? device.TotalWidth > device.DataWidth : false,
          clockSpeed: device.ConfiguredClockSpeed || device.Speed || 0,
          formFactor: formFactors[device.FormFactor || 0] || '',
          manufacturer: getMemManufacturer(device.Manufacturer || ''),
          partNum: (device.PartNumber || '').trim(),
          serialNum: (device.SerialNumber || '').trim(),
          voltageConfigured: (device.ConfiguredVoltage || 0) / 1000.0,
          voltageMin: (device.MinVoltage || 0) / 1000.0,
          voltageMax: (device.MaxVoltage || 0) / 1000.0
        };
      });
  } catch {
    return [];
  }
};
