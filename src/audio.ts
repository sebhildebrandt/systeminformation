'use strict';

import { nixAudio } from './linux/audio';
import { darwinAudio } from './darwin/audio';
import { windowsAudio } from './windows/audio';

import { DARWIN, FREEBSD, LINUX, NETBSD, WINDOWS } from './common/const';
import { nextTick } from './common';

export const audio = async () => {
  await nextTick();
  switch (true) {
    case LINUX || FREEBSD || NETBSD:
      return nixAudio();
    case DARWIN:
      return darwinAudio();
    case WINDOWS:
      return windowsAudio();
    default:
      return null;
  }
};
