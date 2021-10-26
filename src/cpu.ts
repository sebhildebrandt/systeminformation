'use strict';

import { linuxCpu } from './linux/cpu';
import { darwinCpu } from './darwin/cpu';
import { windowsCpu } from './windows/cpu';
import { bsdCpu } from './bsd/cpu';
import { CpuObject } from './common/types';

import { AIX, ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';

export const cpu = () => {
  return new Promise<CpuObject | null | undefined>(resolve => {
    process.nextTick(() => {
      switch (true) {
        case LINUX:
          return resolve(linuxCpu());
        case FREEBSD || NETBSD:
          return resolve(bsdCpu());
        case DARWIN:
          return resolve(darwinCpu());
        case WINDOWS:
          return resolve(windowsCpu());
        default:
          return resolve(null);
      }
    });
  });
};
