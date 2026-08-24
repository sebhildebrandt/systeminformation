import { ANDROID, DARWIN, LINUX, WINDOWS } from './common/const';

export const bios = async () => {
  switch (true) {
    case LINUX || ANDROID:
      return (await import('./linux/bios.js')).bios();
    case DARWIN:
      return (await import('./darwin/bios.js')).bios();
    case WINDOWS:
      return (await import('./windows/bios.js')).bios();
    default:
      return null;
  }
};
