'use strict';

import { linuxOsInfo } from './linux/osInfo';
import { bsdOsInfo } from './bsd/osInfo';
import { darwinOsInfo } from './darwin/osInfo';
import { sunOsInfo } from './sun/osInfo';
import { windowsOsInfo } from './windows/osInfo';
import { OsData } from './common/types';

import { AIX, ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';
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
