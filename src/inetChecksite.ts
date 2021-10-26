'use strict';

import { nixInetCheckSite } from './linux/inetChecksite';
import { windowsInetCheckSite } from './windows/inetChecksite';
import { InetChecksiteData } from './common/types';

import { AIX, ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';

export const inetChecksite = (url: string) => {
  return new Promise<InetChecksiteData | null | undefined>(resolve => {
    process.nextTick(() => {
      switch (true) {
        case LINUX || DARWIN || SUNOS || NETBSD || FREEBSD:
          return resolve(nixInetCheckSite(url));
        case WINDOWS:
          return resolve(windowsInetCheckSite(url));
        default:
          return resolve(null);
      }
    });
  });
};
