import { readFile } from 'node:fs/promises';
import { totalmem } from 'node:os';
import { cloneObj, getValue, nextTick, toInt } from '../common';
import { execOptsLinux } from '../common/const';
import { initBaseboard } from '../common/defaults';
import { exec } from '../common/exec';
import { cleanDefaults } from '../common/parse';
import { decodePiCpuinfo } from '../common/raspberry';

export const baseboard = async () => {
  await nextTick();
  const defaults = cloneObj(initBaseboard);
  let cmd = '';
  if (process.arch === 'arm') {
    cmd = 'cat /proc/cpuinfo | grep Serial';
  } else {
    cmd = 'export LC_ALL=C; dmidecode -t 2 2>/dev/null; unset LC_ALL';
  }
  const workload = [];
  workload.push(exec(cmd, execOptsLinux));
  workload.push(exec('export LC_ALL=C; dmidecode -t memory 2>/dev/null', execOptsLinux));
  const data = await Promise.allSettled(workload).then((results) => results.map((result) => (result.status === 'fulfilled' ? result.value : null)));
  let lines = data[0] ? data[0].stdout.split('\n') : [''];
  let manufacturer = getValue(lines, 'Manufacturer');
  let model = getValue(lines, 'Product Name');
  let version = getValue(lines, 'Version');
  let serial = getValue(lines, 'Serial Number');
  let assetTag = getValue(lines, 'Asset Tag');
  // Non-Root values
  cmd = `echo -n "board_asset_tag: "; cat /sys/devices/virtual/dmi/id/board_asset_tag 2>/dev/null; echo;
            echo -n "board_name: "; cat /sys/devices/virtual/dmi/id/board_name 2>/dev/null; echo;
            echo -n "board_serial: "; cat /sys/devices/virtual/dmi/id/board_serial 2>/dev/null; echo;
            echo -n "board_vendor: "; cat /sys/devices/virtual/dmi/id/board_vendor 2>/dev/null; echo;
            echo -n "board_version: "; cat /sys/devices/virtual/dmi/id/board_version 2>/dev/null; echo;`;
  try {
    const { stdout } = await exec(cmd, execOptsLinux);
    lines = stdout.split('\n');
    manufacturer = !manufacturer ? getValue(lines, 'board_vendor') : manufacturer;
    model = !model ? getValue(lines, 'board_name') : model;
    version = !version ? getValue(lines, 'board_version') : version;
    serial = !serial ? getValue(lines, 'board_serial') : serial;
    assetTag = !assetTag ? getValue(lines, 'board_asset_tag') : assetTag;
  } catch {}
  serial = cleanDefaults(serial);
  assetTag = cleanDefaults(assetTag);
  model = cleanDefaults(model);
  version = cleanDefaults(version);
  manufacturer = cleanDefaults(manufacturer);

  // mem
  lines = data[1] ? data[1].stdout.split('\n') : [''];
  let memMax = toInt(getValue(lines, 'Maximum Capacity')) * 1024 * 1024 * 1024 || null;
  let memSlots = toInt(getValue(lines, 'Number Of Devices')) || null;

  // raspberry
  let linesRpi: string[] = [];
  try {
    linesRpi = (await readFile('/proc/cpuinfo')).toString().split('\n');
  } catch {}
  const hardware = getValue(linesRpi, 'hardware');
  if (hardware.startsWith('BCM')) {
    const rpi = decodePiCpuinfo(linesRpi);
    manufacturer = rpi.manufacturer;
    model = 'Raspberry Pi';
    serial = rpi.serial;
    version = rpi.type + ' - ' + rpi.revision;
    memMax = totalmem();
    memSlots = 0;
  }

  return {
    ...defaults,
    manufacturer,
    model,
    serial,
    version,
    assetTag,
    memMax,
    memSlots
  };
};
