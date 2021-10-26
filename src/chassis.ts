'use strict';

import { nixChassis } from './linux/chassis';
import { darwinChassis } from './darwin/chassis';
import { windowsChassis } from './windows/chassis';
import { ChassisData } from './common/types';

import { AIX, ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';

export const chassis = () => {
  return new Promise<ChassisData | null>(resolve => {
    process.nextTick(() => {
      switch (true) {
        case LINUX:
          return resolve(nixChassis());
        case DARWIN:
          return resolve(darwinChassis());
        case WINDOWS:
          return resolve(windowsChassis());
        default:
          return resolve(null);
      }
    });
  });
};
