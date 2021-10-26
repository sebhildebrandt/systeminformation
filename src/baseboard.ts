'use strict';

import { nixBaseboard } from './linux/baseboard';
import { darwinBaseboard } from './darwin/baseboard';
import { windowsBaseboard } from './windows/baseboard';
import { BluetoothObject, BaseboardData } from './common/types';

import { AIX, ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';

export const baseboard = () => {
  return new Promise<BaseboardData | null>(resolve => {
    process.nextTick(() => {
      switch (true) {
        case LINUX:
          return resolve(nixBaseboard());
        case DARWIN:
          return resolve(darwinBaseboard());
        case WINDOWS:
          return resolve(windowsBaseboard());
        default:
          return resolve(null);
      }
    });
  });
};
