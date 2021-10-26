'use strict';

import { nixBios } from './linux/bios';
import { darwinBios } from './darwin/bios';
import { windowsBios } from './windows/bios';
import { BiosData } from './common/types';

import { AIX, ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';

export const bios = () => {
  return new Promise<BiosData | null>(resolve => {
    process.nextTick(() => {
      switch (true) {
        case LINUX:
          return resolve(nixBios());
        case DARWIN:
          return resolve(darwinBios());
        case WINDOWS:
          return resolve(windowsBios());
        default:
          return resolve(null);
      }
    });
  });
};
