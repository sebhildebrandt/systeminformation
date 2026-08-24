import { cloneObj, getValue, nextTick, toInt } from '../common';
import { initBatteryResult } from '../common/defaults';
import { execSave } from '../common/exec';
import { BatteryObject } from '../common/types';

const parseBatteryObject = (data: string): BatteryObject[] => {
  const defaults = cloneObj(initBatteryResult);
  data = data || '';
  const lines = data.replace(/ +/g, '').replace(/"+/g, '').replace(/-/g, '').split('\n');
  let percent = null;
  const line = getValue(lines, 'internal', 'Battery');
  const parts = line.split(';');
  if (parts && parts[0]) {
    const parts2 = parts[0].split('\t');
    if (parts2 && parts2[1]) {
      percent = parseFloat(parts2[1].trim().replace(/%/g, ''));
    }
  }
  const isCharging = parts && parts[1] ? parts[1].trim() === 'charging' : getValue(lines, 'ischarging', '=').toLowerCase() === 'yes';
  const acConnected = parts && parts[1] ? parts[1].trim() !== 'discharging' : false;

  const voltage = parseInt('0' + getValue(lines, 'voltage', '='), 10) / 1000.0;
  const capacityUnit = voltage ? 'mWh' : 'mAh';
  const maxCapacity = Math.round(parseInt('0' + getValue(lines, 'applerawmaxcapacity', '='), 10) * (voltage || 1));
  const currentCapacity = Math.round(parseInt('0' + getValue(lines, 'applerawcurrentcapacity', '='), 10) * (voltage || 1));
  const designedCapacity = Math.round(parseInt('0' + getValue(lines, 'DesignCapacity', '='), 10) * (voltage || 1));
  let hasBattery = defaults.hasBattery;
  let type = defaults.type;
  let timeRemaining = defaults.timeRemaining;
  if (maxCapacity && currentCapacity) {
    hasBattery = true;
    type = 'Li-ion';
    percent = percent !== null ? percent : Math.round((100.0 * currentCapacity) / maxCapacity);
    if (!isCharging) {
      timeRemaining = parseInt('0' + getValue(lines, 'TimeRemaining', '='), 10);
    }
  }

  return hasBattery
    ? [
        {
          ...defaults,
          cycleCount: toInt('0' + getValue(lines, 'cyclecount', '=')),
          voltage,
          capacityUnit,
          maxCapacity,
          currentCapacity,
          designedCapacity,
          manufacturer: 'Apple',
          serial: getValue(lines, 'BatterySerialNumber', '=') || getValue(lines, 'Serial', '='),
          type,
          model: getValue(lines, 'DeviceName', '='),
          percent,
          timeRemaining,
          isCharging,
          acConnected
        }
      ]
    : [];
};

export const battery = async () => {
  await nextTick();
  const { stdout } = await execSave(
    'ioreg -n AppleSmartBattery -r | egrep "CycleCount|IsCharging|DesignCapacity|MaxCapacity|CurrentCapacity|DeviceName|BatterySerialNumber|Serial|TimeRemaining|Voltage"; pmset -g batt | grep %'
  );
  return parseBatteryObject(stdout);
};
