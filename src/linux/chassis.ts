'use strict';

import { getValue } from "../common";
import { execCmd } from "../common/exec";
import { initChassis } from "../common/initials";
import { chassisTypes } from "../common/mappings";
import { ChassisData } from './../common/types';

export const nixChassis = async () => {
  const result = initChassis;
  const cmd = `echo -n "chassis_asset_tag: "; cat /sys/devices/virtual/dmi/id/chassis_asset_tag 2>/dev/null; echo;
            echo -n "chassis_serial: "; cat /sys/devices/virtual/dmi/id/chassis_serial 2>/dev/null; echo;
            echo -n "chassis_type: "; cat /sys/devices/virtual/dmi/id/chassis_type 2>/dev/null; echo;
            echo -n "chassis_vendor: "; cat /sys/devices/virtual/dmi/id/chassis_vendor 2>/dev/null; echo;
            echo -n "chassis_version: "; cat /sys/devices/virtual/dmi/id/chassis_version 2>/dev/null; echo;`;
  const stdout = await execCmd(cmd);
  let lines = stdout.toString().split('\n');
  result.manufacturer = getValue(lines, 'chassis_vendor');
  const ctype = parseInt(getValue(lines, 'chassis_type').replace(/\D/g, ''));
  result.type = (ctype && !isNaN(ctype) && ctype < chassisTypes.length) ? chassisTypes[ctype - 1] : '';
  result.version = getValue(lines, 'chassis_version');
  result.serial = getValue(lines, 'chassis_serial');
  result.assetTag = getValue(lines, 'chassis_asset_tag');
  if (result.manufacturer.toLowerCase().indexOf('o.e.m.') !== -1) { result.manufacturer = '-'; }
  if (result.version.toLowerCase().indexOf('o.e.m.') !== -1) { result.version = '-'; }
  if (result.serial.toLowerCase().indexOf('o.e.m.') !== -1) { result.serial = '-'; }
  if (result.assetTag.toLowerCase().indexOf('o.e.m.') !== -1) { result.assetTag = '-'; }

  return result;
};

export const chassis = () => {
  return new Promise<ChassisData>(resolve => {
    process.nextTick(() => {
      return resolve(nixChassis());
    });
  });
};

