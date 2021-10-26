import { nixMemLayout } from './linux/mem-layout';
import { darwinMemLayout } from './darwin/mem-layout';
import { windowsMemLayout } from './windows/mem-layout';

import { DARWIN, FREEBSD, LINUX, NETBSD, WINDOWS } from './common/const';
import { nextTick } from './common';

export const memLayout = async () => {
  await nextTick();
  switch (true) {
    case LINUX || NETBSD || FREEBSD:
      return nixMemLayout();
    case DARWIN:
      return darwinMemLayout();
    case WINDOWS:
      return windowsMemLayout();
    default:
      return null;
  }
};
