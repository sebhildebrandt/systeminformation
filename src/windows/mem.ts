'use strict';

import { noop } from '../common';
import { initMemData } from '../common/initials';
import { MemData } from '../common/types';
import { powerShell } from '../common/exec';

export const windowsMem = async () => {
  let result = initMemData;
  try {
    let swaptotal = 0;
    let swapused = 0;
    const stdout = await powerShell('Get-CimInstance Win32_PageFileUsage | Select AllocatedBaseSize, CurrentUsage');
    let lines = stdout.split('\r\n').filter(line => line.trim() !== '').filter((line, idx) => idx > 0);
    lines.forEach(function (line) {
      if (line !== '') {
        const lineParts = line.trim().split(/\s\s+/);
        swaptotal = swaptotal + (parseInt(lineParts[0], 10) || 0);
        swapused = swapused + (parseInt(lineParts[1], 10) || 0);
      }
    });
    result.swaptotal = swaptotal * 1024 * 1024;
    result.swapused = swapused * 1024 * 1024;
    result.swapfree = result.swaptotal - result.swapused;
  } catch (e) {
    noop();
  }
  return result;
};

export const mem = () => {
  return new Promise<MemData>(resolve => {
    process.nextTick(() => {
      return resolve(windowsMem());
    });
  });
};
