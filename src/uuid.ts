import { DARWIN, FREEBSD, LINUX, NETBSD, OPENBSD, WINDOWS } from './common/const';

export const uuid = async () => {
  switch (true) {
    case LINUX:
      return (await import('./linux/uuid.js')).uuid();
    case NETBSD || FREEBSD || OPENBSD:
      return (await import('./bsd/uuid.js')).uuid();
    case DARWIN:
      return (await import('./darwin/uuid.js')).uuid();
    case WINDOWS:
      return (await import('./windows/uuid.js')).uuid();
    default:
      return null;
  }
};
