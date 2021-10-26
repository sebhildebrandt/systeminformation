'use strict';

import { linuxCpuTemperature } from './linux/cpuTemperature';
import { darwinCpuTemperature } from './darwin/cpuTemperature';
import { windowsCpuTemperature } from './windows/cpuTemperature';
import { bsdCpuTemperature } from './bsd/cpuTemperature';
import { CpuTemperatureObject } from './common/types';

import { AIX, ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';

export const cpuTemperature = () => {
  return new Promise<CpuTemperatureObject | null | undefined>(resolve => {
    process.nextTick(() => {
      switch (true) {
        case LINUX:
          return resolve(linuxCpuTemperature());
        case FREEBSD || NETBSD:
          return resolve(bsdCpuTemperature());
        case DARWIN:
          return resolve(darwinCpuTemperature());
        case WINDOWS:
          return resolve(windowsCpuTemperature());
        default:
          return resolve(null);
      }
    });
  });
};
