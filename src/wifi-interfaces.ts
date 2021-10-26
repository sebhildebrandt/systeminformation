import { linuxWifiInterfaces } from './linux/wifi-interfaces';
import { darwinWifiInterfaces } from './darwin/wifi-interfaces';
import { windowsWifiInterfaces } from './windows/wifi-interfaces';

import { DARWIN, LINUX, WINDOWS } from './common/const';
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
