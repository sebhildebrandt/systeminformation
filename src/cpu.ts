'use strict';

import { linuxCpu } from './linux/cpu';
import { darwinCpu } from './darwin/cpu';
import { windowsCpu } from './windows/cpu';
import { bsdCpu } from './bsd/cpu';
import { CpuObject } from './common/types';

import { AIX, ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';
import { nextTick } from './common';

export const cpu = async () => {
  await nextTick();
  switch (true) {
    case LINUX:
      return linuxCpu();
    case FREEBSD || NETBSD:
      return bsdCpu();
    case DARWIN:
      return darwinCpu();
    case WINDOWS:
      return windowsCpu();
    default:
      return null;
  }
};
