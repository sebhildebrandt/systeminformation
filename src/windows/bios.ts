'use strict';

import { getValue } from '../common';
import { powerShell } from '../common/exec';
import { initBios } from '../common/initials';
import { BiosData } from './../common/types';

export const windowsBios = async () => {
  const result = initBios;
  const stdout = await powerShell('Get-WmiObject Win32_bios | fl *');
  if (stdout) {
    let lines = stdout.toString().split('\r\n');
    const description = getValue(lines, 'description', ':');
    if (description.indexOf(' Version ') !== -1) {
      // ... Phoenix ROM BIOS PLUS Version 1.10 A04
      result.vendor = description.split(' Version ')[0].trim();
      result.version = description.split(' Version ')[1].trim();
    } else if (description.indexOf(' Ver: ') !== -1) {
      // ... BIOS Date: 06/27/16 17:50:16 Ver: 1.4.5
      result.vendor = getValue(lines, 'manufacturer', ':');
      result.version = description.split(' Ver: ')[1].trim();
    } else {
      result.vendor = getValue(lines, 'manufacturer', ':');
      result.version = getValue(lines, 'version', ':');
    }
    result.releaseDate = getValue(lines, 'releasedate', ':');
    if (result.releaseDate.length >= 10) {
      result.releaseDate = result.releaseDate.substr(0, 4) + '-' + result.releaseDate.substr(4, 2) + '-' + result.releaseDate.substr(6, 2);
    }
    result.revision = getValue(lines, 'buildnumber', ':');
  }

  return result;
};

export const bios = () => {
  return new Promise<BiosData>(resolve => {
    process.nextTick(() => {
      return resolve(windowsBios());
    });
  });
};
