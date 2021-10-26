import { execCmd } from '../common/exec';
import { initOsInfo } from '../common/defaults';
import { getLogoFile } from '../common/mappings';
import { existsSync } from 'fs';
import { nextTick } from '../common';
import { linuxUuid } from './uuid';
import { getCodepage } from '../common/codepage';

const linuxIsUefi = async () => {
  if (existsSync('/sys/firmware/efi')) {
    return true;
  } else {
    const stdout = (await execCmd('dmesg | grep -E "EFI v"')).toString();
    return stdout.split('\n').length > 0 && stdout.indexOf('EFI') >= 0;
  }
};

export const linuxOsInfo = async () => {
  const result = await initOsInfo();
  try {
    const stdout = await execCmd('cat /etc/*-release; cat /usr/lib/os-release; cat /etc/openwrt_release');
    const release: any = {};
    const lines = stdout.toString().split('\n');
    lines.forEach((line: string) => {
      if (line.indexOf('=') !== -1) {
        release[line.split('=')[0].trim().toUpperCase()] = line.split('=')[1].trim();
      }
    });
    let releaseVersion = (release.VERSION || '').replace(/"/g, '');
    let codename = (release.DISTRIB_CODENAME || release.VERSION_CODENAME || '').replace(/"/g, '');
    if (releaseVersion.indexOf('(') >= 0) {
      codename = releaseVersion.split('(')[1].replace(/[()]/g, '').trim();
      releaseVersion = releaseVersion.split('(')[0].trim();
    }
    result.distro = (release.DISTRIB_ID || release.NAME || 'unknown').replace(/"/g, '');
    result.logofile = getLogoFile(result.distro);
    result.release = (releaseVersion || release.DISTRIB_RELEASE || release.VERSION_ID || 'unknown').replace(/"/g, '');
    result.codename = codename;
    result.codepage = getCodepage();
    result.build = (release.BUILD_ID || '').replace(/"/g, '').trim();
    const uefi = await linuxIsUefi();
    result.uefi = uefi;
    const data = await linuxUuid();
    result.serial = data.os;
  } catch { }
  return result;
};

export const osInfo = async () => {
  await nextTick();
  return linuxOsInfo();
};
