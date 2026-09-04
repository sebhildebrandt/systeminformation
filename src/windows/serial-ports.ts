import { cloneObj, nextTick } from '../common';
import { initSerialPortResult } from '../common/defaults';
import type { SerialPortData, SerialPortType } from '../common/types';
import { ps, psArray } from '../common/windows';

const matchId = (deviceId: string, key: string) => {
  const match = new RegExp(`${key}_([0-9A-Fa-f]{4})`).exec(deviceId);
  return match?.[1] ? match[1].toLowerCase() : null;
};

const parseSerial = (deviceId: string) => {
  // FTDI keeps the serial in the middle segment and a plain index last
  const ftdi = /PID_[0-9A-Fa-f]{4}\+([^+\\]+)/.exec(deviceId);
  if (ftdi?.[1]) {
    return ftdi[1];
  }
  const last = deviceId.split('\\').pop() || '';
  // an instance id containing & is derived from the bus location, not a serial
  return last && !last.includes('&') ? last : null;
};

const parseType = (deviceId: string): SerialPortType => {
  const id = deviceId.toUpperCase();
  if (id.startsWith('USB\\') || id.startsWith('FTDIBUS\\')) {
    return 'usb';
  }
  if (id.startsWith('BTHENUM') || id.startsWith('BTHLE')) {
    return 'bluetooth';
  }
  if (id.startsWith('PCI\\')) {
    return 'pci';
  }
  if (id.startsWith('ACPI\\')) {
    return 'onboard';
  }
  if (id.startsWith('ROOT\\') || id.startsWith('SW\\') || id.startsWith('UMB\\')) {
    return 'virtual';
  }
  return 'unknown';
};

export const parseSerialPorts = (devices: any[]): SerialPortData[] => {
  const result: SerialPortData[] = [];
  for (const device of devices) {
    const name = (device.Name || '').trim();
    const port = /\((COM\d+)\)/.exec(name);
    if (!port?.[1]) {
      continue;
    }
    const deviceId = device.DeviceID || device.PNPDeviceID || '';
    const type = parseType(deviceId);
    result.push({
      ...cloneObj(initSerialPortResult),
      device: port[1],
      name: name.replace(/\s*\(COM\d+\)\s*$/, '') || port[1],
      manufacturer: (device.Manufacturer || '').trim() || null,
      serialNumber: type === 'usb' ? parseSerial(deviceId) : null,
      vendorId: matchId(deviceId, 'VID'),
      productId: matchId(deviceId, 'PID'),
      pnpId: deviceId || null,
      type
    });
  }
  return result;
};

export const serialPorts = async (): Promise<SerialPortData[]> => {
  await nextTick();
  try {
    // Win32_SerialPort misses most USB adapters, Win32_PnPEntity lists them all
    const result = await ps.exec(`@(Get-CimInstance Win32_PnPEntity -Filter "Name LIKE '%(COM%'" | Select-Object Name,DeviceID,Manufacturer) | ConvertTo-Json -Depth 3`);
    return parseSerialPorts(psArray(result));
  } catch {
    return [];
  }
};
