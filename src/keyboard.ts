import { DARWIN, LINUX, WINDOWS } from './common/const';

export const keyboard = async () => {
  switch (true) {
    case LINUX:
      return (await import('./linux/keyboard.js')).keyboard();
    case DARWIN:
      return (await import('./darwin/keyboard.js')).keyboard();
    case WINDOWS:
      return (await import('./windows/keyboard.js')).keyboard();
    default:
      return null;
  }
};
