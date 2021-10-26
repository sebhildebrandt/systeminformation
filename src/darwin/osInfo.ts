'use strict';

import { execCmd } from '../common/exec';
import { initOsInfo } from '../common/initials';
import { getLogoFile } from '../common/mappings';
import { getValue, nextTick } from '../common';
import { getCodepage } from '../common/codepage';

export const darwinOsInfo = async () => {
  const result = await initOsInfo();
  try {
    const stdout = await execCmd('sw_vers; sysctl kern.ostype kern.osrelease kern.osrevision kern.uuid');
    const lines = stdout.toString().split('\n');
    result.serial = getValue(lines, 'kern.uuid');
    result.distro = getValue(lines, 'ProductName');
    result.release = getValue(lines, 'ProductVersion');
    result.build = getValue(lines, 'BuildVersion');
    result.logofile = getLogoFile(result.distro);
    result.codename = 'macOS';
    switch (true) {
      case result.release.indexOf('10.4') > -1: result.codename = 'Mac OS X Tiger'; break;
      case result.release.indexOf('10.5') > -1: result.codename = 'Mac OS X Leopard'; break;
      case result.release.indexOf('10.6') > -1: result.codename = 'Mac OS X Snow Leopard'; break;
      case result.release.indexOf('10.7') > -1: result.codename = 'Mac OS X Lion'; break;
      case result.release.indexOf('10.8') > -1: result.codename = 'OS X Mountain Lion'; break;
      case result.release.indexOf('10.9') > -1: result.codename = 'OS X Mavericks'; break;
      case result.release.indexOf('10.10') > -1: result.codename = 'OS X Yosemite'; break;
      case result.release.indexOf('10.11') > -1: result.codename = 'OS X El Capitan'; break;
      case result.release.indexOf('10.12') > -1: result.codename = 'macOS Sierra'; break;
      case result.release.indexOf('10.13') > -1: result.codename = 'macOS High Sierra'; break;
      case result.release.indexOf('10.14') > -1: result.codename = 'macOS Mojave'; break;
      case result.release.indexOf('10.15') > -1: result.codename = 'macOS Catalina'; break;
      case result.release.startsWith('11.'): result.codename = 'macOS Big Sur'; break;
      case result.release.startsWith('12.'): result.codename = 'macOS Monterey'; break;
      default: result.codename = 'macOS';
    }
    result.uefi = true;
    result.codepage = getCodepage();
  } catch (e) {
  }
  return result;
};

export const osInfo = async () => {
  await nextTick();
  return darwinOsInfo();
};
