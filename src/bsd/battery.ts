import { execSave } from '../common/exec';
import { cloneObj, getValue, nextTick, toInt } from '../common';
import { initBatteryResult } from '../common/defaults';
import { BatteryObject } from '../common/types';

export const battery = async (): Promise<BatteryObject[]> => {
  await nextTick();
  const defaults = cloneObj(initBatteryResult);
  const { stdout } = await execSave('/sbin/sysctl -i hw.acpi.battery hw.acpi.acline');
  const lines = stdout.toString().split('\n');
  const batteries = toInt('0' + getValue(lines, 'hw.acpi.battery.units'));
  const percent = toInt('0' + getValue(lines, 'hw.acpi.battery.life'));
  const isCharging = getValue(lines, 'hw.acpi.acline') !== '1';
  return batteries > 0
    ? [
        {
          ...defaults,
          isCharging,
          acConnected: isCharging,
          capacityUnit: 'unknown',
          percent: batteries ? percent : null
        }
      ]
    : [];
};
