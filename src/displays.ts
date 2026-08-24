import { ANDROID, DARWIN, LINUX, WINDOWS } from './common/const';

export const displays = async () => {
  switch (true) {
    case LINUX || ANDROID:
      return (await import('./linux/displays.js')).displays();
    case DARWIN:
      return (await import('./darwin/displays.js')).displays();
    case WINDOWS:
      return (await import('./windows/displays.js')).displays();
    default:
      return null;
  }
};
