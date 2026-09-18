import { readdir, readFile } from 'node:fs/promises';
import { cloneObj, getValue, sortByKey, toInt, unique } from './index';
import { DARWIN, execOptsLinux, execOptsWin, FREEBSD, LINUX, NETBSD, WINDOWS } from './const';
import { initDiskIo, initFsBlockDevice, initFsStats } from './defaults';
import { exec, execSecure } from './exec';
import type { FsBlockDevicesData } from './types';

let _smartMonToolsInstalled: boolean | null = null;

// ZFS datasets share the pool, so df and statfs only report what a dataset references itself -
// a parent holding its data in child datasets looks empty (#1017). Only `zfs list` knows the
// hierarchical usage, so query it once and index it by mount point and by dataset name.
export const zfsDatasets = async () => {
  const byMount = new Map<string, { used: number; available: number }>();
  const byName = new Map<string, { used: number; available: number }>();
  let stdout = '';
  try {
    ({ stdout } = await exec('zfs list -H -p -o name,used,avail,mountpoint', { ...execOptsLinux, timeout: 5000 }));
  } catch {
    // a truncated or timed out listing would correct only part of the datasets and leave the rest
    // on their df values - correct none instead, so the result stays consistent
    return { byMount, byName };
  }
  for (const line of stdout.toString().split('\n')) {
    const parts = line.split('\t');
    if (parts.length < 4) {
      continue;
    }
    const entry = { used: toInt(parts[1]), available: toInt(parts[2]) };
    const mount = parts[3].trim();
    byName.set(parts[0], entry);
    // several datasets can carry the same mountpoint (root-on-zfs boot environments all declare
    // "/"), so the mount index is only a fallback - keep the first one and let the name win
    if (mount.startsWith('/') && !byMount.has(mount)) {
      byMount.set(mount, entry);
    }
  }
  return { byMount, byName };
};

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
    // wait times are cumulative since boot - report the interval instead (#1025)
    result.rWaitTime = rWaitTime - _disk_io.rWaitTime;
    result.wWaitTime = wWaitTime - _disk_io.wWaitTime;
    result.tWaitTime = tWaitTime - _disk_io.tWaitTime;
    result.rWaitPercent = (result.rWaitTime * 100) / result.ms;
    result.wWaitPercent = (result.wWaitTime * 100) / result.ms;
    result.tWaitPercent = (result.tWaitTime * 100) / result.ms;
    _disk_io.rIO = rIO;
    _disk_io.wIO = wIO;
    _disk_io.rIO_sec = result.rIO_sec;
    _disk_io.wIO_sec = result.wIO_sec;
    _disk_io.tIO_sec = result.tIO_sec;
    // keep the cumulative values as the baseline for the next delta, the interval separately
    _disk_io.rWaitTime = rWaitTime;
    _disk_io.wWaitTime = wWaitTime;
    _disk_io.tWaitTime = tWaitTime;
    _disk_io.rWaitTimeDelta = result.rWaitTime;
    _disk_io.wWaitTimeDelta = result.wWaitTime;
    _disk_io.tWaitTimeDelta = result.tWaitTime;
    _disk_io.rWaitPercent = result.rWaitPercent;
    _disk_io.wWaitPercent = result.wWaitPercent;
    _disk_io.tWaitPercent = result.tWaitPercent;
    _disk_io.last_ms = result.ms;
    _disk_io.ms = Date.now();
  } else {
    result.rIO = rIO;
    result.wIO = wIO;
    result.tIO = rIO + wIO;
    // first call has no baseline - same convention as rIO_sec
    result.rWaitTime = null;
    result.wWaitTime = null;
    result.tWaitTime = null;
    _disk_io.rIO = rIO;
    _disk_io.wIO = wIO;
    _disk_io.rIO_sec = null;
    _disk_io.wIO_sec = null;
    _disk_io.tIO_sec = null;
    _disk_io.rWaitTime = rWaitTime;
    _disk_io.wWaitTime = wWaitTime;
    _disk_io.tWaitTime = tWaitTime;
    _disk_io.rWaitTimeDelta = null;
    _disk_io.wWaitTimeDelta = null;
    _disk_io.tWaitTimeDelta = null;
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

export type PoolInfoLinux = {
  name: string;
  type: string;
  fsType: string;
  size: number;
  uuid: string;
  mount: string;
  members: string[];
};

const ZFS_VDEV_TYPES = ['mirror', 'raidz', 'draid'];

// `zpool status -PL` prints an indented tree per pool: the pool itself, then either vdev groups
// (mirror-0, raidz1-0, draid2:4d:12c:2s-0) or plain devices for a stripe, then log/cache/spare
// sections. Only the first data vdev decides the pool type, every device becomes a member.
export const parseZpoolStatus = (stdout: string) => {
  const result = new Map<string, { type: string; members: string[] }>();
  let pool = '';
  let inConfig = false;
  for (const line of stdout.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('pool:')) {
      pool = trimmed.substring(5).trim();
      inConfig = false;
      continue;
    }
    if (!pool) {
      continue;
    }
    if (trimmed === 'config:') {
      inConfig = true;
      result.set(pool, { type: 'stripe', members: [] });
      continue;
    }
    if (!inConfig || !trimmed || trimmed.startsWith('errors:')) {
      inConfig = inConfig && !trimmed.startsWith('errors:');
      continue;
    }
    const entry = result.get(pool);
    const token = trimmed.split(/\s+/)[0];
    if (!entry || token === 'NAME' || token === pool) {
      continue;
    }
    if (token.startsWith('/')) {
      entry.members.push(token.split('/').pop() || '');
    } else if (entry.type === 'stripe' && !entry.members.length && ZFS_VDEV_TYPES.some((type) => token.startsWith(type))) {
      entry.type = token.replace(/-\d+$/, '');
    }
  }
  return result;
};

