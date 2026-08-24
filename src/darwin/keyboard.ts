import { plistParser } from '../common/darwin';
import { nextTick } from '../common';
import { exec } from '../common/exec';
import { BluetoothObject, Keyboard } from '../common/types';
import { usbDarwinType } from '../common/mappings';
import { parseBluetooth } from './bluetooth';

const parseKeyboard = (data: any[]) => {
  const result: Keyboard[] = [];
  data.forEach((element) => {
    result.push({
      name: element._name || '',
      vendor: element.f_manufacturer || '',
      model: element.a_product_id || '',
      serial: element.d_serial_num || '',
      connection: 'internal'
    });
  });
  return result;
};

const parseUsb = (data: any): Keyboard[] => {
  const result: Keyboard[] = [];
  data.forEach((part: any) => {
    if (part._items) {
      part._items.forEach((usb: any) => {
        if (usbDarwinType(usb._name).toLowerCase().includes('keyboard')) {
          result.push({
            name: usb._name || '',
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

const filterBluetooth = (data: BluetoothObject[]): Keyboard[] => {
  const result: Keyboard[] = [];
  data.forEach((part: any) => {
    if (part.type.toLowerCase().includes('keyboard') && part.connected) {
      result.push({
        name: part.name || '',
        vendor: part.manufacturer || '',
        model: '',
        serial: '',
        connection: 'bluetooth'
      });
    }
  });
  return result;
};

export const keyboard = async (): Promise<Keyboard[]> => {
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
