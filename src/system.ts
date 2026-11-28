import { ANDROID, DARWIN, LINUX, WINDOWS } from './common/const';
import type { SystemData } from './common/types';

export const system = async (): Promise<SystemData | null> => {
  switch (true) {
    case LINUX || ANDROID:
      return (await import('./linux/system.js')).system();
    case DARWIN:
      return (await import('./darwin/system.js')).system();
    case WINDOWS:
      return (await import('./windows/system.js')).system();
    default:
      return null;
  }
};
