'use strict';

import { execCmd } from '../common/exec';
import { getValue, nextTick } from '../common';
import { BatteryObject } from '../common/types';
import { initBatteryResult } from '../common/initials';

export const bsdBattery = async () => {
  let result = initBatteryResult;
  const stdout = await execCmd('sysctl hw.acpi.battery hw.acpi.acline');
  let lines = stdout.toString().split('\n');
  const batteries = parseInt('0' + getValue(lines, 'hw.acpi.battery.units'), 10);
  const percent = parseInt('0' + getValue(lines, 'hw.acpi.battery.life'), 10);
  result.hasBattery = (batteries > 0);
  result.isCharging = getValue(lines, 'hw.acpi.acline') !== '1';
  result.acConnected = result.isCharging;
  result.capacityUnit = 'unknown';
  result.percent = batteries ? percent : null;
  return result;
};

export const battery = async () => {
  await nextTick();
  return bsdBattery();
};
