'use strict';

import { linuxBattery } from './linux/battery';
import { darwinBattery } from './darwin/battery';
import { windowsBattery } from './windows/battery';
import { bsdBattery } from './bsd/battery';
import { BatteryObject } from './common/types';

import { AIX, ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';

export const battery = () => {
  return new Promise<BatteryObject | null>(resolve => {
    process.nextTick(() => {
      switch (true) {
        case LINUX:
          return resolve(linuxBattery());
        case FREEBSD || NETBSD:
          return resolve(bsdBattery());
        case DARWIN:
          return resolve(darwinBattery());
        case WINDOWS:
          return resolve(windowsBattery());
        default:
          return resolve(null);
      }
    });
  });

};
