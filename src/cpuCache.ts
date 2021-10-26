'use strict';

import { linuxCpuCache } from './linux/cpuCache';
import { darwinCpuCache } from './darwin/cpuCache';
import { windowsCpuCache } from './windows/cpuCache';
import { bsdCpuCache } from './bsd/cpuCache';
import { CpuCacheData } from './common/types';

import { AIX, ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';
import { nextTick } from './common';

export const cpuCache = async () => {
  await nextTick();
  switch (true) {
    case LINUX:
      return linuxCpuCache();
    case FREEBSD || NETBSD:
      return bsdCpuCache();
    case DARWIN:
      return darwinCpuCache();
    case WINDOWS:
      return windowsCpuCache();
    default:
      return null;
  }
};
