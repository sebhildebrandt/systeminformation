import { readFileTimed, runDiskSpeed } from '../common/disk-speed';
import { execFile } from '../common/exec';
import type { DiskSpeedData } from '../common/types';

// GNU dd iflag=nocache count=0 drops the cached pages of this file (fadvise, no root); busybox / BSD lack it
const readUncached = async (file: string, bytes: number) => {
  try {
    await execFile('dd', [`if=${file}`, 'iflag=nocache', 'count=0'], { timeout: 10000 });
  } catch {
    return null;
  }
  return readFileTimed(file, bytes);
};

export const diskSpeed = (path?: string, sizeMB?: number): Promise<DiskSpeedData | null> => runDiskSpeed(path, sizeMB, { readUncached });
