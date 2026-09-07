import { readFile } from 'node:fs/promises';
import { totalmem } from 'node:os';
import { cloneObj, getValue, nextTick, toInt } from '../common';
import { execOptsLinux } from '../common/const';
import { initBaseboard } from '../common/defaults';
import { execSave } from '../common/exec';
import { DMI_PATH, readFileLines, readSysfsMany } from '../common/files';
import { cleanDefaults } from '../common/parse';
import { decodePiCpuinfo } from '../common/raspberry';

export const baseboard = async () => {
  await nextTick();
  const defaults = cloneObj(initBaseboard);
  const boardTask =
    process.arch === 'arm'
      ? readFileLines('/proc/cpuinfo').then((cpuinfo) => cpuinfo.filter((line) => line.indexOf('Serial') >= 0))
      : execSave('export LC_ALL=C; dmidecode -t 2 2>/dev/null; unset LC_ALL', execOptsLinux).then((res) => res.stdout.split('\n'));
  const memTask = execSave('export LC_ALL=C; dmidecode -t memory 2>/dev/null', execOptsLinux).then((res) => res.stdout.split('\n'));
  const [boardLines, memLines] = await Promise.all([boardTask, memTask]);
  let lines = boardLines;
  let manufacturer = getValue(lines, 'Manufacturer');
  let model = getValue(lines, 'Product Name');
  let version = getValue(lines, 'Version');
  let serial = getValue(lines, 'Serial Number');
  let assetTag = getValue(lines, 'Asset Tag');
  // Non-Root values
  try {
    lines = await readSysfsMany(DMI_PATH, ['board_asset_tag', 'board_name', 'board_serial', 'board_vendor', 'board_version']);
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
  lines = memLines;
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
