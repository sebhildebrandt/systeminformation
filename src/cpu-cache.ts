import { DARWIN, FREEBSD, LINUX, NETBSD, OPENBSD, WINDOWS } from './common/const';

export const cpuCache = async () => {
  switch (true) {
    case LINUX:
      return (await import('./linux/cpu-cache.js')).cpuCache();
    case FREEBSD || NETBSD || OPENBSD:
      return (await import('./bsd/cpu-cache.js')).cpuCache();
    case DARWIN:
      return (await import('./darwin/cpu-cache.js')).cpuCache();
    case WINDOWS:
      return (await import('./windows/cpu-cache.js')).cpuCache();
    default:
      return null;
  }
};
