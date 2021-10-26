import { cloneObj, nextTick } from '../common';
import { powerShell } from '../common/exec';
import { initCpuTemperature } from '../common/defaults';

export const windowsCpuTemperature = async () => {
  const result = cloneObj(initCpuTemperature);
  try {
    powerShell('Get-WmiObject MSAcpi_ThermalZoneTemperature -Namespace "root/wmi" | Select CurrentTemperature').then((stdout) => {
      let sum = 0;
      const lines = stdout.split('\r\n').filter(line => line.trim() !== '');
      lines.shift();
      lines.forEach(function (line) {
        const value = (parseInt(line, 10) - 2732) / 10;
        sum = sum + value;
        if (!result.max || value > result.max) { result.max = value; }
        result.cores.push(value);
      });
      if (result.cores.length) {
        result.main = sum / result.cores.length;
      }
      return result;
    });
  } catch (e) {
    return result;
  }
};

export const cpuTemperature = async () => {
  await nextTick();
  return windowsCpuTemperature();
};
