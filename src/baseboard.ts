import { ANDROID, DARWIN, LINUX, WINDOWS } from './common/const';
import type { BaseboardData } from './common/types';

export const baseboard = async (): Promise<BaseboardData | null> => {
  switch (true) {
    case LINUX || ANDROID:
      return (await import('./linux/baseboard.js')).baseboard();
    case DARWIN:
      return (await import('./darwin/baseboard.js')).baseboard();
    case WINDOWS:
      return (await import('./windows/baseboard.js')).baseboard();
    default:
      return null;
  }
};
