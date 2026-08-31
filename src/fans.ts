import { ANDROID, DARWIN, LINUX, WINDOWS } from './common/const';

export const fans = async () => {
  switch (true) {
    case LINUX || ANDROID:
      return (await import('./linux/fans.js')).fans();
    case DARWIN:
      return (await import('./darwin/fans.js')).fans();
    case WINDOWS:
      return (await import('./windows/fans.js')).fans();
    default:
      return null;
  }
};
