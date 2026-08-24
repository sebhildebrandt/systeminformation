import { readFile } from 'fs/promises';
import { fileExists } from '../common/files';
import { BatteryObject } from '../common/types';

import { cloneObj, getValue, nextTick, toInt } from '../common';
import { initBatteryResult } from '../common/defaults';

export const battery = async (): Promise<BatteryObject[]> => {
  await nextTick();
  const defaults = cloneObj(initBatteryResult);
  let acConnected = false;
  let timeRemaining = defaults.timeRemaining;
  const bat1 = '/sys/class/power_supply/BAT1/uevent';
  const bat0 = '/sys/class/power_supply/BAT0/uevent';
  const ac = '/sys/class/power_supply/AC/online';
  const ac0 = '/sys/class/power_supply/AC0/online';
  const battery_path = (await fileExists(bat1)) ? bat1 : (await fileExists(bat0)) ? bat0 : '';
  const acPath = (await fileExists(ac)) ? ac : (await fileExists(ac0)) ? ac0 : '';
  if (acPath) {
    try {
      const file = await readFile(acPath);
      acConnected = file.toString().trim() === '1';
    } catch {}
  }

  if (battery_path) {
    const stdout = await readFile(battery_path);
    const lines = stdout.toString().split('\n');

    const isCharging = getValue(lines, 'POWER_SUPPLY_STATUS', '=').toLowerCase() === 'charging';
    acConnected = acConnected || isCharging;
    const voltage = toInt('0' + getValue(lines, 'POWER_SUPPLY_VOLTAGE_NOW', '=')) / 1000000.0;
    const capacityUnit = voltage ? 'mWh' : 'mAh';
    const cycleCount = toInt('0' + getValue(lines, 'POWER_SUPPLY_CYCLE_COUNT', '='));
    let maxCapacity = Math.round((toInt('0' + getValue(lines, 'POWER_SUPPLY_CHARGE_FULL', '=', true, true)) / 1000.0) * (voltage || 1));
    const desingedMinVoltage = toInt('0' + getValue(lines, 'POWER_SUPPLY_VOLTAGE_MIN_DESIGN', '=')) / 1000000.0;
    let designedCapacity = Math.round((toInt('0' + getValue(lines, 'POWER_SUPPLY_CHARGE_FULL_DESIGN', '=', true, true)) / 1000.0) * (desingedMinVoltage || voltage || 1));
    let currentCapacity = Math.round((toInt('0' + getValue(lines, 'POWER_SUPPLY_CHARGE_NOW', '=')) / 1000.0) * (voltage || 1));
    if (!maxCapacity) {
      maxCapacity = toInt('0' + getValue(lines, 'POWER_SUPPLY_ENERGY_FULL', '=', true, true)) / 1000.0;
      designedCapacity = (toInt('0' + getValue(lines, 'POWER_SUPPLY_ENERGY_FULL_DESIGN', '=', true, true)) / 1000.0) | maxCapacity;
      currentCapacity = toInt('0' + getValue(lines, 'POWER_SUPPLY_ENERGY_NOW', '=')) / 1000.0;
    }
    let percent = toInt('0' + getValue(lines, 'POWER_SUPPLY_CAPACITY', '='));
    const energy = toInt('0' + getValue(lines, 'POWER_SUPPLY_ENERGY_NOW', '='));
    const power = toInt('0' + getValue(lines, 'POWER_SUPPLY_POWER_NOW', '='));
    const current = toInt('0' + getValue(lines, 'POWER_SUPPLY_CURRENT_NOW', '='));
    const charge = parseInt('0' + getValue(lines, 'POWER_SUPPLY_CHARGE_NOW', '='), 10);

    if (maxCapacity && currentCapacity) {
      if (!percent) {
        percent = (100.0 * currentCapacity) / maxCapacity;
      }
    }
    if (energy && power) {
      timeRemaining = Math.floor((energy / power) * 60);
    } else if (current && charge) {
      timeRemaining = Math.floor((charge / current) * 60);
    } else if (current && currentCapacity) {
      timeRemaining = Math.floor((currentCapacity / current) * 60);
    }
    const type = getValue(lines, 'POWER_SUPPLY_TECHNOLOGY', '=');
    const model = getValue(lines, 'POWER_SUPPLY_MODEL_NAME', '=');
    const manufacturer = getValue(lines, 'POWER_SUPPLY_MANUFACTURER', '=');
    const serial = getValue(lines, 'POWER_SUPPLY_SERIAL_NUMBER', '=');
    return [
      {
        ...defaults,
        cycleCount,
        isCharging,
        designedCapacity,
        maxCapacity,
        currentCapacity,
        voltage,
        capacityUnit,
        percent,
        timeRemaining,
        acConnected,
        type,
        model,
        manufacturer,
        serial
      }
    ];
  }
  return [];
};
