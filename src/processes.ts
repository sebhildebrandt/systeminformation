import { LINUX, WINDOWS, DARWIN, FREEBSD, NETBSD, SUNOS, ANDROID, OPENBSD } from './common/const';

export const processes = async () => {
  switch (true) {
    case LINUX || FREEBSD || NETBSD || OPENBSD || DARWIN || SUNOS || ANDROID:
      return (await import('./linux/processes.js')).processes();
    case WINDOWS:
      return (await import('./windows/processes.js')).processes();
    default:
      return null;
  }
};
