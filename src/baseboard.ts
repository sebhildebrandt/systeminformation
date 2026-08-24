import { ANDROID, DARWIN, LINUX, WINDOWS } from './common/const';

export const baseboard = async () => {
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
