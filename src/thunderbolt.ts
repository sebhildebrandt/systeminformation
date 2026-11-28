import { DARWIN, LINUX, WINDOWS } from './common/const';
import type { ThunderboltData } from './common/types';

export const thunderbolt = async (): Promise<ThunderboltData[]> => {
  switch (true) {
    case LINUX:
      return (await import('./linux/thunderbolt.js')).thunderbolt();
    case DARWIN:
      return (await import('./darwin/thunderbolt.js')).thunderbolt();
    case WINDOWS:
      return (await import('./windows/thunderbolt.js')).thunderbolt();
    default:
      return [];
  }
};
