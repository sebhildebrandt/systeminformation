import { cloneObj, getValue, sortByKey, toInt, unique } from './index';
import { DARWIN, execOptsWin, FREEBSD, LINUX, NETBSD, WINDOWS } from './const';
import { initDiskIo, initFsBlockDevice, initFsStats } from './defaults';
import { exec, execSecure } from './exec';
import type { FsBlockDevicesData } from './types';

let _smartMonToolsInstalled: boolean | null = null;

export const smartMonToolsInstalled = async () => {
  if (_smartMonToolsInstalled !== null) {
    return _smartMonToolsInstalled;
  }
  _smartMonToolsInstalled = false;
  if (WINDOWS) {
    try {
      const { stdout } = await exec('WHERE smartctl 2>nul', execOptsWin);
      const pathArray = stdout.split('\r\n');
      if (pathArray?.length) {
        _smartMonToolsInstalled = pathArray[0].indexOf(':\\') >= 0;
      } else {
        _smartMonToolsInstalled = false;
      }
    } catch (e) {
      _smartMonToolsInstalled = false;
    }
  }
  if (LINUX || DARWIN || FREEBSD || NETBSD) {
    try {
      const { stdout } = await exec('which smartctl 2>/dev/null');
      const pathArray = stdout.split('\r\n');
      _smartMonToolsInstalled = pathArray.length > 0;
    } catch {}
  }
  return _smartMonToolsInstalled;
};

export const _fs_speed: any = {};

export const calcFsSpeed = (rx: number, wx: number) => {
  const result = cloneObj(initFsStats);

  if (_fs_speed?.ms) {
    result.rx = rx;
    result.wx = wx;
    result.tx = result.rx + result.wx;
    result.ms = Date.now() - _fs_speed.ms;
    result.rx_sec = (result.rx - _fs_speed.bytes_read) / (result.ms / 1000);
    result.wx_sec = (result.wx - _fs_speed.bytes_write) / (result.ms / 1000);
    result.tx_sec = result.rx_sec + result.wx_sec;
    _fs_speed.rx_sec = result.rx_sec;
    _fs_speed.wx_sec = result.wx_sec;
    _fs_speed.tx_sec = result.tx_sec;
    _fs_speed.bytes_read = result.rx;
    _fs_speed.bytes_write = result.wx;
    _fs_speed.bytes_overall = result.rx + result.wx;
    _fs_speed.ms = Date.now();
    _fs_speed.last_ms = result.ms;
  } else {
    result.rx = rx;
    result.wx = wx;
    result.tx = result.rx + result.wx;
    _fs_speed.rx_sec = null;
    _fs_speed.wx_sec = null;
    _fs_speed.tx_sec = null;
    _fs_speed.bytes_read = result.rx;
    _fs_speed.bytes_write = result.wx;
    _fs_speed.bytes_overall = result.rx + result.wx;
    _fs_speed.ms = Date.now();
    _fs_speed.last_ms = 0;
  }
  return result;
};

export const _disk_io: any = {};

export const calcDiskIO = (rIO: number, wIO: number, rWaitTime: number, wWaitTime: number, tWaitTime: number) => {
  const result = cloneObj(initDiskIo);
  if (_disk_io?.ms) {
    result.rIO = rIO;
    result.wIO = wIO;
    result.tIO = rIO + wIO;
    result.ms = Date.now() - _disk_io.ms;
    result.rIO_sec = (result.rIO - _disk_io.rIO) / (result.ms / 1000);
    result.wIO_sec = (result.wIO - _disk_io.wIO) / (result.ms / 1000);
    result.tIO_sec = result.rIO_sec + result.wIO_sec;
    result.rWaitTime = rWaitTime;
    result.wWaitTime = wWaitTime;
    result.tWaitTime = tWaitTime;
    result.rWaitPercent = ((result.rWaitTime - _disk_io.rWaitTime) * 100) / result.ms;
    result.wWaitPercent = ((result.wWaitTime - _disk_io.wWaitTime) * 100) / result.ms;
    result.tWaitPercent = ((result.tWaitTime - _disk_io.tWaitTime) * 100) / result.ms;
    _disk_io.rIO = rIO;
    _disk_io.wIO = wIO;
    _disk_io.rIO_sec = result.rIO_sec;
    _disk_io.wIO_sec = result.wIO_sec;
    _disk_io.tIO_sec = result.tIO_sec;
    _disk_io.rWaitTime = rWaitTime;
    _disk_io.wWaitTime = wWaitTime;
    _disk_io.tWaitTime = tWaitTime;
    _disk_io.rWaitPercent = result.rWaitPercent;
    _disk_io.wWaitPercent = result.wWaitPercent;
    _disk_io.tWaitPercent = result.tWaitPercent;
    _disk_io.last_ms = result.ms;
    _disk_io.ms = Date.now();
  } else {
    result.rIO = rIO;
    result.wIO = wIO;
    result.tIO = rIO + wIO;
    result.rWaitTime = rWaitTime;
    result.wWaitTime = wWaitTime;
    result.tWaitTime = tWaitTime;
    _disk_io.rIO = rIO;
    _disk_io.wIO = wIO;
    _disk_io.rIO_sec = null;
    _disk_io.wIO_sec = null;
    _disk_io.tIO_sec = null;
    _disk_io.rWaitTime = rWaitTime;
    _disk_io.wWaitTime = wWaitTime;
    _disk_io.tWaitTime = tWaitTime;
    _disk_io.rWaitPercent = null;
    _disk_io.wWaitPercent = null;
    _disk_io.tWaitPercent = null;
    _disk_io.last_ms = 0;
    _disk_io.ms = Date.now();
  }
  return result;
};

