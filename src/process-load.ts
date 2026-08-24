import { LINUX, WINDOWS, DARWIN, FREEBSD, NETBSD, SUNOS, ANDROID, OPENBSD } from './common/const';

export const processLoad = async (proc: string) => {
  switch (true) {
    case LINUX || FREEBSD || NETBSD || OPENBSD || DARWIN || SUNOS || ANDROID:
      return (await import('./linux/process-load.js')).processLoad(proc);
    case WINDOWS:
      return (await import('./windows/process-load.js')).processLoad(proc);
    default:
      return null;
  }
};
