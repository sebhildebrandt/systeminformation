'use strict';

import { linuxMem } from './linux/mem';
import { bsdMem } from './bsd/mem';
import { darwinMem } from './darwin/mem';
import { windowsMem } from './windows/mem';
import { MemData } from './common/types';

import { AIX, ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';

export const mem = () => {
  return new Promise<MemData | null>(resolve => {
    process.nextTick(() => {
      switch (true) {
        case LINUX:
          return resolve(linuxMem());
        case NETBSD || FREEBSD:
          return resolve(bsdMem());
        case DARWIN:
          return resolve(darwinMem());
        case WINDOWS:
          return resolve(windowsMem());
        default:
          return resolve(null);
      }
    });
  });
};
