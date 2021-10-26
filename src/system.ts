'use strict';

import { nixSystem } from './linux/system';
import { darwinSystem } from './darwin/system';
import { windowsSystem } from './windows/system';
import { BluetoothObject, SystemData } from './common/types';

import { AIX, ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';

export const system = () => {
  return new Promise<SystemData | null>(resolve => {
    process.nextTick(() => {
      switch (true) {
        case LINUX:
          return resolve(nixSystem());
        case DARWIN:
          return resolve(darwinSystem());
        case WINDOWS:
          return resolve(windowsSystem());
        default:
          return resolve(null);
      }
    });
  });
};
