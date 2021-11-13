import { nextTick } from '../../common';
import { powerShell } from '../../common/exec';

interface WindowsBaseboard {
  Manufacturer: string;
  Product: string;
  Model: string;
  Version: string;
  SerialNumber: string;
  PartNumber: string;
  SKU: string;
}

export const windowsBaseboard = async () => {
  const baseboard = await powerShell('Get-WmiObject Win32_baseboard | ConvertTo-Json -Depth 5').then(data => JSON.parse(data) as WindowsBaseboard);
  const { MaxCapacity, MemoryDevices } = await powerShell('Get-WmiObject Win32_physicalmemoryarray | select MaxCapacity, MemoryDevices | ConvertTo-Json')
    .then(data => JSON.parse(data) as { MaxCapacity: number, MemoryDevices: number});

  return {
    manufacturer: baseboard.Manufacturer,
    model: baseboard.Model ?? baseboard.Product,
    version: baseboard.Version,
    serial: baseboard.SerialNumber,
    assetTag: baseboard.PartNumber ?? baseboard.SKU,
    memMax: MaxCapacity,
    memSlots: MemoryDevices
  };
};

export const baseboard = async () => {
  await nextTick();
  return windowsBaseboard();
};
