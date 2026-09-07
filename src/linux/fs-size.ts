import { statfs } from 'node:fs/promises';
import { nextTick, toInt } from '../common';
import { DARWIN, execOptsLinux, FREEBSD, LINUX, NETBSD, OPENBSD } from '../common/const';
import { exec, execSave } from '../common/exec';
import { readFileLines } from '../common/files';
import { FsSizeData } from '../common/types';

let macOsDisks: string[] = [];
let osMounts: any = {};

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
      const fsType = withType ? match[2] : getmacOsFsType(fs);
      const mount = (withType ? match[6] : match[5]).trim();
      if (fs.startsWith('/') || mount === '/' || fs.indexOf('/') > 0 || fs.indexOf(':') === 1 || (!DARWIN && !isLinuxTmpFs(fsType))) {
        const size = toInt(match[withType ? 3 : 2]) * 1024;
        const used = toInt(match[withType ? 4 : 3]) * 1024;
        const available = toInt(match[withType ? 5 : 4]) * 1024;
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
  const data: { entry: FsSizeData; trusted: boolean }[] = [];
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
      const stats = await statfs(mount);
      const size = stats.blocks * stats.bsize;
      // pseudo filesystems (proc, sysfs, cgroup) report no blocks - df skips them too
      if (!size) {
        continue;
      }
      const used = (stats.blocks - stats.bfree) * stats.bsize;
      const available = stats.bavail * stats.bsize;
      const item = {
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
      // df lists a device only once - the entry with the shortest mount point wins
      const duplicate = data.findIndex((el) => el.entry.fs === fs);
      if (duplicate >= 0) {
        if (data[duplicate].entry.mount.length > mount.length) {
          data[duplicate] = item;
        }
        continue;
      }
      data.push(item);
    } catch {}
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

const filterDrives = (data: FsSizeData[], drives: string[]) => data.filter((item) => matchesDrives(item.fs, item.mount, drives));

export const fsSize = async (drives: string[]) => {
  await nextTick();
  let data: FsSizeData[] = [];
  let cmd = '';
  let stdout = '';
  let stderr = '';
  let lines: string[] = [];
  macOsDisks = [];
  osMounts = {};

  if (DARWIN) {
    cmd = 'df -kP';
    try {
      ({ stdout } = await exec('diskutil list', execOptsLinux));
      macOsDisks = stdout.split('\n').filter((line) => {
        return !line.startsWith('/') && line.indexOf(':') > 0;
      });
      ({ stdout } = await exec('mount', execOptsLinux));
      stdout
        .split('\n')
        .filter((line) => {
          return line.startsWith('/');
        })
        .forEach((line) => {
          // mount output: "<fs> on <mountpoint> (<options>)" — fs may contain spaces
          osMounts[line.split(' on ')[0]] = line.toLowerCase().indexOf('read-only') === -1;
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
      return linuxData;
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
  return filterDrives(data, drives);
};
