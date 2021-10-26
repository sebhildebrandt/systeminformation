'use strict';

import { powerShell } from '../common/exec';
import { getValue, nextTick, toInt } from '../common';
import { initBatteryResult } from '../common/initials';

const parseWinBatteryPart = (lines: string[], designedCapacity: number, fullChargeCapacity: number) => {
  const status = toInt(getValue(lines, 'BatteryStatus', ':').trim());
  const percent = parseInt(getValue(lines, 'EstimatedChargeRemaining', ':')) || 0;
  const maxCapacity = fullChargeCapacity || parseInt(getValue(lines, 'DesignCapacity', ':')) || 0;
  const isCharging = (status >= 6 && status <= 9) || status === 11 || (!(status === 3) && !(status === 1) && percent < 100);

  return {
    status: status > 0 ? status : -1, // return -1 (no battery) if status !> 0
    hasBattery: true,
    maxCapacity: fullChargeCapacity || parseInt(getValue(lines, 'DesignCapacity', ':')) || 0,
    designedCapacity: parseInt(getValue(lines, 'DesignCapacity', ':')) || designedCapacity,
    voltage: parseInt(getValue(lines, 'DesignVoltage', ':') || '0') / 1000.0,
    capacityUnit: 'mWh',
    percent: parseInt(getValue(lines, 'EstimatedChargeRemaining', ':')) || 0,
    currentCapacity: Number((maxCapacity * percent / 100).toFixed(2)),
    isCharging,
    acConnected: isCharging || status === 2,
    model: getValue(lines, 'DeviceID', ':'),
  };
};

export const windowsBattery = async () => {
  let result = initBatteryResult;
  try {
    const workload = [];
    workload.push(powerShell('Get-WmiObject Win32_Battery | fl *'));
    workload.push(powerShell('(Get-WmiObject -Class BatteryStaticData -Namespace ROOT/WMI).DesignedCapacity'));
    workload.push(powerShell('(Get-WmiObject -Class BatteryFullChargedCapacity -Namespace ROOT/WMI).FullChargedCapacity'));
    const data = await Promise.allSettled(workload).then(results => results.map(result => result.status === 'fulfilled' ? result.value : ''));
    if (data) {
      const parts = data[0].toString().split(/\n\s*\n/);
      const batteries: any[] = [];
      const hasValue = (value: string) => /\S/.test(value);
      for (let i = 0; i < parts.length; i++) {
        if (hasValue(parts[i]) && (!batteries.length || !hasValue(parts[i - 1]))) {
          batteries.push([]);
        }
        if (hasValue(parts[i])) {
          batteries[batteries.length - 1].push(parts[i]);
        }
      }
      const designCapacities = data[1].toString().split('\r\n');
      const fullChargeCapacities = data[2].toString().split('\r\n');
      if (batteries.length) {
        let first = false;
        const additionalBatteries = [];
        for (let i = 0; i < batteries.length; i++) {
          const lines = batteries[i];
          const designedCapacity = designCapacities && designCapacities.length >= (i + 1) && designCapacities[i] ? toInt(designCapacities[i]) : 0;
          const fullChargeCapacity = fullChargeCapacities && fullChargeCapacities.length >= (i + 1) && fullChargeCapacities[i] ? toInt(fullChargeCapacities[i]) : 0;
          const parsed = parseWinBatteryPart(lines, designedCapacity, fullChargeCapacity);
          if (!first && parsed.status > 0 && parsed.status !== 10) {
            result.hasBattery = parsed.hasBattery;
            result.maxCapacity = parsed.maxCapacity;
            result.designedCapacity = parsed.designedCapacity;
            result.voltage = parsed.voltage;
            result.capacityUnit = parsed.capacityUnit;
            result.percent = parsed.percent;
            result.currentCapacity = parsed.currentCapacity;
            result.isCharging = parsed.isCharging;
            result.acConnected = parsed.acConnected;
            result.model = parsed.model;
            first = true;
          } else if (parsed.status !== -1) {
            additionalBatteries.push(
              {
                hasBattery: parsed.hasBattery,
                cycleCount: null,
                maxCapacity: parsed.maxCapacity,
                designedCapacity: parsed.designedCapacity,
                voltage: parsed.voltage,
                capacityUnit: parsed.capacityUnit,
                percent: parsed.percent,
                currentCapacity: parsed.currentCapacity,
                isCharging: parsed.isCharging,
                timeRemaining: null,
                acConnected: parsed.acConnected,
                model: parsed.model,
                type: '',
                manufacturer: '',
                serial: ''
              }
            );
          }
        }
        if (!first && additionalBatteries.length) {
          result = additionalBatteries[0];
          additionalBatteries.shift();
        }
        if (additionalBatteries.length) {
          result.additionalBatteries = additionalBatteries;
        }
      }
    }
    return result;
  } catch (e) {
    return result;
  }
};

export const battery = async () => {
  await nextTick();
  return windowsBattery();
};
