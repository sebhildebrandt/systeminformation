'use strict';

import { powerShell } from '../common/exec';
import { getValue } from '../common';
import { UsbData } from '../common/types';
import { usbWindowsType } from '../common/mappings';

function parseUsb(lines: string[], id: number): UsbData | null {
  const usbType = usbWindowsType(getValue(lines, 'CreationClassName', ':').toLowerCase(), getValue(lines, 'name', ':').toLowerCase());

  if (usbType) {
    return {
      bus: null,
      deviceId: getValue(lines, 'deviceid', ':'),
      id: id,
      name: getValue(lines, 'name', ':'),
      type: usbType,
      removable: null,
      vendor: null,
      manufacturer: getValue(lines, 'Manufacturer', ':'),
      maxPower: null,
      serialNumber: null,
    };
  } else {
    return null;
  }
}

export const windowsUsb = async () => {
  const result: UsbData[] = [];
  const stdout = await powerShell('Get-WmiObject CIM_LogicalDevice | where { $_.Description -match "^USB"}');
  const parts = stdout.toString().split(/\n\s*\n/);
  for (let i = 0; i < parts.length; i++) {
    const usb = parseUsb(parts[i].split('\n'), i);
    if (usb) {
      result.push(usb);
    }
  }
  return result;
};

export const usb = () => {
  return new Promise<UsbData[] | null>(resolve => {
    process.nextTick(() => {
      return resolve(windowsUsb());
    });
  });
};
