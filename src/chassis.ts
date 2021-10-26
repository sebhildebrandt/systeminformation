'use strict';

import { nixChassis } from './linux/chassis';
import { darwinChassis } from './darwin/chassis';
import { windowsChassis } from './windows/chassis';

import { DARWIN, LINUX, WINDOWS } from './common/const';
import { nextTick } from './common';

export const chassis = async () => {
  await nextTick();
  switch (true) {
    case LINUX:
      return nixChassis();
    case DARWIN:
      return darwinChassis();
    case WINDOWS:
      return windowsChassis();
    default:
      return null;
  }
};
