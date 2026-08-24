import { exec } from '../common/exec';
import { getValue, nextTick } from '../common';
import { UsbData } from '../common/types';
import { usbLinuxType } from '../common/mappings';
import { execOptsLinux } from '../common/const';

function parseUsb(stdout: string): UsbData[] {
  const result: UsbData[] = [];
  const parts = ('\n\n' + stdout.toString()).split('\n\nBus ');
  for (let i = 1; i < parts.length; i++) {
    const usb = parts[i];

    const lines = usb.split('\n');
    let bus: number | null = null;
    let deviceId: number | null = null;
    if (lines?.length && lines[0].indexOf('Device') >= 0) {
      const parts = lines[0].split(' ');
      bus = parseInt(parts[0], 10);
      if (parts[2]) {
        deviceId = parseInt(parts[2], 10);
      }
    }
    const idVendor = getValue(lines, 'idVendor', ' ', true).trim();
    const vendorParts = idVendor.split(' ').splice(1);
    const vendor = vendorParts.join(' ');

    const idProduct = getValue(lines, 'idProduct', ' ', true).trim();
    const productParts = idProduct.split(' ').splice(1);
    const product = productParts.join(' ');

    const interfaceClass = getValue(lines, 'bInterfaceClass', ' ', true).trim();
    const interfaceClassParts = interfaceClass.split(' ').splice(1);
    const usbType = interfaceClassParts.join(' ');

    const iManufacturer = getValue(lines, 'iManufacturer', ' ', true).trim();
    const iManufacturerParts = iManufacturer.split(' ').splice(1);
    const manufacturer = iManufacturerParts.join(' ');

    const iSerial = getValue(lines, 'iSerial', ' ', true).trim();
    const iSerialParts = iSerial.split(' ').splice(1);
    const serialNumber = iSerialParts.join(' ');

    result.push({
      id: (idVendor.startsWith('0x') ? idVendor.split(' ')[0].substring(2, 12) : '') + ':' + (idProduct.startsWith('0x') ? idProduct.split(' ')[0].substring(2, 12) : ''),
      bus,
      deviceId,
      name: product,
      type: usbLinuxType(usbType, product),
      removable: null,
      vendor,
      manufacturer,
      maxPower: getValue(lines, 'MaxPower', ' ', true),
      serialNumber
    });
  }
  return result;
}

export const usb = async (): Promise<UsbData[]> => {
  await nextTick();
  try {
    const { stdout } = await exec('export LC_ALL=C; lsusb -v 2>/dev/null; unset LC_ALL', execOptsLinux);
    return parseUsb(stdout);
  } catch {}
  return [];
};
