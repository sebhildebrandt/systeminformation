import { cloneObj } from './common';
import { ANDROID, DARWIN, LINUX, WINDOWS } from './common/const';
import type { ChassisData } from './common/types';

export const chassis = async (): Promise<ChassisData> => {
  switch (true) {
    case LINUX || ANDROID:
      return (await import('./linux/chassis.js')).chassis();
    case DARWIN:
      return (await import('./darwin/chassis.js')).chassis();
    case WINDOWS:
      return (await import('./windows/chassis.js')).chassis();
    default:
      return cloneObj((await import('./common/defaults.js')).initChassis);
  }
};