export const blkStdoutToObject = (stdout: string) => {
  return stdout
    .replace(/NAME=/g, '{"name":')
    .replace(/FSTYPE=/g, ',"fsType":')
    .replace(/TYPE=/g, ',"type":')
    .replace(/SIZE=/g, ',"size":')
    .replace(/MOUNTPOINT=/g, ',"mountpoint":')
    .replace(/UUID=/g, ',"uuid":')
    .replace(/ROTA=/g, ',"rota":')
    .replace(/RO=/g, ',"ro":')
    .replace(/RM=/g, ',"rm":')
    .replace(/TRAN=/g, ',"tran":')
    .replace(/SERIAL=/g, ',"serial":')
    .replace(/LABEL=/g, ',"label":')
    .replace(/MODEL=/g, ',"model":')
    .replace(/OWNER=/g, ',"owner":')
    .replace(/GROUP=/g, ',"group":')
    .replace(/\n/g, '}\n');
};

export const parseLinuxBlk = (lines: string[]): FsBlockDevicesData[] => {
  const defaults = cloneObj(initFsBlockDevice);
  let data: FsBlockDevicesData[] = [];

  lines
    .filter((line) => line !== '')
    .forEach((line) => {
      try {
        line = decodeURIComponent(line.replace(/\\x/g, '%'));
        line = line.replace(/\\/g, '\\\\');
        const disk: any = JSON.parse(line);
        data.push({
          ...defaults,
          name: disk.name,
          type: disk.type,
          fsType: disk.fsType,
          mount: disk.mountpoint,
          size: toInt(disk.size),
          physical: disk.type === 'disk' ? (disk.rota === '0' ? 'SSD' : 'HDD') : disk.type === 'rom' ? 'CD/DVD' : '',
          uuid: disk.uuid,
          label: disk.label,
          model: disk.model,
          serial: disk.serial,
          removable: disk.rm === '1',
          protocol: disk.tran,
          group: disk.group
        });
      } catch {}
    });
  data = unique(data);
  data = sortByKey(data, ['type', 'name']);
  return data;
};

const decodeMdabmData = (lines: string[]) => {
  const raid = getValue(lines, 'md_level', '=');
  const label = getValue(lines, 'md_name', '='); // <- get label info
  const uuid = getValue(lines, 'md_uuid', '='); // <- get uuid info
  const members: any = [];
  lines.forEach((line) => {
    if (line.toLowerCase().startsWith('md_device_dev') && line.toLowerCase().indexOf('/dev/') > 0) {
      members.push(line.split('/dev/')[1]);
    }
  });
  return {
    raid,
    label,
    uuid,
    members
  };
};

export const raidMatchLinux = async (data: FsBlockDevicesData[]) => {
  // for all block devices of type "raid%"
  let result = data;
  try {
    for (const element of data) {
      if (element.type.startsWith('raid')) {
        const stdout = await execSecure('mdadm', ['--export', '--detail', `/dev/${element.name}`]);
        const lines = stdout.split('\n');
        const mdData = decodeMdabmData(lines);

        element.label = mdData.label; // <- assign label info
        element.uuid = mdData.uuid; // <- assign uuid info

        if (mdData.members?.length && mdData.raid === element.type) {
          result = result.map((blockdevice) => {
            if (blockdevice.fsType === 'linux_raid_member' && mdData.members.indexOf(blockdevice.name) >= 0) {
              blockdevice.group = element.name;
            }
            return blockdevice;
          });
        }
      }
    }
  } catch {}
  return result;
};

const getDevicesLinux = (data: FsBlockDevicesData[]) => {
  const result: any = [];
  data.forEach((element) => {
    if (element.type.startsWith('disk')) {
      result.push(element.name);
    }
  });
  return result;
};

export const matchDevicesLinux = (data: FsBlockDevicesData[]): FsBlockDevicesData[] => {
  let result = data;
  try {
    const devices = getDevicesLinux(data);
    result = result.map((blockdevice) => {
      if (blockdevice.type.startsWith('part') || blockdevice.type.startsWith('disk')) {
        devices.forEach((element: any) => {
          if (blockdevice.name.startsWith(element)) {
            blockdevice.device = '/dev/' + element;
          }
        });
      }
      return blockdevice;
    });
  } catch {}
  return result;
};

const getDevicesWin = (diskDrives: string[]) => {
  const result: any = [];
  diskDrives.forEach((element) => {
    const lines = element.split('\r\n');
    const device = getValue(lines, 'DeviceID', ':');
    let partitions = element.split('@{DeviceID=');
    if (partitions.length > 1) {
      partitions = partitions.slice(1);
      partitions.forEach((partition) => {
        result.push({ name: partition.split(';')[0].toUpperCase(), device });
      });
    }
  });
  return result;
};

export const matchDevicesWin = (data: FsBlockDevicesData[], diskDrives: string[]) => {
  const devices = getDevicesWin(diskDrives);
  data.forEach((element) => {
    const filteresDevices = devices.filter((e: any) => {
      return e.name === element.name.toUpperCase();
    });
    if (filteresDevices.length > 0) {
      element.device = filteresDevices[0].device;
    }
  });
  return data;
};
