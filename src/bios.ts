import { nixBios } from './linux/bios';
import { darwinBios } from './darwin/bios';
import { windowsBios } from './windows/bios';

import { DARWIN, LINUX, WINDOWS } from './common/const';
import { nextTick } from './common';

export const bios = async () => {
  await nextTick();
  switch (true) {
    case LINUX:
      return nixBios();
    case DARWIN:
      return darwinBios();
    case WINDOWS:
      return windowsBios();
    default:
      return null;
  }
};
