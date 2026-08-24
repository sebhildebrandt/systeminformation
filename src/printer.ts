import { ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, OPENBSD, WINDOWS } from './common/const';

export const printer = async () => {
  switch (true) {
    case LINUX || FREEBSD || NETBSD || OPENBSD || ANDROID:
      return (await import('./linux/printer.js')).printer();
    case DARWIN:
      return (await import('./darwin/printer.js')).printer();
    case WINDOWS:
      return (await import('./windows/printer.js')).printer();
    default:
      return null;
  }
};
