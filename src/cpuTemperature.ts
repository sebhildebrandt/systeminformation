import { linuxCpuTemperature } from './linux/cpuTemperature';
import { darwinCpuTemperature } from './darwin/cpuTemperature';
import { windowsCpuTemperature } from './windows/cpuTemperature';
import { bsdCpuTemperature } from './bsd/cpuTemperature';

import { DARWIN, FREEBSD, LINUX, NETBSD, WINDOWS } from './common/const';
import { nextTick } from './common';

export const cpuTemperature = async () => {
  await nextTick();
  switch (true) {
    case LINUX:
      return linuxCpuTemperature();
    case FREEBSD || NETBSD:
      return bsdCpuTemperature();
    case DARWIN:
      return darwinCpuTemperature();
    case WINDOWS:
      return windowsCpuTemperature();
    default:
      return null;
  }
};
