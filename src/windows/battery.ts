import { cloneObj, getValue, nextTick, toInt } from '../common';
import { initBatteryResult } from '../common/defaults';
import { ps } from '../common/windows';

const parseWinBatteryPart = (lines: string[], designedCapacity: number, fullChargeCapacity: number) => {
  const status = toInt(getValue(lines, 'BatteryStatus', ':').trim());
  const percent = Number.parseInt(getValue(lines, 'EstimatedChargeRemaining', ':'), 10) || 0;
  const maxCapacity = fullChargeCapacity || Number.parseInt(getValue(lines, 'DesignCapacity', ':'), 10) || 0;
  const isCharging = (status >= 6 && status <= 9) || status === 11 || (status !== 3 && status !== 1 && percent < 100);

  return {
    status: status > 0 ? status : -1, // return -1 (no battery) if status !> 0
    hasBattery: true,
    maxCapacity: fullChargeCapacity || Number.parseInt(getValue(lines, 'DesignCapacity', ':'), 10) || 0,
    designedCapacity: Number.parseInt(getValue(lines, 'DesignCapacity', ':'), 10) || designedCapacity,
    voltage: Number.parseInt(getValue(lines, 'DesignVoltage', ':') || '0', 10) / 1000.0,
    capacityUnit: 'mWh',
    percent: Number.parseInt(getValue(lines, 'EstimatedChargeRemaining', ':'), 10) || 0,
    currentCapacity: Number(((maxCapacity * percent) / 100).toFixed(2)),
    isCharging,
    acConnected: isCharging || status === 2,
    model: getValue(lines, 'DeviceID', ':')
  };
};

export const battery = async () => {
  await nextTick();
  const defaults = cloneObj(initBatteryResult);
  const result = [];
  try {
    const workload = [];
    workload.push(
      ps.exec('Get-CimInstance Win32_Battery | select BatteryStatus, DesignCapacity, DesignVoltage, EstimatedChargeRemaining, DeviceID | fl'),
      ps.exec('(Get-WmiObject -Class BatteryStaticData -Namespace ROOT/WMI).DesignedCapacity'),
      ps.exec('(Get-CimInstance -Class BatteryFullChargedCapacity -Namespace ROOT/WMI).FullChargedCapacity')
    );
    const data = await Promise.allSettled(workload).then((results) => results.map((result) => (result.status === 'fulfilled' ? result.value : '')));
    if (data) {
      const parts = data[0].toString().split(/\n\s*\n/);
      const batteries: any[] = [];
      const hasValue = (value: string) => /\S/.test(value);
      for (const element of parts) {
        if (hasValue(element)) {
          batteries.push(element);
        }
      }
      const designCapacities = data[1]
        .toString()
        .split('\r\n')
        .filter((e: string) => e);
      const fullChargeCapacities = data[2]
        .toString()
        .split('\r\n')
        .filter((e: string) => e);
      if (batteries.length) {
        for (let i = 0; i < batteries.length; i++) {
          const lines = batteries[i].split('\r\n');
          const designedCapacity = designCapacities && designCapacities.length >= i + 1 && designCapacities[i] ? toInt(designCapacities[i]) : 0;
          const fullChargeCapacity = fullChargeCapacities && fullChargeCapacities.length >= i + 1 && fullChargeCapacities[i] ? toInt(fullChargeCapacities[i]) : 0;
          const parsed = parseWinBatteryPart(lines, designedCapacity, fullChargeCapacity);
          if (parsed.status > 0 && parsed.status !== 10) {
            result.push({
              ...defaults,
              hasBattery: parsed.hasBattery,
              maxCapacity: parsed.maxCapacity,
              designedCapacity: parsed.designedCapacity,
              voltage: parsed.voltage,
              capacityUnit: parsed.capacityUnit,
              percent: parsed.percent,
              currentCapacity: parsed.currentCapacity,
              isCharging: parsed.isCharging,
              acConnected: parsed.acConnected,
              model: parsed.model
            });
          }
        }
      }
    }
    return result;
  } catch {
    return result;
  }
};
