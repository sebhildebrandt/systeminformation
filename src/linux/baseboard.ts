'use strict';

import * as os from 'os';
import { promises as fs } from 'fs';
import { getValue, noop, promiseAll, toInt } from '../common';
import { execCmd } from '../common/exec';
import { initBaseboard } from '../common/initials';
import { decodePiCpuinfo } from '../common/raspberry';
import { BaseboardData } from './../common/types';

export const nixBaseboard = async () => {
  const result = initBaseboard;
  let cmd = '';
  if (process.arch === 'arm') {
    cmd = 'cat /proc/cpuinfo | grep Serial';
  } else {
    cmd = 'export LC_ALL=C; dmidecode -t 2 2>/dev/null; unset LC_ALL';
  }
  const workload = [];
  workload.push(execCmd(cmd));
  workload.push(execCmd('export LC_ALL=C; dmidecode -t memory 2>/dev/null'));
  const data = await promiseAll(workload);
  let lines = data.results[0] ? data.results[0].toString().split('\n') : [''];
  result.manufacturer = getValue(lines, 'Manufacturer');
  result.model = getValue(lines, 'Product Name');
  result.version = getValue(lines, 'Version');
  result.serial = getValue(lines, 'Serial Number');
  result.assetTag = getValue(lines, 'Asset Tag');
  // Non-Root values
  cmd = `echo -n "board_asset_tag: "; cat /sys/devices/virtual/dmi/id/board_asset_tag 2>/dev/null; echo;
            echo -n "board_name: "; cat /sys/devices/virtual/dmi/id/board_name 2>/dev/null; echo;
            echo -n "board_serial: "; cat /sys/devices/virtual/dmi/id/board_serial 2>/dev/null; echo;
            echo -n "board_vendor: "; cat /sys/devices/virtual/dmi/id/board_vendor 2>/dev/null; echo;
            echo -n "board_version: "; cat /sys/devices/virtual/dmi/id/board_version 2>/dev/null; echo;`;
  try {
    lines = (await execCmd(cmd)).toString().split('\n');
    result.manufacturer = !result.manufacturer ? getValue(lines, 'board_vendor') : result.manufacturer;
    result.model = !result.model ? getValue(lines, 'board_name') : result.model;
    result.version = !result.version ? getValue(lines, 'board_version') : result.version;
    result.serial = !result.serial ? getValue(lines, 'board_serial') : result.serial;
    result.assetTag = !result.assetTag ? getValue(lines, 'board_asset_tag') : result.assetTag;
  } catch (e) {
    noop();
  }
  if (result.serial.toLowerCase().indexOf('o.e.m.') !== -1) { result.serial = '-'; }
  if (result.assetTag.toLowerCase().indexOf('o.e.m.') !== -1) { result.assetTag = '-'; }

  // mem
  lines = data.results[1] ? data.results[1].toString().split('\n') : [''];
  result.memMax = toInt(getValue(lines, 'Maximum Capacity')) * 1024 * 1024 * 1024 || null;
  result.memSlots = toInt(getValue(lines, 'Number Of Devices')) || null;

  // raspberry
  let linesRpi: string[] = [];
  try {
    linesRpi = (await fs.readFile('/proc/cpuinfo')).toString().split('\n');
  } catch (e) {
    noop();
  }
  const hardware = getValue(linesRpi, 'hardware');
  if (hardware.startsWith('BCM')) {
    const rpi = decodePiCpuinfo(linesRpi);
    result.manufacturer = rpi.manufacturer;
    result.model = 'Raspberry Pi';
    result.serial = rpi.serial;
    result.version = rpi.type + ' - ' + rpi.revision;
    result.memMax = os.totalmem();
    result.memSlots = 0;
  }

  return result;
};

export const baseboard = () => {
  return new Promise<BaseboardData>(resolve => {
    process.nextTick(() => {
      return resolve(nixBaseboard());
    });
  });
};

