import { linuxCpuFlags } from './linux/cpuFlags';
import { darwinCpuFlags } from './darwin/cpuFlags';
import { windowsCpuFlags } from './windows/cpuFlags';
import { bsdCpuFlags } from './bsd/cpuFlags';

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
