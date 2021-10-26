'use strict';

import { getValue, nextTick, noop } from '../common';
import { initBios } from '../common/initials';
import { parseDateTime } from '../common/datetime';
import { BiosData } from './../common/types';
import { execCmd } from '../common/exec';

export const nixBios = async () => {
  const result = initBios;
  let cmd = '';
  if (process.arch === 'arm') {
    cmd = 'cat /proc/cpuinfo | grep Serial';
  } else {
    cmd = 'export LC_ALL=C; dmidecode -t bios 2>/dev/null; unset LC_ALL';
  }
  const stdout = await execCmd(cmd);
  let lines = stdout.toString().split('\n');
  result.vendor = getValue(lines, 'Vendor');
  result.version = getValue(lines, 'Version');
  let datetime = getValue(lines, 'Release Date');
  result.releaseDate = parseDateTime(datetime).date;
  result.revision = getValue(lines, 'BIOS Revision');
  let language = getValue(lines, 'Currently Installed Language').split('|')[0];
  if (language) {
    result.language = language;
  }
  if (lines.length && stdout.toString().indexOf('Characteristics:') >= 0) {
    const features: string[] = [];
    lines.forEach((line: string) => {
      if (line.indexOf(' is supported') >= 0) {
        const feature = line.split(' is supported')[0].trim();
        features.push(feature);
      }
    });
    result.features = features;
  }
  // Non-Root values
  cmd = `echo -n "bios_date: "; cat /sys/devices/virtual/dmi/id/bios_date 2>/dev/null; echo;
            echo -n "bios_vendor: "; cat /sys/devices/virtual/dmi/id/bios_vendor 2>/dev/null; echo;
            echo -n "bios_version: "; cat /sys/devices/virtual/dmi/id/bios_version 2>/dev/null; echo;`;
  try {
    lines = await execCmd(cmd).toString().split('\n');
    result.vendor = !result.vendor ? getValue(lines, 'bios_vendor') : result.vendor;
    result.version = !result.version ? getValue(lines, 'bios_version') : result.version;
    datetime = getValue(lines, 'bios_date');
    result.releaseDate = !result.releaseDate ? parseDateTime(datetime).date : result.releaseDate;
  } catch (e) {
    noop();
  }
  return result;
};

export const bios = async () => {
  await nextTick();
  return nixBios();
};
