import { linuxCpuCache } from './linux/cpu-cache';
import { darwinCpuCache } from './darwin/cpu-cache';
import { windowsCpuCache } from './windows/cpu-cache';
import { bsdCpuCache } from './bsd/cpu-cache';

import { DARWIN, FREEBSD, LINUX, NETBSD, WINDOWS } from './common/const';
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
