'use strict';

import { noop } from '../common';
import { execCmd } from '../common/exec';
import { bluetoothTypeLabel } from '../common/mappings';
import { BluetoothObject } from '../common/types';

const parseBluetoothDevices = (bluetoothObject: any, macAddr2: string | null): BluetoothObject => {
  const typeStr = ((bluetoothObject.device_minorClassOfDevice_string || bluetoothObject.device_majorClassOfDevice_string || '') + (bluetoothObject.device_name || '')).toLowerCase();

  return {
    device: bluetoothObject.device_services || '',
    name: bluetoothObject.device_name || '',
    manufacturer: bluetoothObject.device_manufacturer || '',
    macDevice: (bluetoothObject.device_addr || '').toLowerCase().replace(/-/g, ':'),
    macHost: macAddr2,
    batteryPercent: bluetoothObject.device_batteryPercent || null,
    type: bluetoothTypeLabel(typeStr),
    connected: bluetoothObject.device_isconnected === 'attrib_Yes' || false
  };
};

export const darwinBluetooth = async () => {
  const result: BluetoothObject[] = [];
  try {
    const stdout = await execCmd('system_profiler SPBluetoothDataType -json');
    const outObj = JSON.parse(stdout.toString());
    if (outObj.SPBluetoothDataType && outObj.SPBluetoothDataType.length && outObj.SPBluetoothDataType[0] && outObj.SPBluetoothDataType[0]['device_title'] && outObj.SPBluetoothDataType[0]['device_title'].length) {
      // missing: host BT Adapter macAddr ()
      let macAddr2 = null;
      if (outObj.SPBluetoothDataType[0]['local_device_title'] && outObj.SPBluetoothDataType[0].local_device_title.general_address) {
        macAddr2 = outObj.SPBluetoothDataType[0].local_device_title.general_address.toLowerCase().replace(/-/g, ':');
      }

      for (let i = 0; i < outObj.SPBluetoothDataType[0]['device_title'].length; i++) {
        const obj = outObj.SPBluetoothDataType[0]['device_title'][i];
        const objKey = Object.keys(obj);
        if (objKey && objKey.length === 1) {
          const innerObject = obj[objKey[0]];
          innerObject.device_name = objKey[0];
          const bluetoothDevice = parseBluetoothDevices(innerObject, macAddr2);
          result.push(bluetoothDevice);
        }
      }
    }
  } catch (e) {
    noop();
  }
  return result;
};

export const bluetoothDevices = () => {
  return new Promise<BluetoothObject[] | null>(resolve => {
    process.nextTick(() => {
      return resolve(darwinBluetooth());
    });
  });
};
