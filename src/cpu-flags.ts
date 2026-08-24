import { ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, OPENBSD, WINDOWS } from './common/const';

export const cpuFlags = async () => {
  switch (true) {
    case LINUX || ANDROID:
      return (await import('./linux/cpu-flags.js')).cpuFlags();
    case FREEBSD || NETBSD || OPENBSD:
      return (await import('./bsd/cpu-flags.js')).cpuFlags();
    case DARWIN:
      return (await import('./darwin/cpu-flags.js')).cpuFlags();
    case WINDOWS:
      return (await import('./windows/cpu-flags.js')).cpuFlags();
    default:
      return null;
  }
};
