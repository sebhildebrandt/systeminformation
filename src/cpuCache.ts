'use strict';

import { linuxCpuCache } from './linux/cpuCache';
import { darwinCpuCache } from './darwin/cpuCache';
import { windowsCpuCache } from './windows/cpuCache';
import { bsdCpuCache } from './bsd/cpuCache';
import { CpuCacheData } from './common/types';

import { AIX, ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';

export const cpuCache = () => {
  return new Promise<CpuCacheData | null | undefined>(resolve => {
    process.nextTick(() => {
      switch (true) {
        case LINUX:
          return resolve(linuxCpuCache());
        case FREEBSD || NETBSD:
          return resolve(bsdCpuCache());
        case DARWIN:
          return resolve(darwinCpuCache());
        case WINDOWS:
          return resolve(windowsCpuCache());
        default:
          return resolve(null);
      }
    });
  });
};
