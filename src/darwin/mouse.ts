import { plistParser } from '../common/darwin';
import { nextTick } from '../common';
import { exec } from '../common/exec';
import { BluetoothObject, Mouse } from '../common/types';
import { usbDarwinType } from '../common/mappings';
import { parseBluetooth } from './bluetooth';

const parseKeyboard = (data: any[]) => {
  const result: Mouse[] = [];
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

const parseUsb = (data: any): Mouse[] => {
  const result: Mouse[] = [];
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

const filterBluetooth = (data: BluetoothObject[]): Mouse[] => {
  const result: Mouse[] = [];
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

export const mouse = async (): Promise<Mouse[]> => {
  await nextTick();

  try {
    const { stdout } = await exec('system_profiler SPSPIDataType SPUSBDataType SPBluetoothDataType -xml');
    const data = plistParser(stdout, false);
    const spiData = data.length >= 2 && data[0]._items ? data[0]._items : [];
    const usbData = data.length >= 2 && data[1]._items ? data[1]._items : [];
    const bluetoothData = data.length >= 3 && data[2]._items ? data[2]._items : [];
    let result = parseKeyboard(spiData);
    result = result.concat(parseUsb(usbData));
    result = result.concat(filterBluetooth(parseBluetooth(bluetoothData)));
    return result;
  } catch {
    return [];
  }
};
