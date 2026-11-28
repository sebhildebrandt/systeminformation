import { plistParser, spItems, USB_DATA_TYPES } from '../common/darwin';
import { nextTick } from '../common';
import { exec } from '../common/exec';
import { BluetoothDeviceData, MouseData } from '../common/types';
import { usbDarwinType } from '../common/mappings';
import { parseBluetooth } from './bluetooth-devices';

const parseKeyboard = (data: any[]) => {
  const result: MouseData[] = [];
  data.forEach((element) => {
    const usbType = usbDarwinType(element._name);
    result.push({
      name: element._name || '',
      type: usbType,
      vendor: element.f_manufacturer || '',
      model: element.a_product_id || '',
      serial: element.d_serial_num || '',
      connection: 'internal'
    });
  });
  return result;
};

const parseUsb = (data: any): MouseData[] => {
  const result: MouseData[] = [];
  data.forEach((part: any) => {
    if (part._items) {
      part._items.forEach((usb: any) => {
        const usbType = usbDarwinType(usb._name);
        if (usbType.toLowerCase().includes('mouse') || usbType.toLowerCase().includes('trackpad')) {
          result.push({
            name: usb._name || '',
            type: usbType,
            vendor: usb.manufacturer || '',
            model: '' + usb.product_id,
            serial: usb.serial || '',
            connection: 'usb'
          });
        }
      });
    }
  });
  return result;
};

const filterBluetooth = (data: BluetoothDeviceData[]): MouseData[] => {
  const result: MouseData[] = [];
  data.forEach((part: any) => {
    if ((part.type.toLowerCase().includes('mouse') || part.type.toLowerCase().includes('trackpad')) && part.connected) {
      result.push({
        name: part.name || '',
        type: part.type || '',
        vendor: part.manufacturer || '',
        model: '',
        serial: '',
        connection: 'bluetooth'
      });
    }
  });
  return result;
};

export const mouse = async (): Promise<MouseData[]> => {
  await nextTick();

  try {
    const { stdout } = await exec('system_profiler SPSPIDataType SPUSBDataType SPUSBHostDataType SPBluetoothDataType -xml');
    const data = plistParser(stdout, false);
    const spiData = spItems(data, 'SPSPIDataType');
    const usbData = spItems(data, USB_DATA_TYPES);
    const bluetoothData = spItems(data, 'SPBluetoothDataType');
    let result = parseKeyboard(spiData);
    result = result.concat(parseUsb(usbData));
    result = result.concat(filterBluetooth(parseBluetooth(bluetoothData)));
    return result;
  } catch {
    return [];
  }
};
