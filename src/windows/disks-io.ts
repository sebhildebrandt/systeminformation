import { initDiskIo } from '../common/defaults';
import { cloneObj, nextTick, toInt } from '../common';
import { DisksIoData } from '../common/types';
import { calcDiskIO, _disk_io } from '../common/filesys';
import { ps } from '../common/windows';

export const disksIO = async (): Promise<DisksIoData> => {
  await nextTick();
  if ((_disk_io && !_disk_io.ms) || (_disk_io && _disk_io.ms && Date.now() - _disk_io.ms >= 500)) {
    const defaults = cloneObj(initDiskIo);
    try {
      // raw perf counters: DiskReadsPersec/DiskWritesPersec hold cumulative operation counts
      const data = await ps.exec("Get-CimInstance Win32_PerfRawData_PerfDisk_PhysicalDisk -Filter \"Name='_Total'\" | Select-Object DiskReadsPersec,DiskWritesPersec | ConvertTo-Json");
      if (!data) {
        return defaults;
      }
      const rIO = toInt(data.DiskReadsPersec);
      const wIO = toInt(data.DiskWritesPersec);
      return calcDiskIO(rIO, wIO, 0, 0, 0);
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
