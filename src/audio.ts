import { DARWIN, FREEBSD, LINUX, NETBSD, OPENBSD, WINDOWS, ANDROID } from './common/const';
import type { AudioData } from './common/types';

export const audio = async (): Promise<AudioData[] | null> => {
  const newLocal = LINUX || FREEBSD || NETBSD || OPENBSD || ANDROID;
  switch (true) {
    case newLocal:
      return (await import('./linux/audio.js')).audio();
    case DARWIN:
      return (await import('./darwin/audio.js')).audio();
    case WINDOWS:
      return (await import('./windows/audio.js')).audio();
    default:
      return null;
  }
};
