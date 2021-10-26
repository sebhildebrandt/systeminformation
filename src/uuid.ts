'use strict';

import { linuxUuid } from './linux/uuid';
import { bsdUuid } from './bsd/uuid';
import { darwinUuid } from './darwin/uuid';
import { windowsUuid } from './windows/uuid';
import { MemData, UuidData } from './common/types';

import { AIX, ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';

export const uuid = () => {
  return new Promise<UuidData | null>(resolve => {
    process.nextTick(() => {
      switch (true) {
        case LINUX:
          return resolve(linuxUuid());
        case NETBSD || FREEBSD:
          return resolve(bsdUuid());
        case DARWIN:
          return resolve(darwinUuid());
        case WINDOWS:
          return resolve(windowsUuid());
        default:
          return resolve(null);
      }
    });
  });
};
