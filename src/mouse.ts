import { DARWIN, LINUX, WINDOWS } from './common/const';
import type { MouseData } from './common/types';

export const mouse = async (): Promise<MouseData[]> => {
  switch (true) {
    case LINUX:
      return (await import('./linux/mouse.js')).mouse();
    case DARWIN:
      return (await import('./darwin/mouse.js')).mouse();
    case WINDOWS:
      return (await import('./windows/mouse.js')).mouse();
    default:
      return [];
  }
};
