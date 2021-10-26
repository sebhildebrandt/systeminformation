import { linuxUuid } from './linux/uuid';
import { bsdUuid } from './bsd/uuid';
import { darwinUuid } from './darwin/uuid';
import { windowsUuid } from './windows/uuid';

import { DARWIN, FREEBSD, LINUX, NETBSD, WINDOWS } from './common/const';
import { nextTick } from './common';

export const uuid = async () => {
  await nextTick();
  switch (true) {
    case LINUX:
      return linuxUuid();
    case NETBSD || FREEBSD:
      return bsdUuid();
    case DARWIN:
      return darwinUuid();
    case WINDOWS:
      return windowsUuid();
    default:
      return null;
  }
};
