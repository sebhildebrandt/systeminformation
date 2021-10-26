'use strict';

import { nixSystem } from './linux/system';
import { darwinSystem } from './darwin/system';
import { windowsSystem } from './windows/system';

import { DARWIN, LINUX, WINDOWS } from './common/const';
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
