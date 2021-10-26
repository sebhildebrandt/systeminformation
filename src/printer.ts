'use strict';

import { nixPrinter } from './linux/printer';
import { darwinPrinter } from './darwin/printer';
import { windowsPrinter } from './windows/printer';
import { PrinterData } from './common/types';

import { AIX, ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';
import { nextTick } from './common';

export const printer = async () => {
  await nextTick();
  switch (true) {
    case LINUX || FREEBSD || NETBSD:
      return nixPrinter();
    case DARWIN:
      return darwinPrinter();
    case WINDOWS:
      return windowsPrinter();
    default:
      return null;
  }
};
