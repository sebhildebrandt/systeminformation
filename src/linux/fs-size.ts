import { stat, statfs } from 'node:fs/promises';
import { nextTick, toInt } from '../common';
import { DARWIN, execOptsLinux, FREEBSD, LINUX, NETBSD, OPENBSD } from '../common/const';
import { exec, execSave } from '../common/exec';
import { readFileLines } from '../common/files';
import { zfsDatasets } from '../common/filesys';
import type { FsSizeData } from '../common/types';

let macOsDisks: string[] = [];
let macOsFsTypes = new Map<string, string>();
let osMounts: any = Object.create(null);

// macOS df has no type column, so the type used to be guessed from diskutil - which only ever
// produced APFS, HFS or NFS and therefore never recognised zfs, exfat, msdos or smbfs. mount
// knows the real type, so prefer it and keep the old names for the three it could produce.
const macOsFsType = (fs: string) => {
  const type = macOsFsTypes.get(fs);
  if (!type) {
    return getmacOsFsType(fs);
  }
  return type === 'apfs' ? 'APFS' : type === 'hfs' ? 'HFS' : type === 'nfs' ? 'NFS' : type;
};

const getmacOsFsType = (fs: string) => {
  if (!fs.startsWith('/')) {
    return 'NFS';
  }
  const parts = fs.split('/');
  const fsShort = parts[parts.length - 1];
  const macOsDisksSingle = macOsDisks.filter((item) => item.indexOf(fsShort) >= 0);
  if (macOsDisksSingle.length === 1 && macOsDisksSingle[0].indexOf('APFS') >= 0) {
    return 'APFS';
  }
  return 'HFS';
};

const isLinuxTmpFs = (fs: string) => {
  const linuxTmpFileSystems = ['rootfs', 'unionfs', 'squashfs', 'cramfs', 'initrd', 'initramfs', 'devtmpfs', 'tmpfs', 'udev', 'devfs', 'specfs', 'type', 'appimaged'];
  let result = false;
  linuxTmpFileSystems.forEach((linuxFs) => {
    if (fs.toLowerCase().indexOf(linuxFs) >= 0) {
      result = true;
    }
  });
  return result;
};

const filterFsLines = (stdout: string) => {
  const lines = stdout.toString().split('\n');
  lines.shift();
  if (stdout.toString().toLowerCase().indexOf('filesystem') >= 0) {
    let removeLines = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i]?.toLowerCase().startsWith('filesystem')) {
        removeLines = i;
      }
    }
    for (let i = 0; i < removeLines; i++) {
      lines.shift();
    }
  }
  return lines;
};

