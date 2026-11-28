import { cloneObj } from './common';
import { DARWIN, FREEBSD, LINUX, NETBSD, OPENBSD, WINDOWS } from './common/const';
import type { CpuData } from './common/types';

export const cpu = async (): Promise<CpuData> => {
  switch (true) {
    case LINUX:
      return (await import('./linux/cpu.js')).cpu();
    case FREEBSD || NETBSD || OPENBSD:
      return (await import('./bsd/cpu.js')).cpu();
    case DARWIN:
      return (await import('./darwin/cpu.js')).cpu();
    case WINDOWS:
      return (await import('./windows/cpu.js')).cpu();
    default:
      return cloneObj((await import('./common/defaults.js')).initCpuResult);
  }
};
