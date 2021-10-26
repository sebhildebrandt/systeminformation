import { linuxBattery } from './linux/battery';
import { darwinBattery } from './darwin/battery';
import { windowsBattery } from './windows/battery';
import { bsdBattery } from './bsd/battery';

import { DARWIN, FREEBSD, LINUX, NETBSD, WINDOWS } from './common/const';
import { nextTick } from './common';

export const battery = async () => {
  await nextTick();
  switch (true) {
    case LINUX:
      return linuxBattery();
    case FREEBSD || NETBSD:
      return bsdBattery();
    case DARWIN:
      return darwinBattery();
    case WINDOWS:
      return windowsBattery();
    default:
      return null;
  }
};
