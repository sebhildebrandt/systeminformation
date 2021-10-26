import { linuxOsInfo } from './linux/os-info';
import { bsdOsInfo } from './bsd/os-info';
import { darwinOsInfo } from './darwin/os-info';
import { sunOsInfo } from './sun/os-info';
import { windowsOsInfo } from './windows/os-info';

import { DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';
import { nextTick } from './common';

export const osInfo = async () => {
  await nextTick();
  switch (true) {
    case LINUX:
      return linuxOsInfo();
    case NETBSD || FREEBSD:
      return bsdOsInfo();
    case DARWIN:
      return darwinOsInfo();
    case SUNOS:
      return sunOsInfo();
    case WINDOWS:
      return windowsOsInfo();
    default:
      return null;
  }
};
