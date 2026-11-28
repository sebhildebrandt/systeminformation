import { readFile } from 'node:fs/promises';
import { freemem, totalmem } from 'node:os';
import { getValue, nextTick, toInt } from '../common';
import { initMemData } from '../common/defaults';
import { readFileLines } from '../common/files';
import type { MemData } from '../common/types';

// ZFS keeps its ARC outside the page cache - the data buffers are raw pages, so no /proc/meminfo
// field knows about them and MemAvailable counts them as gone. ARC does release them on demand
// but never shrinks below c_min, so everything above c_min is available. Same correction htop
// applies (#808). kstat lines are "name type data"
export const parseArcstats = (lines: string[]) => {
  let size = 0;
  let cMin = 0;
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 3) {
      continue;
    }
    if (parts[0] === 'size') {
      size = toInt(parts[2]);
    } else if (parts[0] === 'c_min') {
      cMin = toInt(parts[2]);
    }
  }
  return Math.max(size - cMin, 0);
};

const _swap = { pswpin: 0, pswpout: 0, ms: 0, swapin_sec: null as number | null, swapout_sec: null as number | null };

// pages swapped in / out per second since the previous call - pswpin / pswpout are cumulative since boot
const swapActivity = async () => {
  const lines = await readFileLines('/proc/vmstat');
  const pswpin = toInt(getValue(lines, 'pswpin', ' '));
  const pswpout = toInt(getValue(lines, 'pswpout', ' '));
  const now = Date.now();
  if (lines.length && _swap.ms && now > _swap.ms) {
    const seconds = (now - _swap.ms) / 1000;
    _swap.swapin_sec = Math.max(0, pswpin - _swap.pswpin) / seconds;
    _swap.swapout_sec = Math.max(0, pswpout - _swap.pswpout) / seconds;
  }
  if (lines.length) {
    _swap.pswpin = pswpin;
    _swap.pswpout = pswpout;
    _swap.ms = now;
  }
  return { swapin_sec: _swap.swapin_sec, swapout_sec: _swap.swapout_sec };
};

export const mem = async (): Promise<MemData> => {
  await nextTick();
  const defaults = initMemData();
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
    // file is missing without zfs - readFileLines returns [] and the correction is 0
    available = Math.min(total, available + parseArcstats(await readFileLines('/proc/spl/kstat/zfs/arcstats')));
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
      dirty,
      ...(await swapActivity())
    };
  } catch {}
  return defaults;
};
