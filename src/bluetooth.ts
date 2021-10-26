'use strict';

import { linuxBluetooth } from './linux/bluetooth';
import { darwinBluetooth } from './darwin/bluetooth';
import { windowsBluetooth } from './windows/bluetooth';
import { BluetoothObject } from './common/types';

import { AIX, ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';
import { nextTick } from './common';

export const bluetoothDevices = async () => {
  await nextTick();
  switch (true) {
    case LINUX:
      return linuxBluetooth();
    case DARWIN:
      return darwinBluetooth();
    case WINDOWS:
      return windowsBluetooth();
    default:
      return null;
  }
};
