import { ANDROID, DARWIN, LINUX, WINDOWS } from './common/const';
import type { UsbData } from './common/types';

export const usb = async (): Promise<UsbData[] | null> => {
  switch (true) {
    case LINUX || ANDROID:
      return (await import('./linux/usb.js')).usb();
    case DARWIN:
      return (await import('./darwin/usb.js')).usb();
    case WINDOWS:
      return (await import('./windows/usb.js')).usb();
    default:
      return null;
  }
};
