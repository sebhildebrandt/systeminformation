'use strict';

import { execCmd } from '../common/exec';
import { initOsInfo } from '../common/initials';
import { getLogoFile } from '../common/mappings';
import { OsData } from '../common/types';
import { getValue, nextTick, noop } from '../common';
import { getCodepage } from '../common/codepage';

export const bsdOsInfo = async () => {
  let result = await initOsInfo();
  try {
    const stdout = await execCmd('sysctl kern.ostype kern.osrelease kern.osrevision kern.hostuuid machdep.bootmethod');
    let lines = stdout.toString().split('\n');
    result.distro = getValue(lines, 'kern.ostype');
    result.logofile = getLogoFile(result.distro);
    result.release = getValue(lines, 'kern.osrelease').split('-')[0];
    result.serial = getValue(lines, 'kern.uuid');
    result.codename = '';
    result.codepage = getCodepage();
    result.uefi = getValue(lines, 'machdep.bootmethod').toLowerCase().indexOf('uefi') >= 0;
  } catch (e) {
    noop();
  }
  return result;
};

export const osInfo = async () => {
  await nextTick();
  return bsdOsInfo();
};