export const parseZpoolList = (stdout: string) => {
  const result = new Map<string, number>();
  for (const line of stdout.split('\n')) {
    const parts = line.split('\t');
    if (parts.length < 2 || !parts[0].trim()) {
      continue;
    }
    result.set(parts[0].trim(), toInt(parts[1]));
  }
  return result;
};

// btrfs exposes the allocation profile as a subdirectory of allocation/data, longest name first
// so raid1c3 is not shadowed by raid1
const BTRFS_PROFILES = ['raid1c4', 'raid1c3', 'raid10', 'raid0', 'raid5', 'raid6', 'raid1', 'dup', 'single'];

export const btrfsProfileFromEntries = (entries: string[]) => BTRFS_PROFILES.find((profile) => entries.includes(profile)) || '';

// assigns the pool name as group to every member and appends one entry per pool, mirroring what
// raidMatchLinux does for mdraid (#802, #883)
export const applyPoolsLinux = (data: FsBlockDevicesData[], pools: PoolInfoLinux[]): FsBlockDevicesData[] => {
  const defaults = cloneObj(initFsBlockDevice);
  const result = [...data];
  for (const pool of pools) {
    const members = result.filter((element) => pool.members.includes(element.name));
    if (!members.length) {
      continue;
    }
    for (const member of members) {
      member.group = pool.name;
    }
    result.push({
      ...defaults,
      name: pool.name,
      type: pool.type,
      fsType: pool.fsType,
      mount: pool.mount,
      size: pool.size,
      uuid: pool.uuid
    });
  }
  return result;
};

export const zfsPoolsLinux = async (data: FsBlockDevicesData[]): Promise<PoolInfoLinux[]> => {
  const result: PoolInfoLinux[] = [];
  // skip the exec entirely on the vast majority of machines that have no zfs at all
  if (!data.some((element) => element.fsType === 'zfs_member')) {
    return result;
  }
  try {
    const status = parseZpoolStatus(await execSecure('zpool', ['status', '-PL']));
    if (!status.size) {
      return result;
    }
    const sizes = parseZpoolList(await execSecure('zpool', ['list', '-Hp', '-o', 'name,size']));
    for (const [name, info] of status) {
      const members = data.filter((element) => info.members.includes(element.name));
      result.push({
        name,
        type: info.type,
        fsType: 'zfs',
        // zpool size is the raw pool capacity - fall back to the summed member sizes
        size: sizes.get(name) || members.reduce((sum, element) => sum + element.size, 0),
        uuid: '',
        mount: members.find((element) => element.mount)?.mount || '',
        members: info.members
      });
    }
  } catch {}
  return result;
};

const BTRFS_SYSFS = '/sys/fs/btrfs';

// sysfs knows every mounted btrfs by its fsid - no btrfs-progs and no root needed
export const btrfsPoolsLinux = async (data: FsBlockDevicesData[]): Promise<PoolInfoLinux[]> => {
  const result: PoolInfoLinux[] = [];
  let fsids: string[] = [];
  try {
    fsids = await readdir(BTRFS_SYSFS);
  } catch {
    return result;
  }
  for (const fsid of fsids) {
    let devices: string[] = [];
    try {
      devices = await readdir(`${BTRFS_SYSFS}/${fsid}/devices`);
    } catch {
      continue;
    }
    // a single device btrfs is not a pool
    if (devices.length < 2) {
      continue;
    }
    let profile = '';
    try {
      profile = btrfsProfileFromEntries(await readdir(`${BTRFS_SYSFS}/${fsid}/allocation/data`));
    } catch {}
    const label = (await readFile(`${BTRFS_SYSFS}/${fsid}/label`, 'utf8').catch(() => '')).trim();
    const members = data.filter((element) => devices.includes(element.name));
    result.push({
      name: label || fsid,
      type: profile || 'btrfs',
      fsType: 'btrfs',
      size: members.reduce((sum, element) => sum + element.size, 0),
      uuid: fsid,
      mount: members.find((element) => element.mount)?.mount || '',
      members: devices
    });
  }
  return result;
};
