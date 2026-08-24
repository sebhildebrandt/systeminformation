import { exec } from '../common/exec';
import { UsbData } from '../common/types';
import { initUsbResult } from '../common/defaults';
import { usbDarwinType } from '../common/mappings';
import { cloneObj, nextTick } from '../common';

export const parseUsb = (stdout: string): UsbData[] => {
  const defaults: UsbData = cloneObj(initUsbResult);
  const result: UsbData[] = [];
  const parts = stdout.toString().split(' +-o ');
  for (let i = 1; i < parts.length; i++) {
    parts[i] = parts[i].replace(/ \|/g, '');
    parts[i] = parts[i].trim();
    const lines = parts[i].split('\n').splice(1);
    try {
      for (let j = 0; j < lines.length; j++) {
        lines[j] = lines[j].trim();
        lines[j] = lines[j].replace(/=/g, ':');
        if (lines[j] !== '{' && lines[j] !== '}' && lines[j + 1] && lines[j + 1].trim() !== '}') {
          lines[j] = lines[j] + ',';
        }
        lines[j] = lines[j].replace(':Yes,', ':"Yes",');
        lines[j] = lines[j].replace(': Yes,', ': "Yes",');
        lines[j] = lines[j].replace(': Yes', ': "Yes"');
        lines[j] = lines[j].replace(':No,', ':"No",');
        lines[j] = lines[j].replace(': No,', ': "No",');
        lines[j] = lines[j].replace(': No', ': "No"');

        // In this case (("com.apple.developer.driverkit.transport.usb"))
        lines[j] = lines[j].replace('((', '').replace('))', '');

        // In case we have <923c11> we need make it "<923c11>" for correct JSON parse
        const match = /<(\w+)>/.exec(lines[j]);
        if (match) {
          const number = match[0];
          lines[j] = lines[j].replace(number, `"${number}"`);
        }
      }
      const usbObj = JSON.parse(lines.join('\n'));
      const removableDrive = (usbObj['Built-In'] ? usbObj['Built-In'].toLowerCase() !== 'yes' : true) && (usbObj['non-removable'] ? usbObj['non-removable'].toLowerCase() === 'no' : true);

      const name = usbObj['kUSBProductString'] || usbObj['USB Product Name'] || null;

      if (name) {
        result.push({
          ...defaults,
          bus: null,
          deviceId: null,
          id: usbObj['USB Address'] || null,
          name,
          type: usbDarwinType((usbObj['kUSBProductString'] || usbObj['USB Product Name'] || '').toLowerCase() + (removableDrive ? ' removable' : '')),
          removable: usbObj['non-removable'] ? (usbObj['non-removable'].toLowerCase() || '') === 'no' : true,
          vendor: usbObj['kUSBVendorString'] || usbObj['USB Vendor Name'] || null,
          manufacturer: usbObj['kUSBVendorString'] || usbObj['USB Vendor Name'] || null,
          maxPower: null,
          serialNumber: usbObj['kUSBSerialNumberString'] || null
        });
      }
    } catch {}
  }
  return result;
};

export const usb = async (): Promise<UsbData[]> => {
  await nextTick();
  try {
    const { stdout } = await exec('ioreg -p IOUSB -c AppleUSBRootHubDevice -w0 -l');
    return parseUsb(stdout);
  } catch {}
  return [];
};
