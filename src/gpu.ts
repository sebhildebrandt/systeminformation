import { ANDROID, DARWIN, LINUX, WINDOWS } from './common/const';
import type { GpuData } from './common/types';

export const gpu = async (): Promise<GpuData[] | null> => {
  switch (true) {
    case LINUX || ANDROID:
      return (await import('./linux/gpu.js')).gpu();
    case DARWIN:
      return (await import('./darwin/gpu.js')).gpu();
    case WINDOWS:
      return (await import('./windows/gpu.js')).gpu();
    default:
      return null;
  }
};
