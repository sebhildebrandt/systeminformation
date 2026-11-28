import { DARWIN, FREEBSD, LINUX, NETBSD, OPENBSD, WINDOWS } from './common/const';
import type { DiskSpeedData } from './common/types';

export const diskSpeed = async (path?: string, sizeMB?: number): Promise<DiskSpeedData | null> => {
  switch (true) {
    case LINUX || FREEBSD || NETBSD || OPENBSD:
      return (await import('./linux/disk-speed.js')).diskSpeed(path, sizeMB);
    case DARWIN:
      return (await import('./darwin/disk-speed.js')).diskSpeed(path, sizeMB);
    case WINDOWS:
      return (await import('./windows/disk-speed.js')).diskSpeed(path, sizeMB);
    default:
      return null;
  }
};
