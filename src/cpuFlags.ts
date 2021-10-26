'use strict';

import { linuxCpuFlags } from './linux/cpuFlags';
import { darwinCpuFlags } from './darwin/cpuFlags';
import { windowsCpuFlags } from './windows/cpuFlags';
import { bsdCpuFlags } from './bsd/cpuFlags';

import { AIX, ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './common/const';

export const cpuFlags = () => {
  return () => {
    new Promise<string | null>(resolve => {
      process.nextTick(() => {
        switch (true) {
          case LINUX:
            return resolve(linuxCpuFlags());
          case FREEBSD || NETBSD:
            return resolve(bsdCpuFlags());
          case DARWIN:
            return resolve(darwinCpuFlags());
          case WINDOWS:
            return resolve(windowsCpuFlags());
          default:
            return resolve(null);
        }
      });
    });
  };
};
