'use strict';

import { linuxUsb } from './linux/usb';
import { darwinUsb } from './darwin/usb';
import { windowsUsb } from './windows/usb';
import { UsbData } from './common/types';

import { AIX, ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';
import { nextTick } from './common';

export const usb = async () => {
  await nextTick();
  switch (true) {
    case LINUX:
      return linuxUsb();
    case DARWIN:
      return darwinUsb();
    case WINDOWS:
      return windowsUsb();
    default:
      return null;
  }
};
