import { readFileTimed, runDiskSpeed } from '../common/disk-speed';
import { execFile } from '../common/exec';
import type { DiskSpeedData } from '../common/types';

// GNU dd: iflag=nocache with count=0 drops the cached pages of exactly this file
// (posix_fadvise DONTNEED, no root needed). busybox / BSD dd lack it -> no read value
const readUncached = async (file: string, bytes: number) => {
  try {
    await execFile('dd', [`if=${file}`, 'iflag=nocache', 'count=0'], { timeout: 10000 });
  } catch {
    return null;
  }
  return readFileTimed(file, bytes);
};

export const diskSpeed = (path?: string, sizeMB?: number): Promise<DiskSpeedData | null> => runDiskSpeed(path, sizeMB, { readUncached });
