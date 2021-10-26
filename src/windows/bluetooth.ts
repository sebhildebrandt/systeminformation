'use strict';

import { powerShell } from '../common/exec';
import { getValue, nextTick } from '../common';
import { bluetoothTypeLabel } from '../common/mappings';
import { BluetoothObject } from '../common/types';

const parseBluetoothDevices = (lines: string[]): BluetoothObject => {
  const name = getValue(lines, 'name', ':');

  return {
    device: null,
    name,
    manufacturer: getValue(lines, 'manufacturer', ':'),
    macDevice: null,
    macHost: null,
    batteryPercent: null,
    type: bluetoothTypeLabel(name.toLowerCase()),
    connected: null
  };
};

export const windowsBluetooth = async () => {
  const result: BluetoothObject[] = [];
  const stdout = await powerShell('Get-WmiObject Win32_PNPEntity | fl *');
  const parts = stdout.toString().split(/\n\s*\n/);
  for (let i = 0; i < parts.length; i++) {
    if (getValue(parts[i].split('\n'), 'PNPClass', ':') === 'Bluetooth') {
      result.push(parseBluetoothDevices(parts[i].split('\n')));
    }
  };
  return result;
};

export const bluetoothDevices = async () => {
  await nextTick();
  return windowsBluetooth();
};
