import { ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, OPENBSD, SUNOS, WINDOWS } from './common/const';

export const osInfo = async () => {
  switch (true) {
    case LINUX || ANDROID:
      return (await import('./linux/os-info.js')).osInfo();
    case NETBSD || FREEBSD || OPENBSD:
      return (await import('./bsd/os-info.js')).osInfo();
    case DARWIN:
      return (await import('./darwin/os-info.js')).osInfo();
    case SUNOS:
      return (await import('./sun/os-info.js')).osInfo();
    case WINDOWS:
      return (await import('./windows/os-info.js')).osInfo();
    default:
      return null;
  }
};
