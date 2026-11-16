import { readFileTimed, runDiskSpeed } from '../common/disk-speed';
import type { DiskSpeedData } from '../common/types';

// F_NOCACHE via optional macos-smc - must be set before writing, cached pages are not evicted
const noCache = (fd: number) => {
  try {
    const smc = require('macos-smc');
    return typeof smc.noCache === 'function' && smc.noCache(fd) === true;
  } catch {
    return false;
  }
};

export const diskSpeed = (path?: string, sizeMB?: number): Promise<DiskSpeedData | null> =>
  runDiskSpeed(path, sizeMB, {
    prepareWrite: noCache,
    readUncached: (file, bytes) => readFileTimed(file, bytes, noCache)
  });
