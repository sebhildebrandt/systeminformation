import { DARWIN, LINUX, WINDOWS } from './common/const';
import type { SoftwareData } from './common/types';

export const software = async (): Promise<SoftwareData[]> => {
  switch (true) {
    case LINUX:
      return (await import('./linux/software.js')).software();
    case DARWIN:
      return (await import('./darwin/software.js')).software();
    case WINDOWS:
      return (await import('./windows/software.js')).software();
    default:
      return [];
  }
};
