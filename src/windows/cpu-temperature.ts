import { cloneObj, nextTick } from '../common';
import { initCpuTemperature } from '../common/defaults';
import { ps, psArray } from '../common/windows';

export const cpuTemperature = async () => {
  await nextTick();
  const result = cloneObj(initCpuTemperature);
  try {
    const tempParts = psArray(await ps.exec('Get-CimInstance MSAcpi_ThermalZoneTemperature -Namespace "root/wmi" | Select CurrentTemperature | ConvertTo-Json'));
    let sum = 0;
    tempParts.forEach((obj: any) => {
      if (obj?.CurrentTemperature) {
        const value = (obj.CurrentTemperature - 2732) / 10;
        sum = sum + value;
        if (!result.max || value > result.max) {
          result.max = value;
        }
        result.cores.push(value);
      }
    });
    if (result.cores.length) {
      result.main = sum / result.cores.length;
    }
    return result;
  } catch {
    return result;
  }
};
