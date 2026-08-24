import { initFsOpenFiles } from '../common/defaults';
import { cloneObj, nextTick, toInt } from '../common';
import { FsOpenFilesData } from '../common/types';
import { ps } from '../common/windows';

export const fsOpenFiles = async (): Promise<FsOpenFilesData> => {
  await nextTick();
  const defaults = cloneObj(initFsOpenFiles);
  try {
    // Windows has no kernel-wide file limit; system-wide handle count is the closest metric
    const data = await ps.exec("Get-CimInstance Win32_PerfRawData_PerfProc_Process -Filter \"Name='_Total'\" | Select-Object HandleCount | ConvertTo-Json");
    if (data) {
      return {
        ...defaults,
        allocated: toInt(data.HandleCount)
      };
    }
  } catch {}
  return defaults;
};
