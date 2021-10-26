'use strict';

import { linuxWifiNetwork } from './linux/wifiNetworks';
import { darwinWifiNetwork } from './darwin/wifiNetworks';
import { windowsWifiNetwork } from './windows/wifiNetworks';
import { WifiNetworkData } from './common/types';

import { AIX, ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';

export const wifiNetworks = () => {
  return new Promise<WifiNetworkData[] | null | undefined>(resolve => {
    process.nextTick(() => {
      switch (true) {
        case LINUX:
          return resolve(linuxWifiNetwork());
        case DARWIN:
          return resolve(darwinWifiNetwork());
        case WINDOWS:
          return resolve(windowsWifiNetwork());
        default:
          return resolve(null);
      }
    });
  });
};
