import { ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, OPENBSD, WINDOWS } from './common/const';
import type { PrinterData } from './common/types';

export const printer = async (): Promise<PrinterData[]> => {
  switch (true) {
    case LINUX || FREEBSD || NETBSD || OPENBSD || ANDROID:
      return (await import('./linux/printer.js')).printer();
    case DARWIN:
      return (await import('./darwin/printer.js')).printer();
    case WINDOWS:
      return (await import('./windows/printer.js')).printer();
    default:
      return [];
  }
};
