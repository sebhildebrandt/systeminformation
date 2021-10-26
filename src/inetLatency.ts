'use strict';

import { nixInetLatency } from './linux/inetLatency';
import { sunInetLatency } from './sun/inetLatency';
import { windowsInetLatency } from './windows/inetLatency';

import { DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';
import { nextTick } from './common';

export const inetLatency = async (host: string) => {
  await nextTick();
  switch (true) {
    case LINUX || DARWIN || NETBSD || FREEBSD:
      return nixInetLatency(host);
    case SUNOS:
      return sunInetLatency(host);
    case WINDOWS:
      return windowsInetLatency(host);
    default:
      return null;
  }
};
