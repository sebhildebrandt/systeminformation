import { getValue, nextTick, toInt } from '../common';
import { sanitizeShellString } from '../common/security';
import type { FsSizeData } from '../common/types';
import { ps } from '../common/windows';

const parseFsSize = (stdout: string) => {
  const data: FsSizeData[] = [];
  const devices = stdout.toString().split(/\n\s*\n/);
  devices.forEach((device) => {
    const lines = device.split('\r\n');
    const size = toInt(getValue(lines, 'size', ':'));
    const free = toInt(getValue(lines, 'freespace', ':'));
    const caption = getValue(lines, 'caption', ':');
    const rwValue = getValue(lines, 'access', ':');
    const rw = rwValue ? toInt(rwValue) !== 1 : null;

    if (size) {
      data.push({
        fs: caption,
        type: getValue(lines, 'filesystem', ':'),
        size,
        used: size - free,
        available: free,
        use: parseFloat(((100.0 * (size - free)) / size).toFixed(2)),
        mount: caption,
        rw
      });
    }
  });
  return data;
};

export const fsSize = async (drives: string[]) => {
  await nextTick();
  let data: FsSizeData[] = [];
  try {
    const conditions = drives
      .map((drive) => (drive ? sanitizeShellString(drive, true) : ''))
      .filter((drive) => drive !== '')
      .map((drive) => `$_.Caption -eq '${drive}'`);
    const filter = conditions.length ? ` | where { ${conditions.join(' -or ')} }` : '';
    const stdout: string = await ps.exec(`Get-CimInstance Win32_logicaldisk | select Access,Caption,FileSystem,FreeSpace,Size${filter} | fl`);
    data = parseFsSize(String(stdout));
  } catch {}
  return data;
};
