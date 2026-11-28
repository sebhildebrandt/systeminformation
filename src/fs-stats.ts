import { DARWIN, LINUX, WINDOWS } from './common/const';
import type { FsStatsData } from './common/types';

export const fsStats = async (): Promise<FsStatsData | null> => {
  switch (true) {
    case LINUX:
      return (await import('./linux/fs-stats.js')).fsStats();
    case DARWIN:
      return (await import('./darwin/fs-stats.js')).fsStats();
    case WINDOWS:
      return (await import('./windows/fs-stats.js')).fsStats();
    default:
      return null;
  }
};
