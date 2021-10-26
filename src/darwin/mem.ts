'use strict';

import { noop } from '../common';
import { initMemData } from '../common/initials';
import { MemData } from '../common/types';
import { execCmd } from '../common/exec';

export const darwinMem = async () => {
  let result = initMemData;
  try {
    let stdout = (await execCmd('vm_stat 2>/dev/null | grep "Pages active"')).toString();
    let lines = stdout.split('\n');

    result.active = parseInt(lines[0].split(':')[1], 10) * 4096;
    result.buffcache = result.used - result.active;
    result.available = result.free + result.buffcache;
    stdout = (await execCmd('sysctl -n vm.swapusage 2>/dev/null')).toString();
    lines = stdout.split('\n');
    if (lines.length > 0) {
      let line = lines[0].replace(/,/g, '.').replace(/M/g, '');
      const lineParts = line.trim().split('  ');
      for (let i = 0; i < lineParts.length; i++) {
        if (lineParts[i].toLowerCase().indexOf('total') !== -1) { result.swaptotal = parseFloat(lineParts[i].split('=')[1].trim()) * 1024 * 1024; }
        if (lineParts[i].toLowerCase().indexOf('used') !== -1) { result.swapused = parseFloat(lineParts[i].split('=')[1].trim()) * 1024 * 1024; }
        if (lineParts[i].toLowerCase().indexOf('free') !== -1) { result.swapfree = parseFloat(lineParts[i].split('=')[1].trim()) * 1024 * 1024; }
      }
    }
  } catch (e) {
    noop();
  }
  return result;
};

export const mem = () => {
  return new Promise<MemData>(resolve => {
    process.nextTick(() => {
      return resolve(darwinMem());
    });
  });
};
