'use strict';

import { bsdUsers } from './bsd/users';
import { sunUsers } from './sun/users';
import { linuxUsers } from './linux/users';
import { darwinUsers } from './darwin/users';
import { windowsUsers } from './windows/users';
import { UserData } from './common/types';

import { AIX, ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';

export const users = () => {
  return new Promise<UserData[] | null | undefined>(resolve => {
    process.nextTick(() => {
      switch (true) {
        case LINUX:
          return resolve(linuxUsers());
        case NETBSD || FREEBSD:
          return resolve(bsdUsers());
        case SUNOS:
          return resolve(sunUsers());
        case DARWIN:
          return resolve(darwinUsers());
        case WINDOWS:
          return resolve(windowsUsers());
        default:
          return resolve(null);
      }
    });
  });
};
