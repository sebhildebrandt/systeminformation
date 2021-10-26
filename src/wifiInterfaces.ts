'use strict';

import { linuxWifiInterfaces } from './linux/wifiInterfaces';
import { darwinWifiInterfaces } from './darwin/wifiInterfaces';
import { windowsWifiInterfaces } from './windows/wifiInterfaces';
import { WifiInterfaceData } from './common/types';

import { AIX, ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';
import { nextTick } from './common';

export const wifiInterfaces = async () => {
  await nextTick();
  switch (true) {
    case LINUX:
      return linuxWifiInterfaces();
    case DARWIN:
      return darwinWifiInterfaces();
    case WINDOWS:
      return windowsWifiInterfaces();
    default:
      return null;
  }
};
