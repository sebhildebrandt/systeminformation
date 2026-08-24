import { ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, OPENBSD, WINDOWS } from './common/const';

export const mem = async () => {
  switch (true) {
    case LINUX || ANDROID:
      return (await import('./linux/mem.js')).mem();
    case NETBSD || FREEBSD || OPENBSD:
      return (await import('./bsd/mem.js')).mem();
    case DARWIN:
      return (await import('./darwin/mem.js')).mem();
    case WINDOWS:
      return (await import('./windows/mem.js')).mem();
    default:
      return null;
  }
};
