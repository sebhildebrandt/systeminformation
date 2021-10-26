import { nixInetLatency } from './linux/inet-latency';
import { sunInetLatency } from './sun/inet-latency';
import { windowsInetLatency } from './windows/inet-latency';

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
