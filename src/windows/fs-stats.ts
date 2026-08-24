import { initFsStats } from '../common/defaults';
import { cloneObj, nextTick, toInt } from '../common';
import { FsStatsData } from '../common/types';
import { calcFsSpeed, _fs_speed } from '../common/filesys';
import { ps } from '../common/windows';

export const fsStats = async (): Promise<FsStatsData> => {
  await nextTick();
  if ((_fs_speed && !_fs_speed.ms) || (_fs_speed && _fs_speed.ms && Date.now() - _fs_speed.ms >= 500)) {
    const defaults = cloneObj(initFsStats);
    try {
      // raw perf counters: DiskReadBytesPersec/DiskWriteBytesPersec hold cumulative byte counts
      const data = await ps.exec("Get-CimInstance Win32_PerfRawData_PerfDisk_PhysicalDisk -Filter \"Name='_Total'\" | Select-Object DiskReadBytesPersec,DiskWriteBytesPersec | ConvertTo-Json");
      if (!data) {
        return defaults;
      }
      const rx = toInt(data.DiskReadBytesPersec);
      const wx = toInt(data.DiskWriteBytesPersec);
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
