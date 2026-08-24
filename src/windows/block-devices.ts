import { nextTick, toInt } from '../common';
import { matchDevicesWin } from '../common/filesys';
import type { FsBlockDevicesData } from '../common/types';
import { ps, psArray } from '../common/windows';

const parseBlockDevices = (logicalDisks: any[]): FsBlockDevicesData[] => {
  const drivetypes = ['Unknown', 'NoRoot', 'Removable', 'Local', 'Network', 'CD/DVD', 'RAM'];

  const data: FsBlockDevicesData[] = [];
  logicalDisks.forEach((logicalDisk: any) => {
    if (logicalDisk && logicalDisk.DriveType != null) {
      const drivetype = toInt(logicalDisk.DriveType);
      data.push({
        name: logicalDisk.Name || '',
        identifier: logicalDisk.Caption || '',
        type: 'disk',
        fsType: (logicalDisk.FileSystem || '').toLowerCase(),
        mount: logicalDisk.Caption || '',
        size: toInt(logicalDisk.Size),
        physical: drivetype >= 0 && drivetype <= 6 ? drivetypes[drivetype] : drivetypes[0],
        uuid: logicalDisk.VolumeSerialNumber || '',
        label: logicalDisk.VolumeName || '',
        model: '',
        serial: logicalDisk.VolumeSerialNumber || '',
        removable: drivetype === 2,
        protocol: '',
        group: '',
        device: ''
      });
    }
  });
  return data;
};

export const blockDevices = async (): Promise<FsBlockDevicesData[]> => {
  await nextTick();
  try {
    const [logicalDisks, diskDrives] = await Promise.all([
      ps.exec('Get-CimInstance -ClassName Win32_LogicalDisk | select Caption,DriveType,Name,FileSystem,Size,VolumeSerialNumber,VolumeName | ConvertTo-Json'),
      ps.exec(
        "Get-WmiObject -Class Win32_diskdrive | Select-Object -Property PNPDeviceId,DeviceID, Model, Size, @{L='Partitions'; E={$_.GetRelated('Win32_DiskPartition').GetRelated('Win32_LogicalDisk') | Select-Object -Property DeviceID, VolumeName, Size, FreeSpace}} | fl"
      )
    ]);
    const data = parseBlockDevices(psArray(logicalDisks));
    return matchDevicesWin(data, String(diskDrives).split(/\n\s*\n/));
  } catch {
    return [];
  }
};
