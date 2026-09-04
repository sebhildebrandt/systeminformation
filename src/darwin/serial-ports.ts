import { readdir } from 'fs/promises';
import { cloneObj, nextTick } from '../common';
import { initSerialPortResult } from '../common/defaults';
import { execSave } from '../common/exec';
import type { SerialPortData } from '../common/types';

const toHex4 = (value: string) => {
  const num = Number.parseInt(value, 10);
  return Number.isNaN(num) ? null : num.toString(16).padStart(4, '0');
};

// ioreg -r roots at the USB devices and prints their subtrees, so the callout
// devices of a port show up below the USB descriptors they belong to
const parseUsbPorts = (stdout: string) => {
  const ports = new Map<string, Partial<SerialPortData>>();
  let usb: Partial<SerialPortData> = {};
  for (const raw of stdout.split('\n')) {
    const line = raw.replace(/\|/g, '').trim();
    if (line.startsWith('+-o')) {
      if (line.includes('class IOUSBHostDevice')) {
        usb = {};
      }
      continue;
    }
    const entry = /^"([^"]+)" = (.+)$/.exec(line);
    if (!entry) {
      continue;
    }
    const key = entry[1];
    const value = (entry[2] || '').replace(/^"|"$/g, '').trim();
    switch (key) {
      case 'idVendor':
        usb.vendorId = toHex4(value);
        break;
      case 'idProduct':
        usb.productId = toHex4(value);
        break;
      case 'USB Vendor Name':
        usb.manufacturer = value || null;
        break;
      case 'USB Product Name':
        usb.name = value || null;
        break;
      case 'USB Serial Number':
        usb.serialNumber = value || null;
        break;
      case 'IOCalloutDevice':
        ports.set(value, { ...usb });
        break;
      default:
        break;
    }
  }
  return ports;
};

const calloutDevices = (stdout: string) => {
  const devices = new Set<string>();
  const regex = /"IOCalloutDevice" = "([^"]+)"/g;
  let match = regex.exec(stdout);
  while (match) {
    if (match[1]) {
      devices.add(match[1]);
    }
    match = regex.exec(stdout);
  }
  return devices;
};

export const serialPorts = async (): Promise<SerialPortData[]> => {
  await nextTick();
  const result: SerialPortData[] = [];
  let devices: string[] = [];
  try {
    // cu.* is the callout device - tty.* is the dial-in side and blocks on DCD
    devices = (await readdir('/dev')).filter((device) => device.startsWith('cu.'));
  } catch {
    return result;
  }
  const [usbTree, bluetoothTree] = await Promise.all([execSave('ioreg -r -c IOUSBHostDevice -l -w0'), execSave('ioreg -r -c IOBluetoothDevice -l -w0')]);
  const usbPorts = parseUsbPorts(usbTree.stdout);
  const bluetoothPorts = calloutDevices(bluetoothTree.stdout);
  for (const device of devices.sort()) {
    const path = `/dev/${device}`;
    const usb = usbPorts.get(path);
    const name = device.substring(3);
    result.push({
      ...cloneObj(initSerialPortResult),
      ...usb,
      device: path,
      name: usb?.name || name,
      type: usb ? 'usb' : bluetoothPorts.has(path) ? 'bluetooth' : 'unknown'
    });
  }
  return result;
};