// fs and mount may contain spaces (e.g. SMB shares) — anchor the parsing on the
// numeric columns (blocks, used, available, capacity%) instead of splitting on whitespace
const dfLineWithType = /^(.+?)\s+(\S+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(?:\d+%|-)\s+(.+)$/;
const dfLineNoType = /^(.+?)\s+(\d+)\s+(\d+)\s+(\d+)\s+(?:\d+%|-)\s+(.+)$/;

const parseNixFsSize = (lines: string[]) => {
  const data: FsSizeData[] = [];
  const withType = LINUX || FREEBSD || NETBSD || OPENBSD;
  lines.forEach((line) => {
    const match = line.trim().match(withType ? dfLineWithType : dfLineNoType);
    if (match) {
      const fs = match[1].trim();
      const fsType = withType ? match[2] : macOsFsType(fs);
      const mount = (withType ? match[6] : match[5]).trim();
      if (fs.startsWith('/') || mount === '/' || fs.indexOf('/') > 0 || fs.indexOf(':') === 1 || (!DARWIN && !isLinuxTmpFs(fsType))) {
        const used = toInt(match[withType ? 4 : 3]) * 1024;
        const available = toInt(match[withType ? 5 : 4]) * 1024;
        // btrfs reports the raw device capacity as size while free space already accounts for
        // the raid profile - report the usable size, like `use` has always been computed (#883)
        const size = fsType === 'btrfs' ? used + available : toInt(match[withType ? 3 : 2]) * 1024;
        const use = parseFloat((100.0 * (used / (used + available))).toFixed(2));
        const rw = osMounts && Object.keys(osMounts).length > 0 ? osMounts[fs] || false : null;
        if (!data.find((el) => el.fs === fs && el.type === fsType && el.mount === mount)) {
          data.push({
            fs,
            type: fsType,
            size,
            used,
            available,
            use,
            mount,
            rw
          });
        }
      }
    }
  });
  return data;
};

// /proc/mounts escapes spaces, tabs and backslashes in octal
const unescapeMount = (value: string) => value.replace(/\\(\d{3})/g, (_, octal) => String.fromCharCode(parseInt(octal, 8)));

// statfs() exposes f_bsize, but f_blocks is counted in f_frsize units, which node does not
// expose. Both are equal on local filesystems; FUSE and network mounts report an optimal
// transfer size as f_bsize instead (e.g. 1 MiB against a 4 KiB f_frsize) and would be off by
// that factor - those still need `df`.
const statfsSafeTypes = [
  'bcachefs',
  'btrfs',
  'erofs',
  'exfat',
  'ext2',
  'ext3',
  'ext4',
  'efivarfs',
  'f2fs',
  'gfs2',
  'hfs',
  'hfsplus',
  'iso9660',
  'jffs2',
  'jfs',
  'msdos',
  'nilfs2',
  'ntfs',
  'ntfs3',
  'ocfs2',
  'overlay',
  'reiserfs',
  'tmpfs',
  'ubifs',
  'udf',
  'vfat',
  'xfs',
  'zfs'
];

// linux: /proc/mounts + statfs() replace `df` - returns null if a requested mount needs `df` to be sized correctly
const linuxFsSize = async (drives: string[]): Promise<FsSizeData[] | null> => {
  const data: { dev: number; entry: FsSizeData; trusted: boolean }[] = [];
  const mounts = await readFileLines('/proc/mounts');
  if (!mounts.length) {
    return null;
  }
  // rw stays null ("unknown") when no mount could be classified at all
  const osMountsKnown = Object.keys(osMounts).length > 0;
  for (const line of mounts) {
    const parts = line.split(' ');
    if (parts.length < 4) {
      continue;
    }
    const fs = unescapeMount(parts[0]);
    const mount = unescapeMount(parts[1]);
    const type = parts[2];
    if (type === 'squashfs') {
      continue;
    }
    if (!(fs.startsWith('/') || mount === '/' || fs.indexOf('/') > 0 || fs.indexOf(':') === 1 || !isLinuxTmpFs(type))) {
      continue;
    }
    try {
      const [stats, { dev }] = await Promise.all([statfs(mount), stat(mount)]);
      const rawSize = stats.blocks * stats.bsize;
      // pseudo filesystems (proc, sysfs, cgroup) report no blocks - df skips them too
      if (!rawSize) {
        continue;
      }
      const used = (stats.blocks - stats.bfree) * stats.bsize;
      const available = stats.bavail * stats.bsize;
      // btrfs reports the raw device capacity as size while free space already accounts for
      // the raid profile - report the usable size, like `use` has always been computed (#883)
      const size = type === 'btrfs' ? used + available : rawSize;
      const item = {
        dev,
        entry: {
          fs,
          type,
          size,
          used,
          available,
          use: parseFloat((100.0 * (used / (used + available))).toFixed(2)),
          mount,
          rw: osMountsKnown ? osMounts[fs] || false : null
        },
        trusted: statfsSafeTypes.includes(type)
      };
      // df keys duplicates on the device number, not the device name: btrfs subvolumes share a
      // name but not an st_dev and must stay separate. Shortest mount point wins.
      const duplicate = data.findIndex((el) => el.dev === dev);
      if (duplicate >= 0) {
        if (data[duplicate].entry.mount.length > mount.length) {
          data[duplicate] = item;
        }
        continue;
      }
      data.push(item);
    } catch {}
  }
  // nothing collected at all means statfs() is unusable here (e.g. node < 18.15) - let df take over
  if (!data.length) {
    return null;
  }
  // dedupe first, filter second - same order as `df` output feeding filterDrives
  const requested = data.filter((item) => matchesDrives(item.entry.fs, item.entry.mount, drives));
  if (requested.some((item) => !item.trusted)) {
    return null;
  }
  return requested.map((item) => item.entry);
};

const matchesDrives = (fs: string, mount: string, drives: string[]) => {
  if (!drives.length) {
    return true;
  }
  return drives.some((drive) => fs.toLowerCase().indexOf(drive.toLowerCase()) >= 0 || mount.toLowerCase().indexOf(drive.toLowerCase()) >= 0);
};

// zfs entries carry the pool wide available space but only their own referenced usage, so
// replace those numbers with the hierarchical ones from `zfs list` (#1017)
const applyZfsUsage = async (data: FsSizeData[]) => {
  if (!data.some((item) => item.type === 'zfs')) {
    return data;
  }
  const { byMount, byName } = await zfsDatasets();
  for (const item of data) {
    if (item.type !== 'zfs') {
      continue;
    }
    // the fs column is the exact dataset name and therefore unambiguous, unlike the mountpoint
    const dataset = byName.get(item.fs) || byMount.get(item.mount);
    if (!dataset || !(dataset.used + dataset.available)) {
      continue;
    }
    item.used = dataset.used;
    item.available = dataset.available;
    item.size = dataset.used + dataset.available;
    item.use = parseFloat(((100.0 * dataset.used) / item.size).toFixed(2));
  }
  return data;
};

const filterDrives = (data: FsSizeData[], drives: string[]) => data.filter((item) => matchesDrives(item.fs, item.mount, drives));

export const fsSize = async (drives: string[]) => {
  await nextTick();
  let data: FsSizeData[] = [];
  let cmd = '';
  let stdout = '';
  let stderr = '';
  let lines: string[] = [];
  macOsDisks = [];
  macOsFsTypes = new Map();
  osMounts = Object.create(null);

  if (DARWIN) {
    cmd = 'df -kP';
    try {
      ({ stdout } = await exec('diskutil list', execOptsLinux));
      macOsDisks = stdout.split('\n').filter((line) => {
        return !line.startsWith('/') && line.indexOf(':') > 0;
      });
      ({ stdout } = await exec('mount', execOptsLinux));
      stdout.split('\n').forEach((line) => {
        // mount output: "<fs> on <mountpoint> (<type>, <options>)" — fs may contain spaces
        const fs = line.split(' on ')[0];
        const type = line.match(/\(([^),]+)[^)]*\)$/);
        if (fs && type) {
          macOsFsTypes.set(fs, type[1].trim().toLowerCase());
        }
        if (line.startsWith('/')) {
          osMounts[fs] = line.toLowerCase().indexOf('read-only') === -1;
        }
      });
    } catch {}
  }
  if (LINUX) {
    for (const line of await readFileLines('/proc/mounts')) {
      if (!line.startsWith('/')) {
        continue;
      }
      const fs = unescapeMount(line.split(' ')[0]);
      osMounts[fs] = osMounts[fs] || false;
      if (line.indexOf('/snap/') === -1) {
        osMounts[fs] = line.toLowerCase().indexOf('rw,') >= 0 || line.toLowerCase().indexOf(' rw ') >= 0;
      }
    }
    const linuxData = await linuxFsSize(drives);
    if (linuxData) {
      return await applyZfsUsage(linuxData);
    }
    // fallback for mounts statfs() cannot size reliably
    cmd = 'export LC_ALL=C; df -kPTx squashfs; unset LC_ALL';
  }
  if (FREEBSD || NETBSD || OPENBSD) {
    try {
      cmd = 'df -kPT';
      ({ stdout } = await exec('mount', execOptsLinux));
      stdout.split('\n').forEach((line) => {
        osMounts[line.split(' on ')[0]] = line.toLowerCase().indexOf('read-only') === -1;
      });
    } catch {}
  }

  // df may be unavailable (restricted container) - never throw out of fsSize because of it
  ({ stdout, stderr } = await execSave(cmd, execOptsLinux));

  if (!stderr) {
    lines = filterFsLines(stdout);
    data = parseNixFsSize(lines);
  } else {
    ({ stdout } = await execSave('df -kPT  2>/dev/null', execOptsLinux));
    lines = filterFsLines(stdout);
    data = parseNixFsSize(lines);
  }
  return await applyZfsUsage(filterDrives(data, drives));
};
