'use strict';

import { linuxWifiConnections } from './linux/wifiConnections';
import { darwinWifiConnections } from './darwin/wifiConnections';
import { windowsWifiConnections } from './windows/wifiConnections';
import { WifiConnectionData } from './common/types';

import { AIX, ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';
import { nextTick } from './common';

export const wifiConnections = async () => {
  await nextTick();
  switch (true) {
    case LINUX:
      return linuxWifiConnections();
    case DARWIN:
      return darwinWifiConnections();
    case WINDOWS:
      return windowsWifiConnections();
    default:
      return null;
  }
};
