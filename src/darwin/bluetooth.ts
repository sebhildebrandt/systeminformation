import { plistParser } from './../common/darwin';
import { nextTick } from '../common';
import { exec } from '../common/exec';
import { bluetoothManufacturer, bluetoothTypeLabel, parseBluetoothVendor } from '../common/mappings';
import { BluetoothObject } from '../common/types';

const deviceId = (id: string) => {
  return id.split(' &lt; ')[0];
};

const parseBluetoothObjects = (bluetoothObject: any, macAddr2: string | null): BluetoothObject => {
  const typeStr = (
    (bluetoothObject.device_minorClassOfDevice_string || bluetoothObject.device_majorClassOfDevice_string || bluetoothObject.device_minorType || '') + (bluetoothObject.device_name || '')
  ).toLowerCase();
  return {
    device: deviceId(bluetoothObject.device_productID || ''),
    name: bluetoothObject.device_name || '',
    manufacturer: bluetoothObject.device_manufacturer || parseBluetoothVendor(bluetoothObject.device_vendorID) || bluetoothManufacturer(bluetoothObject.device_name || '') || '',
    macDevice: (bluetoothObject.device_addr || bluetoothObject.device_address || '').toLowerCase().replace(/-/g, ':'),
    macHost: macAddr2,
    batteryPercent: bluetoothObject.device_batteryPercent || null,
    type: bluetoothTypeLabel(typeStr),
    connected: bluetoothObject.device_isconnected === 'attrib_Yes' || false
  };
};

export const parseBluetooth = (outObj: any): BluetoothObject[] => {
  const result: BluetoothObject[] = [];
  if (outObj.length && outObj[0] && outObj[0]['device_title'] && outObj[0]['device_title'].length) {
    // missing: host BT Adapter macAddr ()
    let macAddr2: string | null = null;
    if (outObj[0]['local_device_title'] && outObj[0].local_device_title.general_address) {
      macAddr2 = outObj[0].local_device_title.general_address.toLowerCase().replace(/-/g, ':');
    }

    outObj[0]['device_title'].forEach((element: any) => {
      const obj = element;
      const objKey = Object.keys(obj);
      if (objKey && objKey.length === 1) {
        const innerObject = obj[objKey[0]];
        innerObject.device_name = objKey[0];
        const bluetoothDevice = parseBluetoothObjects(innerObject, macAddr2);
        result.push(bluetoothDevice);
      }
    });
  }
  if (outObj?.length && outObj[0] && outObj[0]['device_connected'] && outObj[0]['device_connected'].length) {
    const macAddr2 = outObj[0].controller_properties?.controller_address ? outObj[0].controller_properties.controller_address.toLowerCase().replace(/-/g, ':') : null;
    outObj[0]['device_connected'].forEach((element: any) => {
      const obj = element;
      const objKey = Object.keys(obj);
      if (objKey && objKey.length === 1) {
        const innerObject = obj[objKey[0]];
        innerObject.device_name = objKey[0];
        innerObject.device_isconnected = 'attrib_Yes';
        const bluetoothDevice = parseBluetoothObjects(innerObject, macAddr2);
        result.push(bluetoothDevice);
      }
    });
  }
  if (outObj?.length && outObj[0] && outObj[0]['device_not_connected'] && outObj[0]['device_not_connected'].length) {
    const macAddr2 = outObj[0].controller_properties?.controller_address ? outObj[0].controller_properties.controller_address.toLowerCase().replace(/-/g, ':') : null;
    outObj[0]['device_not_connected'].forEach((element: any) => {
      const obj = element;
      const objKey = Object.keys(obj);
      if (objKey && objKey.length === 1) {
        const innerObject = obj[objKey[0]];
        innerObject.device_name = objKey[0];
        innerObject.device_isconnected = 'attrib_No';
        const bluetoothDevice = parseBluetoothObjects(innerObject, macAddr2);
        result.push(bluetoothDevice);
      }
    });
  }
  return result;
};

export const bluetoothDevices = async (): Promise<BluetoothObject[]> => {
  await nextTick();

  try {
    const { stdout } = await exec('system_profiler SPBluetoothDataType -xml');
    const data = plistParser(stdout);
    return parseBluetooth(data);
  } catch {
    return [];
  }
};
