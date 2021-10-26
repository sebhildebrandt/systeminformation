import { bsdUsers } from './bsd/users';
import { sunUsers } from './sun/users';
import { linuxUsers } from './linux/users';
import { darwinUsers } from './darwin/users';
import { windowsUsers } from './windows/users';

import { DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';
import { nextTick } from './common';

export const users = async () => {
  await nextTick();
  switch (true) {
    case LINUX:
      return linuxUsers();
    case NETBSD || FREEBSD:
      return bsdUsers();
    case SUNOS:
      return sunUsers();
    case DARWIN:
      return darwinUsers();
    case WINDOWS:
      return windowsUsers();
    default:
      return null;
  }
};
