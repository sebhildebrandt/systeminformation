'use strict';

import { execCmd } from '../common/exec';
import { getValue } from '../common';
import { BatteryObject } from '../common/types';
import { initBatteryResult } from '../common/initials';

export const darwinBattery = async () => {
  let result = initBatteryResult;
  const stdout = await execCmd('ioreg -n AppleSmartBattery -r | egrep "CycleCount|IsCharging|DesignCapacity|MaxCapacity|CurrentCapacity|BatterySerialNumber|TimeRemaining|Voltage"; pmset -g batt | grep %');
  if (stdout) {
    let lines = stdout.toString().replace(/ +/g, '').replace(/"+/g, '').replace(/-/g, '').split('\n');
    result.cycleCount = parseInt('0' + getValue(lines, 'cyclecount', '='), 10);
    result.voltage = parseInt('0' + getValue(lines, 'voltage', '='), 10) / 1000.0;
    result.capacityUnit = result.voltage ? 'mWh' : 'mAh';
    result.maxCapacity = Math.round(parseInt('0' + getValue(lines, 'maxcapacity', '='), 10) * (result.voltage || 1));
    result.currentCapacity = Math.round(parseInt('0' + getValue(lines, 'currentcapacity', '='), 10) * (result.voltage || 1));
    result.designedCapacity = Math.round(parseInt('0' + getValue(lines, 'DesignCapacity', '='), 10) * (result.voltage || 1));
    result.manufacturer = 'Apple';
    result.serial = getValue(lines, 'BatterySerialNumber', '=');
    let percent = null;
    const line = getValue(lines, 'internal', 'Battery');
    let parts = line.split(';');
    if (parts && parts[0]) {
      let parts2 = parts[0].split('\t');
      if (parts2 && parts2[1]) {
        percent = parseFloat(parts2[1].trim().replace(/%/g, ''));
      }
    }
    if (parts && parts[1]) {
      result.isCharging = (parts[1].trim() === 'charging');
      result.acConnected = (parts[1].trim() !== 'discharging');
    } else {
      result.isCharging = getValue(lines, 'ischarging', '=').toLowerCase() === 'yes';
      result.acConnected = result.isCharging;
    }
    if (result.maxCapacity && result.currentCapacity) {
      result.hasBattery = true;
      result.type = 'Li-ion';
      result.percent = percent !== null ? percent : Math.round(100.0 * result.currentCapacity / result.maxCapacity);
      if (!result.isCharging) {
        result.timeRemaining = parseInt('0' + getValue(lines, 'TimeRemaining', '='), 10);
      }
    }
  }
  return result;
};

export const battery = () => {
  return new Promise<BatteryObject | null>(resolve => {
    process.nextTick(() => {
      return resolve(darwinBattery());
    });
  });
};
