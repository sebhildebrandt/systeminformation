import { linuxWifiNetwork } from './linux/wifiNetworks';
import { darwinWifiNetwork } from './darwin/wifiNetworks';
import { windowsWifiNetwork } from './windows/wifiNetworks';

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
