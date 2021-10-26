'use strict';

import { nixPrinter } from './linux/printer';
import { darwinPrinter } from './darwin/printer';
import { windowsPrinter } from './windows/printer';
import { PrinterData } from './common/types';

import { AIX, ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';

export const printer = () => {
  return new Promise<PrinterData[] | null>(resolve => {
    process.nextTick(() => {
      switch (true) {
        case LINUX || FREEBSD || NETBSD:
          return resolve(nixPrinter());
        case DARWIN:
          return resolve(darwinPrinter());
        case WINDOWS:
          return resolve(windowsPrinter());
        default:
          return resolve(null);
      }
    });
  });
};
