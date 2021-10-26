'use strict';

import { nixBaseboard } from './linux/baseboard';
import { darwinBaseboard } from './darwin/baseboard';
import { windowsBaseboard } from './windows/baseboard';
import { BluetoothObject, BaseboardData } from './common/types';

import { AIX, ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';
import { nextTick } from './common';

export const baseboard = async () => {
  await nextTick();
  switch (true) {
    case LINUX:
      return nixBaseboard();
    case DARWIN:
      return darwinBaseboard();
    case WINDOWS:
      return windowsBaseboard();
    default:
      return null;
  }
};
