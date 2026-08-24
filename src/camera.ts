import { DARWIN, LINUX, WINDOWS } from './common/const';

export const camera = async () => {
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
