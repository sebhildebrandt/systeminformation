import { cloneObj } from './common';
import { DARWIN, FREEBSD, LINUX, NETBSD, OPENBSD, WINDOWS } from './common/const';
import type { CpuTemperatureData } from './common/types';

export const cpuTemperature = async (): Promise<CpuTemperatureData> => {
  switch (true) {
    case LINUX:
      return (await import('./linux/cpu-temperature.js')).cpuTemperature();
    case FREEBSD || NETBSD || OPENBSD:
      return (await import('./bsd/cpu-temperature.js')).cpuTemperature();
    case DARWIN:
      return (await import('./darwin/cpu-temperature.js')).cpuTemperature();
    case WINDOWS:
      return (await import('./windows/cpu-temperature.js')).cpuTemperature();
    default:
      return cloneObj((await import('./common/defaults.js')).initCpuTemperature);
  }
};
