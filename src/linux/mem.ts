import { readFile } from 'node:fs/promises';
import { freemem, totalmem } from 'node:os';
import { cloneObj, getValue, nextTick, toInt } from '../common';
import { initMemData } from '../common/defaults';
import type { MemData } from '../common/types';

export const mem = async (): Promise<MemData> => {
  await nextTick();
  const defaults = cloneObj(initMemData);
  try {
    const stdout = await readFile('/proc/meminfo');
    const lines = stdout.toString().split('\n');
    let total = toInt(getValue(lines, 'memtotal'));
    total = total ? total * 1024 : totalmem();
    let free = toInt(getValue(lines, 'memfree'));
    free = free ? free * 1024 : freemem();
    const used = total - free;

    let buffers = toInt(getValue(lines, 'buffers'));
    buffers = buffers ? buffers * 1024 : 0;
    let cached = toInt(getValue(lines, 'cached'));
    cached = cached ? cached * 1024 : 0;
    let slab = toInt(getValue(lines, 'slab'));
    slab = slab ? slab * 1024 : 0;
    const buffcache = buffers + cached + slab;

    let available = toInt(getValue(lines, 'memavailable'));
    available = available ? available * 1024 : free + buffcache;
    const active = total - available;

    let swaptotal = toInt(getValue(lines, 'swaptotal'));
    swaptotal = swaptotal ? swaptotal * 1024 : 0;
    let swapfree = toInt(getValue(lines, 'swapfree'));
    swapfree = swapfree ? swapfree * 1024 : 0;
    const swapused = swaptotal - swapfree;
    let writeback = toInt(getValue(lines, 'writeback'));
    writeback = writeback ? writeback * 1024 : 0;
    let dirty = toInt(getValue(lines, 'dirty'));
    dirty = dirty ? dirty * 1024 : 0;

    let reclaimable = toInt(getValue(lines, 'sreclaimable'));
    reclaimable = reclaimable ? reclaimable * 1024 : 0;

    return {
      total,
      free,
      used,
      active,
      available,
      buffers,
      cached,
      slab,
      buffcache,
      reclaimable,
      swaptotal,
      swapused,
      swapfree,
      writeback,
      dirty
    };
  } catch {}
  return defaults;
};
