import { cloneObj } from './common';
import { DARWIN, FREEBSD, LINUX, NETBSD, OPENBSD, WINDOWS } from './common/const';
import type { DisksIOData } from './common/types';

export const disksIO = async (): Promise<DisksIOData> => {
  switch (true) {
    case LINUX || FREEBSD || NETBSD || OPENBSD:
      return (await import('./linux/disks-io.js')).disksIO();
    case DARWIN:
      return (await import('./darwin/disks-io.js')).disksIO();
    case WINDOWS:
      return (await import('./windows/disks-io.js')).disksIO();
    default:
      return cloneObj((await import('./common/defaults.js')).initDiskIo);
  }
};
