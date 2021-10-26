'use strict';

import { getValue, nextTick } from "../common";
import { powerShell } from "../common/exec";
import { initChassis } from "../common/initials";
import { chassisTypes } from "../common/mappings";
import { ChassisData } from './../common/types';

export const windowsChassis = async () => {
  const result = initChassis;
  const stdout = await powerShell('Get-WmiObject Win32_SystemEnclosure | fl *');
  if (stdout) {
    let lines = stdout.toString().split('\r\n');

    result.manufacturer = getValue(lines, 'manufacturer', ':');
    result.model = getValue(lines, 'model', ':');
    const ctype = parseInt(getValue(lines, 'ChassisTypes', ':').replace(/\D/g, ''));
    result.type = (ctype && !isNaN(ctype) && ctype < chassisTypes.length) ? chassisTypes[ctype - 1] : '';
    result.version = getValue(lines, 'version', ':');
    result.serial = getValue(lines, 'serialnumber', ':');
    result.assetTag = getValue(lines, 'partnumber', ':');
    result.sku = getValue(lines, 'sku', ':');
    if (result.manufacturer.toLowerCase().indexOf('o.e.m.') !== -1) { result.manufacturer = '-'; }
    if (result.version.toLowerCase().indexOf('o.e.m.') !== -1) { result.version = '-'; }
    if (result.serial.toLowerCase().indexOf('o.e.m.') !== -1) { result.serial = '-'; }
    if (result.assetTag.toLowerCase().indexOf('o.e.m.') !== -1) { result.assetTag = '-'; }
  }
  return result;
};

export const chassis = async () => {
  await nextTick();
  return windowsChassis();
};

