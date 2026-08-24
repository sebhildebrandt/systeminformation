import { nextTick, toInt } from '../common';
import { DARWIN, execOptsLinux, FREEBSD, LINUX, NETBSD, OPENBSD } from '../common/const';
import { exec } from '../common/exec';
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
    try {
      cmd = 'export LC_ALL=C; df -kPTx squashfs; unset LC_ALL';
      ({ stdout } = await exec('cat /proc/mounts 2>/dev/null', execOptsLinux));
      stdout
        .split('\n')
        .filter((line) => {
          return line.startsWith('/');
        })
        .forEach((line) => {
          // /proc/mounts escapes spaces in device names as octal (\040) — df prints them unescaped
          const fs = line.split(' ')[0].replace(/\\(\d{3})/g, (_, octal) => String.fromCharCode(parseInt(octal, 8)));
          osMounts[fs] = osMounts[fs] || false;
          if (line.indexOf('/snap/') === -1) {
            osMounts[fs] = line.toLowerCase().indexOf('rw,') >= 0 || line.toLowerCase().indexOf(' rw ') >= 0;
          }
        });
    } catch {}
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

  ({ stdout, stderr } = await exec(cmd, execOptsLinux));

  if (!stderr) {
    lines = filterFsLines(stdout);
    data = parseNixFsSize(lines);
  } else {
    ({ stdout } = await exec('df -kPT  2>/dev/null', execOptsLinux));
    lines = filterFsLines(stdout);
    data = parseNixFsSize(lines);
  }
  if (drives.length) {
    data = data.filter((item) => {
      return drives.some((drive) => {
        return item.fs.toLowerCase().indexOf(drive.toLowerCase()) >= 0 || item.mount.toLowerCase().indexOf(drive.toLowerCase()) >= 0;
      });
    });
  }
  return data;
};
