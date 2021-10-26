'use strict';

import { linuxCpuTemperature } from './linux/cpuTemperature';
import { darwinCpuTemperature } from './darwin/cpuTemperature';
import { windowsCpuTemperature } from './windows/cpuTemperature';
import { bsdCpuTemperature } from './bsd/cpuTemperature';
import { CpuTemperatureObject } from './common/types';

import { AIX, ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';
import { nextTick } from './common';

export const cpuTemperature = async () => {
  await nextTick();
  switch (true) {
    case LINUX:
      return linuxCpuTemperature();
    case FREEBSD || NETBSD:
      return bsdCpuTemperature();
    case DARWIN:
      return darwinCpuTemperature();
    case WINDOWS:
      return windowsCpuTemperature();
    default:
      return null;
  }
};
