import type { MemData } from '../common/types';
import { cloneObj, nextTick } from '../common';
import { initMemData } from '../common/defaults';
import { ps } from '../common/windows';

export const mem = async (): Promise<MemData> => {
  await nextTick();
  const result = cloneObj(initMemData);
  try {
    let swaptotal = 0;
    let swapused = 0;
    const stdout = await ps.exec('Get-CimInstance Win32_PageFileUsage | Select AllocatedBaseSize, CurrentUsage');
    const lines = stdout
      .toString()
      .split('\r\n')
      .filter((line: string) => line.trim() !== '');
    lines.shift(); // drop table header
    lines.forEach((line: string) => {
      if (line !== '') {
        const lineParts = line.trim().split(/\s\s+/);
        swaptotal = swaptotal + (parseInt(lineParts[0], 10) || 0);
        swapused = swapused + (parseInt(lineParts[1], 10) || 0);
      }
    });
    result.swaptotal = swaptotal * 1024 * 1024;
    result.swapused = swapused * 1024 * 1024;
    result.swapfree = result.swaptotal - result.swapused;
  } catch {}
  return result;
};
