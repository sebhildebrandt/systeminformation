import { DARWIN, LINUX, WINDOWS } from './common/const';

export const fsStats = async () => {
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
