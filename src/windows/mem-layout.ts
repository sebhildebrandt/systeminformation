import { nextTick } from '../../common';
import { powerShell } from '../../common/exec';

interface WindowsPhysicalMemory {
  Capacity: number;
  BankLabel: string;
  MemoryType: number;
  SMBIOSMemoryType: number;
  DataWidth: number;
  TotalWidth: number;
  ConfiguredClockSpeed: number;
  Speed: number;
  FormFactor: number;
  Manufacturer: string;
  PartNumber: number;
  SerialNumber: string;
  ConfiguredVoltage: number;
  MinVoltage: number;
  MaxVoltage: number;
}

const memoryTypes = 'Unknown|Other|DRAM|Synchronous DRAM|Cache DRAM|EDO|EDRAM|VRAM|SRAM|RAM|ROM|FLASH|EEPROM|FEPROM|EPROM|CDRAM|3DRAM|SDRAM|SGRAM|RDRAM|DDR|DDR2|DDR2 FB-DIMM|Reserved|DDR3|FBD2|DDR4|LPDDR|LPDDR2|LPDDR3|LPDDR4'.split('|');
const formFactors = 'Unknown|Other|SIP|DIP|ZIP|SOJ|Proprietary|SIMM|DIMM|TSOP|PGA|RIMM|SODIMM|SRIMM|SMD|SSMP|QFP|TQFP|SOIC|LCC|PLCC|BGA|FPBGA|LGA'.split('|');

export const windowsMemLayout = async () => {
  const devices = await powerShell('Get-WmiObject Win32_PhysicalMemory | ConvertTo-Json -Depth 5').then(data => JSON.parse(data) as WindowsPhysicalMemory[]);
  return devices.map(device => ({
    size: device.Capacity,
    bank: device.BankLabel,
    type: memoryTypes[device.MemoryType || device.SMBIOSMemoryType],
    ecc: device.DataWidth && device.TotalWidth ? device.TotalWidth > device.DataWidth : false,
    clockSpeed: device.ConfiguredClockSpeed || device.Speed || 0,
    formFactor: formFactors[device.FormFactor || 0],
    manufacturer: device.Manufacturer,
    partNum: device.PartNumber,
    serialNum: device.SerialNumber,
    voltageConfigured: (device.ConfiguredVoltage || 0) / 1000.0,
    voltageMin: (device.MinVoltage || 0) / 1000.0,
    voltageMax: (device.MaxVoltage || 0) / 1000.0,
  }));
};

export const memLayout = async () => {
  await nextTick();
  return windowsMemLayout();
};
