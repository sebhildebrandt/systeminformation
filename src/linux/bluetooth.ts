import * as path from 'path';
import { readFile } from 'fs/promises';

import { getValue, nextTick } from '../common';
import { getFilesInPath } from '../common/files';
import { bluetoothTypeLabel } from '../common/mappings';
import { BluetoothObject } from '../common/types';
import { exec } from '../common/exec';
import { execOptsLinux } from '../common/const';

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
    connected: false
  };
};

export const bluetoothDevices = async () => {
  await nextTick();
  const result: BluetoothObject[] = [];
  const btFiles = await getFilesInPath('/var/lib/bluetooth/');
  for (const element of btFiles) {
    const filename = path.basename(element);
    const pathParts = element.split('/');
    const macAddr1 = pathParts.length >= 6 ? pathParts[pathParts.length - 2] : null;
    const macAddr2 = pathParts.length >= 7 ? pathParts[pathParts.length - 3] : null;
    if (filename === 'info') {
      try {
        const infoFile = await readFile(element, { encoding: 'utf8' });
        result.push(parseBluetoothInfo(infoFile.split('\n'), macAddr1, macAddr2));
      } catch {}
    }
  }
  // determine "connected" with hcitool con
  try {
    const { stdout } = await exec('hcitool con', execOptsLinux);
    const hdicon = stdout.toLowerCase();
    for (const element of result) {
      if (element.macDevice && String(element.macDevice).length > 10 && hdicon.indexOf(String(element.macDevice).toLowerCase()) >= 0) {
        element.connected = true;
      }
    }
  } catch {}
  return result;
};
