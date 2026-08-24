import { cloneObj, getValue, nextTick } from '../common';
import { initUsbResult } from '../common/defaults';
import { usbWindowsType } from '../common/mappings';
import type { UsbData } from '../common/types';
import { ps } from '../common/windows';

function parseUsb(lines: string[], id: number): UsbData | null {
  const usbType = usbWindowsType(getValue(lines, 'CreationClassName', ':').toLowerCase(), getValue(lines, 'name', ':').toLowerCase());

  if (usbType) {
    return {
      ...cloneObj(initUsbResult),
      id: id,
      deviceId: getValue(lines, 'deviceid', ':'),
      name: getValue(lines, 'name', ':'),
      type: usbType,
      manufacturer: getValue(lines, 'Manufacturer', ':')
    };
  } else {
    return null;
  }
}

export const usb = async () => {
  await nextTick();
  const result: UsbData[] = [];
  const stdout = await ps.exec('Get-CimInstance CIM_LogicalDevice | where { $_.Description -match "USB"} | select Name,CreationClassName,DeviceId,Manufacturer | fl');
  const parts = stdout.toString().split(/\n\s*\n/);
  for (let i = 0; i < parts.length; i++) {
    const usb = parseUsb(parts[i].split('\n'), i);
    if (usb && result.filter((x) => x.deviceId === usb.deviceId).length === 0) {
      result.push(usb);
    }
  }
  return result;
};
