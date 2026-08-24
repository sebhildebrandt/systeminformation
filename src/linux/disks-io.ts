import { initDiskIo } from '../common/defaults';
import { cloneObj } from '../common/index';
import { exec } from '../common/exec';
import { DisksIoData } from '../common/types';
import { nextTick, toInt } from '../common';
import { calcDiskIO, _disk_io } from '../common/filesys';
import { execOptsLinux } from '../common/const';

export const disksIO = async (): Promise<DisksIoData> => {
  await nextTick();
  if ((_disk_io && !_disk_io.ms) || (_disk_io && _disk_io.ms && Date.now() - _disk_io.ms >= 500)) {
    const defaults = cloneObj(initDiskIo);
    let rIO = 0;
    let wIO = 0;
    let rWaitTime = 0;
    let wWaitTime = 0;
    let tWaitTime = 0;

    try {
      const cmd =
        'for mount in `lsblk 2>/dev/null | grep " disk " | sed "s/[│└─├]//g" | awk \'{$1=$1};1\' | cut -d " " -f 1 | sort -u`; do cat /sys/block/$mount/stat | sed -r "s/ +/;/g" | sed -r "s/^;//"; done';

      const { stdout } = await exec(cmd, execOptsLinux);
      const lines = stdout.split('\n');
      lines.forEach(function (line) {
        // ignore empty lines
        if (!line) {
          return;
        }

        // sum r/wIO of all disks to compute all disks IO
        const stats = line.split(';');
        rIO += toInt(stats[0]);
        wIO += toInt(stats[4]);
        rWaitTime += toInt(stats[3]);
        wWaitTime += toInt(stats[7]);
        tWaitTime += toInt(stats[10]);
      });
      return calcDiskIO(rIO, wIO, rWaitTime, wWaitTime, tWaitTime);
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
      rWaitTime: _disk_io.rWaitTime,
      wWaitTime: _disk_io.wWaitTime,
      tWaitTime: _disk_io.tWaitTime,
      rWaitPercent: _disk_io.rWaitPercent,
      wWaitPercent: _disk_io.wWaitPercent,
      tWaitPercent: _disk_io.tWaitPercent
    };
  }
};
