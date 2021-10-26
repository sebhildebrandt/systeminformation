import { linuxWifiConnections } from './linux/wifi-connections';
import { darwinWifiConnections } from './darwin/wifi-connections';
import { windowsWifiConnections } from './windows/wifi-connections';

import { DARWIN, LINUX, WINDOWS } from './common/const';
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
