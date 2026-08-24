import { exec, execSave } from '../common/exec';
import { initOsInfo } from '../common/defaults';
import { getLogoFile } from '../common/mappings';
import { cloneObj, nextTick } from '../common';
import { uuid } from './uuid';
import { getCodepage } from '../common/codepage';
import { fileExists } from '../common/files';
import { OsData } from '../common/types';
import { ANDROID, execOptsLinux } from '../common/const';

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
    const { stdout: dfOut } = await exec('df -P / 2>/dev/null', execOptsLinux);
    const dev = (dfOut.toString().split('\n')[1] || '').split(/\s+/)[0] || '';
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
    const { stdout } = await exec('dmesg | grep -E "EFI v"', execOptsLinux);
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
    displayServer: await getDisplayServer()
  };
};

export const osInfo = async () => {
  await nextTick();
  const defaults = cloneObj(await initOsInfo());
  try {
    const { stdout } = await execSave('cat /etc/*-release 2>/dev/null; cat /usr/lib/os-release 2>/dev/null; cat /etc/openwrt_release 2>/dev/null');
    return await parseOsInfo(stdout, defaults);
  } catch {}
  return defaults;
};
