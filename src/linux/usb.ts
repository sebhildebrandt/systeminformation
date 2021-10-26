'use strict';

import { execCmd } from '../common/exec';
import { getValue, nextTick } from '../common';
import { UsbData } from '../common/types';
import { usbLinuxType } from '../common/mappings';

function parseUsb(usb: string) {
  const result = {};
  const lines = usb.split('\n');
  let bus: number | null = null;
  let deviceId: number | null = null;
  if (lines && lines.length && lines[0].indexOf('Device') >= 0) {
    const parts = lines[0].split(' ');
    bus = parseInt(parts[0], 10);
    if (parts[2]) {
      deviceId = parseInt(parts[2], 10);
    } else {
      deviceId = null;
    }
  } else {
    bus = null;
    deviceId = null;
  }
  const idVendor = getValue(lines, 'idVendor', ' ', true).trim();
  let vendorParts = idVendor.split(' ');
  vendorParts.shift();
  const vendor = vendorParts.join(' ');

  const idProduct = getValue(lines, 'idProduct', ' ', true).trim();
  let productParts = idProduct.split(' ');
  productParts.shift();
  const product = productParts.join(' ');

  const interfaceClass = getValue(lines, 'bInterfaceClass', ' ', true).trim();
  let interfaceClassParts = interfaceClass.split(' ');
  interfaceClassParts.shift();
  const usbType = interfaceClassParts.join(' ');

  const iManufacturer = getValue(lines, 'iManufacturer', ' ', true).trim();
  let iManufacturerParts = iManufacturer.split(' ');
  iManufacturerParts.shift();
  const manufacturer = iManufacturerParts.join(' ');

  return {
    id: (idVendor.startsWith('0x') ? idVendor.split(' ')[0].substr(2, 10) : '') + ':' + (idProduct.startsWith('0x') ? idProduct.split(' ')[0].substr(2, 10) : ''),
    bus,
    deviceId,
    name: product,
    type: usbLinuxType(usbType, product),
    removable: null,
    vendor: vendor,
    manufacturer: manufacturer,
    maxPower: getValue(lines, 'MaxPower', ' ', true),
    serialNumber: null
  };
}

export const linuxUsb = async () => {
  const result: UsbData[] = [];
  const cmd = 'export LC_ALL=C; lsusb -v 2>/dev/null; unset LC_ALL';
  const stdout = await execCmd(cmd);
  const parts = ('\n\n' + stdout.toString()).split('\n\nBus ');
  for (let i = 1; i < parts.length; i++) {
    const usb = parseUsb(parts[i]);
    result.push(usb);
  }
  return result;
};

export const usb = async () => {
  await nextTick();
  return linuxUsb();
};
