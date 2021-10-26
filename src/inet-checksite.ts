import { nixInetCheckSite } from './linux/inet-checksite';
import { windowsInetCheckSite } from './windows/inet-checksite';

import { DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';
import { nextTick } from './common';

export const inetChecksite = async (url: string) => {
  await nextTick();
  switch (true) {
    case LINUX || DARWIN || SUNOS || NETBSD || FREEBSD:
      return nixInetCheckSite(url);
    case WINDOWS:
      return windowsInetCheckSite(url);
    default:
      return null;
  }
};
