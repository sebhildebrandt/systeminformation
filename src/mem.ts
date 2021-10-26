'use strict';

import { linuxMem } from './linux/mem';
import { bsdMem } from './bsd/mem';
import { darwinMem } from './darwin/mem';
import { windowsMem } from './windows/mem';

import { DARWIN, FREEBSD, LINUX, NETBSD, WINDOWS } from './common/const';
import { nextTick } from './common';

export const mem = async () => {
  await nextTick();
  switch (true) {
    case LINUX:
      return linuxMem();
    case NETBSD || FREEBSD:
      return bsdMem();
    case DARWIN:
      return darwinMem();
    case WINDOWS:
      return windowsMem();
    default:
      return null;
  }
};
