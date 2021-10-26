'use strict';

import { nixInetLatency } from './linux/inetLatency';
import { sunInetLatency } from './sun/inetLatency';
import { windowsInetLatency } from './windows/inetLatency';
import { WifiConnectionData } from './common/types';

import { AIX, ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';

export const inetLatency = (host: string) => {
  return new Promise<number | null | undefined>(resolve => {
    process.nextTick(() => {
      switch (true) {
        case LINUX || DARWIN || NETBSD || FREEBSD:
          return resolve(nixInetLatency(host));
        case SUNOS:
          return resolve(sunInetLatency(host));
        case WINDOWS:
          return resolve(windowsInetLatency(host));
        default:
          return resolve(null);
      }
    });
  });
};
