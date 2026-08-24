import { DARWIN, FREEBSD, LINUX, NETBSD, OPENBSD, WINDOWS } from './common/const';

export const disksIO = async () => {
  switch (true) {
    case LINUX || FREEBSD || NETBSD || OPENBSD:
      return (await import('./linux/disks-io.js')).disksIO();
    case DARWIN:
      return (await import('./darwin/disks-io.js')).disksIO();
    case WINDOWS:
      return (await import('./windows/disks-io.js')).disksIO();
    default:
      return null;
  }
};
