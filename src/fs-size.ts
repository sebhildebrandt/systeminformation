import { DARWIN, FREEBSD, LINUX, NETBSD, OPENBSD, WINDOWS } from './common/const';
import type { FsSizeData } from './common/types';

export const fsSize = async (drives?: string | string[]): Promise<FsSizeData[]> => {
  drives = Array.isArray(drives) ? drives : drives ? [drives] : [];
  if (drives.includes('*')) {
    drives = [];
  }
  switch (true) {
    case LINUX || DARWIN || NETBSD || FREEBSD || OPENBSD:
      return (await import('./linux/fs-size.js')).fsSize(drives);
    case WINDOWS:
      return (await import('./windows/fs-size.js')).fsSize(drives);
    default:
      return [];
  }
};
