'use strict';

import { nixAudio } from './linux/audio';
import { darwinAudio } from './darwin/audio';
import { windowsAudio } from './windows/audio';
import { AudioObject } from './common/types';

import { AIX, ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';

export const audio = () => {
  return new Promise<AudioObject[] | null>(resolve => {
    process.nextTick(() => {
      switch (true) {
        case LINUX || FREEBSD || NETBSD:
          return resolve(nixAudio());
        case DARWIN:
          return resolve(darwinAudio());
        case WINDOWS:
          return resolve(windowsAudio());
        default:
          return resolve(null);
      }
    });
  });
};
