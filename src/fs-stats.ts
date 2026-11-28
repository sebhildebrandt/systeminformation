import { cloneObj } from './common';
import { DARWIN, LINUX, WINDOWS } from './common/const';
import type { FsStatsData } from './common/types';

export const fsStats = async (): Promise<FsStatsData> => {
  switch (true) {
    case LINUX:
      return (await import('./linux/fs-stats.js')).fsStats();
    case DARWIN:
      return (await import('./darwin/fs-stats.js')).fsStats();
    case WINDOWS:
      return (await import('./windows/fs-stats.js')).fsStats();
    default:
      return cloneObj((await import('./common/defaults.js')).initFsStats);
  }
};
