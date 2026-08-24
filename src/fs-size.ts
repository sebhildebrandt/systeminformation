import { DARWIN, FREEBSD, LINUX, NETBSD, OPENBSD, WINDOWS } from './common/const';

export const fsSize = async (drives?: string | string[]) => {
  if (drives) {
    if (!Array.isArray(drives)) {
      drives = [drives];
    }
  } else {
    drives = [];
  }
  switch (true) {
    case LINUX || DARWIN || NETBSD || FREEBSD || OPENBSD:
      return (await import('./linux/fs-size.js')).fsSize(drives);
    case WINDOWS:
      return (await import('./windows/fs-size.js')).fsSize(drives);
    default:
      return null;
  }
};
