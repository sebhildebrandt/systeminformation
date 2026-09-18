import { exec } from '../common/exec';
import { FsBlockDevicesData } from '../common/types';
import { nextTick } from '../common';
import { applyPoolsLinux, blkStdoutToObject, btrfsPoolsLinux, matchDevicesLinux, parseLinuxBlk, raidMatchLinux, zfsPoolsLinux } from '../common/filesys';
import { execOptsLinux } from '../common/const';

const poolMatchLinux = async (data: FsBlockDevicesData[]) => applyPoolsLinux(data, [...(await zfsPoolsLinux(data)), ...(await btrfsPoolsLinux(data))]);

export const blockDevices = async (): Promise<FsBlockDevicesData[]> => {
  await nextTick();
  let stdout = '';
  try {
    ({ stdout } = await exec('lsblk -bPo NAME,TYPE,SIZE,FSTYPE,MOUNTPOINT,UUID,ROTA,RO,RM,TRAN,SERIAL,LABEL,MODEL,OWNER 2>/dev/null', execOptsLinux));
    const lines = blkStdoutToObject(stdout).split('\n');
    let data = parseLinuxBlk(lines);
    data = await raidMatchLinux(data);
    data = await poolMatchLinux(data);
    return matchDevicesLinux(data);
  } catch {
    try {
      ({ stdout } = await exec('lsblk -bPo NAME,TYPE,SIZE,FSTYPE,MOUNTPOINT,UUID,ROTA,RO,RM,LABEL,MODEL,OWNER 2>/dev/null', execOptsLinux));
      const lines = blkStdoutToObject(stdout).split('\n');
      const data = parseLinuxBlk(lines);
      return await poolMatchLinux(await raidMatchLinux(data));
    } catch {
      return [];
    }
  }
};
