import * as os from 'os';
import { promises as fs } from 'fs';
import { getValue, nextTick } from '../common';
import { initMemData } from '../common/defaults';

export const linuxMem = async () => {
  const result = initMemData;
  try {
    const stdout = await fs.readFile('/proc/meminfo');
    const lines = stdout.toString().split('\n');
    result.total = parseInt(getValue(lines, 'memtotal'), 10);
    result.total = result.total ? result.total * 1024 : os.totalmem();
    result.free = parseInt(getValue(lines, 'memfree'), 10);
    result.free = result.free ? result.free * 1024 : os.freemem();
    result.used = result.total - result.free;

    result.buffers = parseInt(getValue(lines, 'buffers'), 10);
    result.buffers = result.buffers ? result.buffers * 1024 : 0;
    result.cached = parseInt(getValue(lines, 'cached'), 10);
    result.cached = result.cached ? result.cached * 1024 : 0;
    result.slab = parseInt(getValue(lines, 'slab'), 10);
    result.slab = result.slab ? result.slab * 1024 : 0;
    result.buffcache = result.buffers + result.cached + result.slab;

    const available = parseInt(getValue(lines, 'memavailable'), 10);
    result.available = available ? available * 1024 : result.free + result.buffcache;
    result.active = result.total - result.available;

    result.swaptotal = parseInt(getValue(lines, 'swaptotal'), 10);
    result.swaptotal = result.swaptotal ? result.swaptotal * 1024 : 0;
    result.swapfree = parseInt(getValue(lines, 'swapfree'), 10);
    result.swapfree = result.swapfree ? result.swapfree * 1024 : 0;
    result.swapused = result.swaptotal - result.swapfree;
  } catch { }
  return result;
};

export const mem = async () => {
  await nextTick();
  return linuxMem();
};
