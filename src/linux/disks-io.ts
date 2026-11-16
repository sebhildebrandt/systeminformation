import { readdir } from 'node:fs/promises';
import { nextTick, toInt } from '../common';
import { initDiskIo } from '../common/defaults';
import { readSysfs } from '../common/files';
import { _disk_io, calcDiskIO } from '../common/filesys';
import { cloneObj } from '../common/index';
import { isSafePathSegment } from '../common/security';
import type { DisksIoData } from '../common/types';

let _diskCount = -1;

export const disksIO = async (): Promise<DisksIoData> => {
  await nextTick();
  if ((_disk_io && !_disk_io.ms) || (_disk_io && _disk_io.ms && Date.now() - _disk_io.ms >= 500)) {
    const defaults = cloneObj(initDiskIo);
    let rIO = 0;
    let wIO = 0;
    let rWaitTime = 0;
    let wWaitTime = 0;
    let tWaitTime = 0;
    let busyTime = 0;
    let diskCount = 0;

    try {
      // skip virtual, rom and stacked devices
      const disks = (await readdir('/sys/block')).filter((dev) => !/^(loop|ram|zram|dm-|md|sr|fd|nbd|zd)/.test(dev) && isSafePathSegment(dev));
      const lines = await Promise.all(disks.map((dev) => readSysfs(`/sys/block/${dev}/stat`)));
      lines.forEach((line) => {
        // ignore empty lines
        if (!line) {
          return;
        }

        // sum r/wIO of all disks to compute all disks IO
        const stats = line.trim().split(/\s+/);
        rIO += toInt(stats[0]);
        wIO += toInt(stats[4]);
        rWaitTime += toInt(stats[3]);
        wWaitTime += toInt(stats[7]);
        tWaitTime += toInt(stats[10]);
        // io_ticks - the source of iostat %util, here averaged over all disks
        busyTime += toInt(stats[9]);
        diskCount++;
      });
      // a disk added or removed shifts the average - no valid delta for this interval
      if (diskCount !== _diskCount) {
        _disk_io.busyTime = null;
        _diskCount = diskCount;
      }
      return calcDiskIO(rIO, wIO, rWaitTime, wWaitTime, tWaitTime, diskCount ? busyTime / diskCount : null);
    } catch {
      return defaults;
    }
  } else {
    return {
      rIO: _disk_io.rIO,
      wIO: _disk_io.wIO,
      tIO: _disk_io.rIO + _disk_io.wIO,
      ms: _disk_io.last_ms,
      rIO_sec: _disk_io.rIO_sec,
      wIO_sec: _disk_io.wIO_sec,
      tIO_sec: _disk_io.tIO_sec,
      rWaitTime: _disk_io.rWaitTimeDelta,
      wWaitTime: _disk_io.wWaitTimeDelta,
      tWaitTime: _disk_io.tWaitTimeDelta,
      rWaitPercent: _disk_io.rWaitPercent,
      wWaitPercent: _disk_io.wWaitPercent,
      tWaitPercent: _disk_io.tWaitPercent,
      busyPercent: _disk_io.busyPercent,
      idlePercent: _disk_io.idlePercent
    };
  }
};
