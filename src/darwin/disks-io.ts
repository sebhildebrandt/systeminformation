import { initDiskIo } from '../common/defaults';
import { cloneObj } from '../common/index';
import { exec } from '../common/exec';
import { DisksIoData } from '../common/types';
import { nextTick, toInt } from '../common';
import { calcDiskIO, _disk_io } from '../common/filesys';
import { MAX_BUFFER_SIZE } from '../common/const';

export const disksIO = async (): Promise<DisksIoData> => {
  await nextTick();
  if ((_disk_io && !_disk_io.ms) || (_disk_io && _disk_io.ms && Date.now() - _disk_io.ms >= 500)) {
    const defaults = cloneObj(initDiskIo);
    let rIO = 0;
    let wIO = 0;
    const rWaitTime = 0;
    const wWaitTime = 0;
    const tWaitTime = 0;

    try {
      const { stdout } = await exec('ioreg -c IOBlockStorageDriver -k Statistics -r -w0 | sed -n "/IOBlockStorageDriver/,/Statistics/p" | grep "Statistics" | tr -cd "01234567890,\n"', {
        maxBuffer: MAX_BUFFER_SIZE
      });
      const lines = stdout.toString().split('\n');
      lines.forEach(function (line) {
        line = line.trim();
        if (line !== '') {
          const lineParts = line.split(',');

          rIO += toInt(lineParts[10]);
          wIO += toInt(lineParts[0]);
        }
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
