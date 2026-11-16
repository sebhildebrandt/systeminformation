import { readFileTimed, runDiskSpeed } from '../common/disk-speed';
import type { DiskSpeedData } from '../common/types';

// node cannot bypass the unified buffer cache - the optional macos-smc package (Apple Silicon)
// sets F_NOCACHE. It has to be set before writing: already cached pages are not evicted.
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
