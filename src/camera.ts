import { DARWIN, LINUX, WINDOWS } from './common/const';
import type { CameraData } from './common/types';

export const camera = async (): Promise<CameraData[] | null> => {
  switch (true) {
    case LINUX:
      return (await import('./linux/camera.js')).camera();
    case DARWIN:
      return (await import('./darwin/camera.js')).camera();
    case WINDOWS:
      return (await import('./windows/camera.js')).camera();
    default:
      return null;
  }
};
