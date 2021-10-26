import { linuxCpuTemperature } from './linux/cpu-temperature';
import { darwinCpuTemperature } from './darwin/cpu-temperature';
import { windowsCpuTemperature } from './windows/cpu-temperature';
import { bsdCpuTemperature } from './bsd/cpu-temperature';

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
