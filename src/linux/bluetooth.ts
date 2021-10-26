'use strict';

import * as path from 'path';
import { promises as fs } from 'fs';

import { getValue, noop } from '../common';
import { getFilesInPath } from '../common/files';
import { bluetoothTypeLabel } from '../common/mappings';
import { BluetoothObject } from '../common/types';
import { execCmd } from '../common/exec';

const parseBluetoothInfo = (lines: string[], macAddr1: string | null, macAddr2: string | null): BluetoothObject => {
  const name = getValue(lines, 'name', '=');

  return {
    device: null,
    name: getValue(lines, 'name', '='),
    manufacturer: null,
    macDevice: macAddr1,
    macHost: macAddr2,
    batteryPercent: null,
    type: bluetoothTypeLabel(name.toLowerCase()),
    connected: false,
  };
};

export const linuxBluetooth = async () => {
  const result: BluetoothObject[] = [];
  const btFiles = getFilesInPath('/var/lib/bluetooth/');
  for (let i = 0; i < btFiles.length; i++) {
    const filename = path.basename(btFiles[i]);
    const pathParts = btFiles[i].split('/');
    const macAddr1 = pathParts.length >= 6 ? pathParts[pathParts.length - 2] : null;
    const macAddr2 = pathParts.length >= 7 ? pathParts[pathParts.length - 3] : null;
    if (filename === 'info') {
      const infoFile = await fs.readFile(btFiles[i], { encoding: 'utf8' });
      result.push(parseBluetoothInfo(infoFile.split('\n'), macAddr1, macAddr2));
    }
  }
  // determine "connected" with hcitool con
  try {
    const hdicon = await execCmd('hcitool con').toString().toLowerCase();
    for (let i = 0; i < result.length; i++) {
      if (result[i].macDevice && String(result[i].macDevice).length > 10 && hdicon.indexOf(String(result[i].macDevice).toLowerCase()) >= 0) {
        result[i].connected = true;
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
      return resolve(linuxBluetooth());
    });
  });
};
