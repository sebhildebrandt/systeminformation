'use strict';

import { nixMemLayout } from './linux/memLayout';
import { darwinMemLayout } from './darwin/memLayout';
import { windowsMemLayout } from './windows/memLayout';
import { MemLayoutData } from './common/types';

import { AIX, ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';

export const memLayout = () => {
  return new Promise<MemLayoutData[] | null>(resolve => {
    process.nextTick(() => {
      switch (true) {
        case LINUX || NETBSD || FREEBSD:
          return resolve(nixMemLayout());
        case DARWIN:
          return resolve(darwinMemLayout());
        case WINDOWS:
          return resolve(windowsMemLayout());
        default:
          return resolve(null);
      }
    });
  });
};
