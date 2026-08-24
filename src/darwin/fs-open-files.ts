import { initFsOpenFiles } from '../common/defaults';
import { cloneObj } from '../common/index';
import { exec } from '../common/exec';
import { FsOpenFilesData } from '../common/types';
import { getValue, nextTick, toInt } from '../common';
import { MAX_BUFFER_SIZE } from '../common/const';

export const fsOpenFiles = async (): Promise<FsOpenFilesData> => {
  await nextTick();
  try {
    const { stdout, stderr } = await exec('sysctl -i kern.maxfiles kern.num_files kern.open_files', { maxBuffer: MAX_BUFFER_SIZE });
    if (!stderr) {
      const lines = stdout.split('\n');
      const max = toInt(getValue(lines, 'kern.maxfiles', ':'));
      const allocated = toInt(getValue(lines, 'kern.num_files', ':')) || toInt(getValue(lines, 'kern.open_files', ':'));
      return {
        max,
        allocated,
        available: max - allocated
      };
    }
  } catch {}
  return cloneObj(initFsOpenFiles);
};
