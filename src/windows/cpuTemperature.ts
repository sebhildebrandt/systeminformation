'use strict';

import { powerShell } from '../common/exec';
import { initCpuTemperature } from '../common/initials';
import { CpuTemperatureObject } from '../common/types';

export const windowsCpuTemperature = async () => {
  let result = initCpuTemperature;
  try {
    powerShell('Get-WmiObject MSAcpi_ThermalZoneTemperature -Namespace "root/wmi" | Select CurrentTemperature').then((stdout) => {
      let sum = 0;
      let lines = stdout.split('\r\n').filter(line => line.trim() !== '').filter((line, idx) => idx > 0);
      lines.forEach(function (line) {
        let value = (parseInt(line, 10) - 2732) / 10;
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

export const cpuTemperature = () => {
  return new Promise<CpuTemperatureObject | null | undefined>(resolve => {
    process.nextTick(() => {
      return resolve(windowsCpuTemperature());
    });
  });
};
