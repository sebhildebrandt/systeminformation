'use strict';

import { nixSystem } from './linux/system';
import { darwinSystem } from './darwin/system';
import { windowsSystem } from './windows/system';
import { BluetoothObject, SystemData } from './common/types';

import { AIX, ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';
import { nextTick } from './common';

export const system = async () => {
  await nextTick();
  switch (true) {
    case LINUX:
      return nixSystem();
    case DARWIN:
      return darwinSystem();
    case WINDOWS:
      return windowsSystem();
    default:
      return null;
  }
};
