import { execCmd, } from '../common/exec';
import { UsbData } from '../common/types';
import { initUsbResult } from '../common/defaults';
import { usbDarwinType } from '../common/mappings';
import { nextTick } from '../common';

function parseUsb(usb: string): UsbData | null {
  const result: UsbData = initUsbResult;

  usb = usb.replace(/ \|/g, '');
  usb = usb.trim();
  const lines = usb.split('\n');
  lines.shift();
  try {
    for (let i = 0; i < lines.length; i++) {
      lines[i] = lines[i].trim();
      lines[i] = lines[i].replace(/=/g, ':');
      if (lines[i] !== '{' && lines[i] !== '}' && lines[i + 1] && lines[i + 1].trim() !== '}') {
        lines[i] = lines[i] + ',';
      }
      lines[i] = lines[i].replace(': Yes,', ': "Yes",');
      lines[i] = lines[i].replace(': No,', ': "No",');
    }
    const usbObj = JSON.parse(lines.join('\n'));
    const removableDrive = usbObj['Built-In'].toLowerCase() !== 'yes' && usbObj['non-removable'].toLowerCase() === 'no';

    result.bus = null;
    result.deviceId = null;
    result.id = usbObj['USB Address'] || null;
    result.name = usbObj['kUSBProductString'] || usbObj['USB Product Name'] || null;
    result.type = usbDarwinType((usbObj['kUSBProductString'] || usbObj['USB Product Name'] || '').toLowerCase() + (removableDrive ? ' removable' : ''));
    result.removable = usbObj['non-removable'].toLowerCase() === 'no';
    result.vendor = usbObj['kUSBVendorString'] || usbObj['USB Vendor Name'] || null;
    result.manufacturer = usbObj['kUSBVendorString'] || usbObj['USB Vendor Name'] || null;
    result.maxPower = null;
    result.serialNumber = usbObj['kUSBSerialNumberString'] || null;

    if (result.name) {
      return result;
    } else {
      return null;
    }
  } catch (e) {
    return null;
  }
}

export const darwinUsb = async () => {
  const result: UsbData[] = [];
  const stdout = await execCmd('ioreg -p IOUSB -c AppleUSBRootHubDevice -w0 -l');
  const parts = (stdout.toString()).split(' +-o ');
  for (let i = 1; i < parts.length; i++) {
    const usb = parseUsb(parts[i]);
    if (usb) {
      result.push(usb);
    }
  }
  return result;
};

export const usb = async () => {
  await nextTick();
  return darwinUsb();
};
