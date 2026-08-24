import { ANDROID, DARWIN, LINUX, WINDOWS } from './common/const';

export const chassis = async () => {
  switch (true) {
    case LINUX || ANDROID:
      return (await import('./linux/chassis.js')).chassis();
    case DARWIN:
      return (await import('./darwin/chassis.js')).chassis();
    case WINDOWS:
      return (await import('./windows/chassis.js')).chassis();
    default:
      return null;
  }
};
