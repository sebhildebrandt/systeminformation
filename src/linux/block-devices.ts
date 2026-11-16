import { nextTick, toInt } from '../common';
import { execOptsLinux } from '../common/const';
import { exec } from '../common/exec';
import { readSysfs } from '../common/files';
import { applyPoolsLinux, blkStdoutToObject, btrfsPoolsLinux, matchDevicesLinux, parseLinuxBlk, raidMatchLinux, zfsPoolsLinux } from '../common/filesys';
import { isSafePathSegment } from '../common/security';
import type { FsBlockDevicesData } from '../common/types';

const poolMatchLinux = async (data: FsBlockDevicesData[]) => applyPoolsLinux(data, [...(await zfsPoolsLinux(data)), ...(await btrfsPoolsLinux(data))]);

// sysfs reports the start in 512 byte sectors, independent of the logical sector size
const partStartLinux = async (data: FsBlockDevicesData[]) => {
  await Promise.all(
    data
      .filter((item) => item.type === 'part' && isSafePathSegment(item.name))
      .map(async (item) => {
        const start = await readSysfs(`/sys/class/block/${item.name}/start`);
        item.partStart = start ? toInt(start) * 512 : null;
      })
  );
  return data;
};

export const blockDevices = async (): Promise<FsBlockDevicesData[]> => {
  await nextTick();
  let stdout = '';
  try {
    ({ stdout } = await exec('lsblk -bPo NAME,TYPE,SIZE,FSTYPE,MOUNTPOINT,UUID,ROTA,RO,RM,TRAN,SERIAL,LABEL,MODEL,OWNER,PARTUUID,PARTLABEL,PARTTYPE,PARTFLAGS 2>/dev/null', execOptsLinux));
    const lines = blkStdoutToObject(stdout).split('\n');
    let data = parseLinuxBlk(lines);
    data = await raidMatchLinux(data);
    data = await poolMatchLinux(data);
    return partStartLinux(matchDevicesLinux(data));
  } catch {
    try {
      ({ stdout } = await exec('lsblk -bPo NAME,TYPE,SIZE,FSTYPE,MOUNTPOINT,UUID,ROTA,RO,RM,LABEL,MODEL,OWNER 2>/dev/null', execOptsLinux));
      const lines = blkStdoutToObject(stdout).split('\n');
      const data = parseLinuxBlk(lines);
      return partStartLinux(await poolMatchLinux(await raidMatchLinux(data)));
    } catch {
      return [];
    }
  }
};
