import { ANDROID, DARWIN, LINUX, WINDOWS } from './common/const';
import type { FanData } from './common/types';

export const fans = async (): Promise<FanData[]> => {
  switch (true) {
    case LINUX || ANDROID:
      return (await import('./linux/fans.js')).fans();
    case DARWIN:
      return (await import('./darwin/fans.js')).fans();
    case WINDOWS:
      return (await import('./windows/fans.js')).fans();
    default:
      return [];
  }
};
