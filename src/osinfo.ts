'use strict';

import { linuxOsInfo } from './linux/osInfo';
import { bsdOsInfo } from './bsd/osInfo';
import { darwinOsInfo } from './darwin/osInfo';
import { sunOsInfo } from './sun/osInfo';
import { windowsOsInfo } from './windows/osInfo';
import { OsData } from './common/types';

import { AIX, ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';

export const osInfo = () => {
  return new Promise<OsData | null>(resolve => {
    process.nextTick(() => {
      switch (true) {
        case LINUX:
          return resolve(linuxOsInfo());
        case NETBSD || FREEBSD:
          return resolve(bsdOsInfo());
        case DARWIN:
          return resolve(darwinOsInfo());
        case SUNOS:
          return resolve(sunOsInfo());
        case WINDOWS:
          return resolve(windowsOsInfo());
        default:
          return resolve(null);
      }
    });
  });
};
