import { LINUX, WINDOWS, DARWIN, FREEBSD, NETBSD, SUNOS, ANDROID, OPENBSD } from './common/const';
import type { ProcessesData } from './common/types';

export const processes = async (): Promise<ProcessesData | null> => {
  switch (true) {
    case LINUX || FREEBSD || NETBSD || OPENBSD || DARWIN || SUNOS || ANDROID:
      return (await import('./linux/processes.js')).processes();
    case WINDOWS:
      return (await import('./windows/processes.js')).processes();
    default:
      return null;
  }
};
