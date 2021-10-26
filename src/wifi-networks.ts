import { linuxWifiNetwork } from './linux/wifi-networks';
import { darwinWifiNetwork } from './darwin/wifi-networks';
import { windowsWifiNetwork } from './windows/wifi-networks';

import { DARWIN, LINUX, WINDOWS } from './common/const';
import { nextTick } from './common';

export const wifiNetworks = async () => {
  await nextTick();
  switch (true) {
    case LINUX:
      return linuxWifiNetwork();
    case DARWIN:
      return darwinWifiNetwork();
    case WINDOWS:
      return windowsWifiNetwork();
    default:
      return null;
  }
};
