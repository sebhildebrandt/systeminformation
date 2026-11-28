import { cloneObj } from './common';
import { DARWIN, FREEBSD, LINUX, NETBSD, OPENBSD, WINDOWS } from './common/const';
import type { UuidData } from './common/types';

export const uuid = async (): Promise<UuidData> => {
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
      return cloneObj((await import('./common/defaults.js')).initUUID);
  }
};
