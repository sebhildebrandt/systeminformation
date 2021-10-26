'use strict';

import { linuxBluetooth } from './linux/bluetooth';
import { darwinBluetooth } from './darwin/bluetooth';
import { windowsBluetooth } from './windows/bluetooth';
import { BluetoothObject } from './common/types';

import { AIX, ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';

export const bluetoothDevices = () => {
  return new Promise<BluetoothObject[] | null>(resolve => {
    process.nextTick(() => {
      switch (true) {
        case LINUX:
          return resolve(linuxBluetooth());
        case DARWIN:
          return resolve(darwinBluetooth());
        case WINDOWS:
          return resolve(windowsBluetooth());
        default:
          return resolve(null);
      }
    });
  });
};
