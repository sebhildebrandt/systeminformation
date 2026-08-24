import { readFile } from 'fs/promises';
import { initFsOpenFiles } from '../common/defaults';
import { cloneObj } from '../common/index';
import { FsOpenFilesData } from '../common/types';
import { nextTick, toInt } from '../common';

export const fsOpenFiles = async (): Promise<FsOpenFilesData> => {
  await nextTick();
  const defaults = cloneObj(initFsOpenFiles);
  let allocated = defaults.allocated;
  let available = defaults.available;
  let max = defaults.max;
  try {
    const lines = (await readFile('/proc/sys/fs/file-nr')).toString().split('\n');
    if (lines[0]) {
      const parts = lines[0].replace(/\s+/g, ' ').split(' ');
      if (parts.length === 3) {
        allocated = toInt(parts[0]);
        available = toInt(parts[1]);
        max = toInt(parts[2]);
        if (!available) {
          available = max - allocated;
        }
      }
    }
  } catch {
    try {
      const lines = (await readFile('/proc/sys/fs/file-max')).toString().split('\n');
      if (lines[0]) {
        max = toInt(lines[0]);
      }
    } catch {}
  }
  return {
    ...defaults,
    allocated,
    available,
    max
  };
};
