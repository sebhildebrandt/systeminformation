'use strict';

import { linuxWifiInterfaces } from './linux/wifiInterfaces';
import { darwinWifiInterfaces } from './darwin/wifiInterfaces';
import { windowsWifiInterfaces } from './windows/wifiInterfaces';
import { WifiInterfaceData } from './common/types';

import { AIX, ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';

export const wifiInterfaces = () => {
  return new Promise<WifiInterfaceData[] | null>(resolve => {
    process.nextTick(() => {
      switch (true) {
        case LINUX:
          return resolve(linuxWifiInterfaces());
        case DARWIN:
          return resolve(darwinWifiInterfaces());
        case WINDOWS:
          return resolve(windowsWifiInterfaces());
        default:
          return resolve(null);
      }
    });
  });
};
