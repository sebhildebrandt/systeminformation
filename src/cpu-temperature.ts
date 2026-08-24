import { DARWIN, FREEBSD, LINUX, NETBSD, OPENBSD, WINDOWS } from './common/const';

export const cpuTemperature = async () => {
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
      return null;
  }
};
