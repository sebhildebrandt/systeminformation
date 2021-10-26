'use strict';

import { nixAudio } from './linux/audio';
import { darwinAudio } from './darwin/audio';
import { windowsAudio } from './windows/audio';
import { AudioObject } from './common/types';

import { AIX, ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';
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
