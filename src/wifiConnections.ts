'use strict';

import { linuxWifiConnections } from './linux/wifiConnections';
import { darwinWifiConnections } from './darwin/wifiConnections';
import { windowsWifiConnections } from './windows/wifiConnections';
import { WifiConnectionData } from './common/types';

import { AIX, ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';

export const wifiConnections = () => {
  return new Promise<WifiConnectionData[] | null | undefined>(resolve => {
    process.nextTick(() => {
      switch (true) {
        case LINUX:
          return resolve(linuxWifiConnections());
        case DARWIN:
          return resolve(darwinWifiConnections());
        case WINDOWS:
          return resolve(windowsWifiConnections());
        default:
          return resolve(null);
      }
    });
  });
};
