import { ANDROID, DARWIN, LINUX, WINDOWS } from './common/const';
import type { DisplayData } from './common/types';

export const displays = async (): Promise<DisplayData[]> => {
  switch (true) {
    case LINUX || ANDROID:
      return (await import('./linux/displays.js')).displays();
    case DARWIN:
      return (await import('./darwin/displays.js')).displays();
    case WINDOWS:
      return (await import('./windows/displays.js')).displays();
    default:
      return [];
  }
};
