import { initFsStats } from '../common/defaults';
import { cloneObj } from '../common/index';
import { exec } from '../common/exec';
import { FsStatsData } from '../common/types';
import { nextTick, toInt } from '../common';
import { calcFsSpeed, _fs_speed } from '../common/filesys';
import { MAX_BUFFER_SIZE } from '../common/const';

export const fsStats = async (): Promise<FsStatsData> => {
  await nextTick();
  if ((_fs_speed && !_fs_speed.ms) || (_fs_speed && _fs_speed.ms && Date.now() - _fs_speed.ms >= 500)) {
    const defaults = cloneObj(initFsStats);
    let rx = 0;
    let wx = 0;
    try {
      const { stdout } = await exec('ioreg -c IOBlockStorageDriver -k Statistics -r -w0 | sed -n "/IOBlockStorageDriver/,/Statistics/p" | grep "Statistics" | tr -cd "01234567890,\n"', {
        maxBuffer: MAX_BUFFER_SIZE
      });
      const lines = stdout.toString().split('\n');
      lines.forEach(function (line) {
        line = line.trim();
        if (line !== '') {
          const lineParts = line.split(',');

          rx += toInt(lineParts[2]);
          wx += toInt(lineParts[9]);
        }
      });
      return calcFsSpeed(rx, wx);
    } catch {
      return defaults;
    }
  } else {
    return {
      ms: _fs_speed.last_ms,
      rx: _fs_speed.bytes_read,
      wx: _fs_speed.bytes_write,
      tx: _fs_speed.bytes_read + _fs_speed.bytes_write,
      rx_sec: _fs_speed.rx_sec,
      wx_sec: _fs_speed.wx_sec,
      tx_sec: _fs_speed.tx_sec
    };
  }
};
