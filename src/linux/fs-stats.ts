import { initFsStats } from '../common/defaults';
import { cloneObj } from '../common/index';
import { exec } from '../common/exec';
import { FsStatsData } from '../common/types';
import { nextTick, toInt } from '../common';
import { calcFsSpeed, _fs_speed } from '../common/filesys';
import { sanitizeShellString } from '../common/security';
import { execOptsLinux } from '../common/const';

export const fsStats = async (): Promise<FsStatsData> => {
  await nextTick();
  if ((_fs_speed && !_fs_speed.ms) || (_fs_speed?.ms && Date.now() - _fs_speed.ms >= 500)) {
    const defaults = cloneObj(initFsStats);
    let stdout = '';
    let rx = 0;
    let wx = 0;

    try {
      ({ stdout } = await exec('lsblk -r 2>/dev/null | grep /', execOptsLinux));
      const lines = stdout.toString().split('\n');
      const fs_filter: any = [];
      lines.forEach((line: string) => {
        if (line !== '') {
          const lineParts = line.trim().split(' ');
          const dev = sanitizeShellString(lineParts[0] || '', true);
          if (dev && fs_filter.indexOf(dev) === -1) {
            fs_filter.push(dev);
          }
        }
      });

      const output = fs_filter.join('|');
      try {
        ({ stdout } = await exec('cat /proc/diskstats | egrep "' + output + '"', execOptsLinux));
        const lines = stdout.toString().split('\n');
        lines.forEach((line) => {
          line = line.trim();
          if (line !== '') {
            const lineParts = line.replace(/ +/g, ' ').split(' ');

            rx += toInt(lineParts[5]) * 512;
            wx += toInt(lineParts[9]) * 512;
          }
        });
        return calcFsSpeed(rx, wx);
      } catch {
        return defaults;
      }
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
