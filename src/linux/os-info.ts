import { cloneObj, nextTick } from '../common';
import { getCodepage } from '../common/codepage';
import { ANDROID, execOptsLinux } from '../common/const';
import { initOsInfo } from '../common/defaults';
import { exec, execSave } from '../common/exec';
import { readdir } from 'node:fs/promises';
import { fileExists, readFileLines, readFileMax } from '../common/files';
import { getLogoFile } from '../common/mappings';
import type { OsData } from '../common/types';
import { uuid } from './uuid';
import { isSafePathSegment } from '../common/security';

const getInstallDate = async (): Promise<Date | null> => {
  // preferred: root filesystem birth time (ext4/xfs/btrfs on statx-capable kernels)
  try {
    const { stdout } = await exec('stat -c %W / 2>/dev/null', execOptsLinux);
    const sec = parseInt(stdout.toString().trim(), 10);
    if (sec > 0) {
      return new Date(sec * 1000);
    }
  } catch {}

  // fallback: ext filesystem creation date via tune2fs (needs root, ext only)
  try {
    // the effective root is the last entry covering '/', which is what `df -P /` resolved to
    const rootMount = (await readFileLines('/proc/mounts')).filter((line) => line.split(' ')[1] === '/').pop() || '';
    const dev = rootMount.split(' ')[0] || '';
    if (/^\/dev\/[\w./-]+$/.test(dev)) {
      const { stdout } = await exec(`tune2fs -l ${dev} 2>/dev/null`, execOptsLinux);
      const line = stdout
        .toString()
        .split('\n')
        .find((l) => l.toLowerCase().includes('filesystem created'));
      if (line) {
        const date = new Date(line.split(':').slice(1).join(':').trim());
        if (!Number.isNaN(date.getTime())) {
          return date;
        }
      }
    }
  } catch {}

  return null;
};

// newest package manager activity = last time the system was updated
const getLastUpdate = async (): Promise<Date | null> => {
  const paths =
    '/var/log/apt/history.log /var/log/dpkg.log /var/lib/rpm/rpmdb.sqlite /var/lib/rpm/Packages /var/log/dnf.rpm.log /var/log/yum.log /var/log/zypp/history /var/log/pacman.log /lib/apk/db/installed /var/db/pkg';
  const { stdout } = await execSave(`stat -c %Y ${paths} 2>/dev/null`, execOptsLinux);
  const times = (stdout || '')
    .split('\n')
    .map((line) => parseInt(line.trim(), 10))
    .filter((sec) => sec > 0);
  return times.length ? new Date(Math.max(...times) * 1000) : null;
};

// '' = headless/console session; Android uses SurfaceFlinger instead of X11/Wayland
const getDisplayServer = async (): Promise<string> => {
  if (ANDROID) {
    const { stdout } = await execSave('pgrep -f surfaceflinger 2>/dev/null || ps -A 2>/dev/null | grep surfaceflinger', execOptsLinux);
    return (stdout || '').trim() ? 'surfaceflinger' : '';
  }
  const sessionType = (process.env.XDG_SESSION_TYPE || '').toLowerCase();
  if (sessionType) {
    return sessionType;
  }
  return process.env.WAYLAND_DISPLAY ? 'wayland' : process.env.DISPLAY ? 'x11' : '';
};

const linuxIsUefi = async () => {
  if (await fileExists('/sys/firmware/efi')) {
    return true;
  } else {
    const { stdout } = await execSave('dmesg | grep -E "EFI v"', execOptsLinux);
    return stdout.split('\n').length > 0 && stdout.indexOf('EFI') >= 0;
  }
};

const parseOsInfo = async (stdout: string, defaults: OsData) => {
  const release: any = {};
  const lines = stdout.toString().split('\n');
  lines.forEach((line: string) => {
    if (line.indexOf('=') !== -1) {
      release[line.split('=')[0].trim().toUpperCase()] = line.split('=')[1].trim();
    }
  });
  const distro = (release.DISTRIB_ID || release.NAME || 'unknown').replace(/"/g, '');
  let releaseVersion = (release.VERSION || '').replace(/"/g, '');
  let codename = (release.DISTRIB_CODENAME || release.VERSION_CODENAME || '').replace(/"/g, '');
  const prettyName = (release.PRETTY_NAME || '').replace(/"/g, '');
  if (prettyName.indexOf(distro + ' ') === 0) {
    releaseVersion = prettyName.replace(distro + ' ', '').trim();
  }
  if (releaseVersion.indexOf('(') >= 0) {
    codename = releaseVersion.split('(')[1].replace(/[()]/g, '').trim();
    releaseVersion = releaseVersion.split('(')[0].trim();
  }
  return {
    ...defaults,
    distro: (release.DISTRIB_ID || release.NAME || 'unknown').replace(/"/g, ''),
    logofile: getLogoFile(distro),
    release: (releaseVersion || release.DISTRIB_RELEASE || release.VERSION_ID || 'unknown').replace(/"/g, ''),
    codename: codename,
    codepage: getCodepage(),
    build: (release.BUILD_ID || '').replace(/"/g, '').trim(),
    uefi: await linuxIsUefi(),
    serial: (await uuid()).os,
    installDate: await getInstallDate(),
    lastUpdate: await getLastUpdate(),
    displayServer: await getDisplayServer()
  };
};

export const osInfo = async () => {
  await nextTick();
  const defaults = cloneObj(await initOsInfo());
  try {
    // shell glob order: /etc/*-release sorted, then the two fixed files
    const releaseFiles = (await readdir('/etc').catch(() => [])).filter((file) => file.endsWith('-release') && isSafePathSegment(file)).sort();
    const files = [...releaseFiles.map((file) => `/etc/${file}`), '/usr/lib/os-release', '/etc/openwrt_release'];
    // one shared budget - the replaced exec() capped the whole concatenation at 1 MB
    let budget = 1024 * 1024;
    const parts: string[] = [];
    for (const file of files) {
      if (budget <= 0) {
        break;
      }
      const content = await readFileMax(file, budget);
      if (content) {
        parts.push(content);
        budget -= content.length;
      }
    }
    return await parseOsInfo(parts.join('\n') + '\n', defaults);
  } catch {}
  return defaults;
};
