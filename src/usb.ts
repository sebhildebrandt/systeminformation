'use strict';

import { linuxUsb } from './linux/usb';
import { darwinUsb } from './darwin/usb';
import { windowsUsb } from './windows/usb';
import { UsbData } from './common/types';

import { AIX, ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';

export const usb = () => {
  return new Promise<UsbData[] | null>(resolve => {
    process.nextTick(() => {
      switch (true) {
        case LINUX:
          return resolve(linuxUsb());
        case DARWIN:
          return resolve(darwinUsb());
        case WINDOWS:
          return resolve(windowsUsb());
        default:
          return resolve(null);
      }
    });
  });
};
