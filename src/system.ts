import { ANDROID, DARWIN, LINUX, WINDOWS } from './common/const';

export const system = async () => {
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
