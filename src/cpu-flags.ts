import { linuxCpuFlags } from './linux/cpu-flags';
import { darwinCpuFlags } from './darwin/cpu-flags';
import { windowsCpuFlags } from './windows/cpu-flags';
import { bsdCpuFlags } from './bsd/cpu-flags';

import { DARWIN, FREEBSD, LINUX, NETBSD, WINDOWS } from './common/const';
import { nextTick } from './common';

export const cpuFlags = async () => {
  await nextTick();
  switch (true) {
    case LINUX:
      return linuxCpuFlags();
    case FREEBSD || NETBSD:
      return bsdCpuFlags();
    case DARWIN:
      return darwinCpuFlags();
    case WINDOWS:
      return windowsCpuFlags();
    default:
      return null;
  }
};
