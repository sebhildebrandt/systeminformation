'use strict';

import { promises as fs, existsSync } from "fs";

import { getValue } from '../common';
import { BatteryObject } from '../common/types';
import { initBatteryResult } from '../common/initials';

export const linuxBattery = async () => {
  let result = initBatteryResult;
  let acConnected = false;
  const bat1 = '/sys/class/power_supply/BAT1/uevent';
  const bat0 = '/sys/class/power_supply/BAT0/uevent';
  const ac = '/sys/class/power_supply/AC/online';
  const ac0 = '/sys/class/power_supply/AC0/online';
  const battery_path = (await existsSync(bat1)) ? bat1 : (existsSync(bat0) ? bat0 : '');
  const acPath = (await existsSync(ac)) ? ac : (existsSync(ac0) ? ac0 : '');
  if (acPath) {
    const file = await fs.readFile(acPath);
    acConnected = file.toString().trim() === '1';
  }

  if (battery_path) {
    const stdout = await fs.readFile(battery_path);
    let lines = stdout.toString().split('\n');

    result.isCharging = (getValue(lines, 'POWER_SUPPLY_STATUS', '=').toLowerCase() === 'charging');
    result.acConnected = acConnected || result.isCharging;
    result.voltage = parseInt('0' + getValue(lines, 'POWER_SUPPLY_VOLTAGE_NOW', '='), 10) / 1000000.0;
    result.capacityUnit = result.voltage ? 'mWh' : 'mAh';
    result.cycleCount = parseInt('0' + getValue(lines, 'POWER_SUPPLY_CYCLE_COUNT', '='), 10);
    result.maxCapacity = Math.round(parseInt('0' + getValue(lines, 'POWER_SUPPLY_CHARGE_FULL', '=', true, true), 10) / 1000.0 * (result.voltage || 1));
    const desingedMinVoltage = parseInt('0' + getValue(lines, 'POWER_SUPPLY_VOLTAGE_MIN_DESIGN', '='), 10) / 1000000.0;
    result.designedCapacity = Math.round(parseInt('0' + getValue(lines, 'POWER_SUPPLY_CHARGE_FULL_DESIGN', '=', true, true), 10) / 1000.0 * (desingedMinVoltage || result.voltage || 1));
    result.currentCapacity = Math.round(parseInt('0' + getValue(lines, 'POWER_SUPPLY_CHARGE_NOW', '='), 10) / 1000.0 * (result.voltage || 1));
    if (!result.maxCapacity) {
      result.maxCapacity = parseInt('0' + getValue(lines, 'POWER_SUPPLY_ENERGY_FULL', '=', true, true), 10) / 1000.0;
      result.designedCapacity = parseInt('0' + getValue(lines, 'POWER_SUPPLY_ENERGY_FULL_DESIGN', '=', true, true), 10) / 1000.0 | result.maxCapacity;
      result.currentCapacity = parseInt('0' + getValue(lines, 'POWER_SUPPLY_ENERGY_NOW', '='), 10) / 1000.0;
    }
    const percent = getValue(lines, 'POWER_SUPPLY_CAPACITY', '=');
    const energy = parseInt('0' + getValue(lines, 'POWER_SUPPLY_ENERGY_NOW', '='), 10);
    const power = parseInt('0' + getValue(lines, 'POWER_SUPPLY_POWER_NOW', '='), 10);
    const current = parseInt('0' + getValue(lines, 'POWER_SUPPLY_CURRENT_NOW', '='), 10);

    result.percent = parseInt('0' + percent, 10);
    if (result.maxCapacity && result.currentCapacity) {
      result.hasBattery = true;
      if (!percent) {
        result.percent = 100.0 * result.currentCapacity / result.maxCapacity;
      }
    }
    if (result.isCharging) {
      result.hasBattery = true;
    }
    if (energy && power) {
      result.timeRemaining = Math.floor(energy / power * 60);
    } else if (current && result.currentCapacity) {
      result.timeRemaining = Math.floor(result.currentCapacity / current * 60);
    }
    result.type = getValue(lines, 'POWER_SUPPLY_TECHNOLOGY', '=');
    result.model = getValue(lines, 'POWER_SUPPLY_MODEL_NAME', '=');
    result.manufacturer = getValue(lines, 'POWER_SUPPLY_MANUFACTURER', '=');
    result.serial = getValue(lines, 'POWER_SUPPLY_SERIAL_NUMBER', '=');
  }
  return result;
};

export const battery = () => {
  return new Promise<BatteryObject | null>(resolve => {
    process.nextTick(() => {
      return resolve(linuxBattery());
    });
  });
};
