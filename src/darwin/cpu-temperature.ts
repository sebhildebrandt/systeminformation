import { cloneObj, nextTick } from '../common';
import { initCpuTemperature } from '../common/defaults';

export const cpuTemperature = async () => {
  await nextTick();
  let result = cloneObj(initCpuTemperature);
  try {
    // native binding is required lazily inside cpuTemperature() and may be missing
    const osxTemp = require('osx-temperature-sensor');
    result = osxTemp.cpuTemperature();
    // round to 2 digits
    if (result.main) {
      result.main = Math.round(result.main * 100) / 100;
    }
    if (result.max) {
      result.max = Math.round(result.max * 100) / 100;
    }
    if (result.cores && result.cores.length) {
      for (let i = 0; i < result.cores.length; i++) {
        result.cores[i] = Math.round(result.cores[i] * 100) / 100;
      }
    }
  } catch {}
  try {
    // Apple Silicon - optional macos-smc dependency (SMC Tp* / Te* sensors, no SoC sensor)
    const smc = require('macos-smc');
    const cpu = smc.temperatures()?.cpu;
    if (typeof cpu?.max === 'number') {
      const round2 = (value: number) => Math.round(value * 100) / 100;
      result.main = round2(typeof cpu.avg === 'number' ? cpu.avg : cpu.max);
      result.max = round2(cpu.max);
      result.cores = (cpu.sensors || []).map((sensor: any) => round2(sensor.value));
    }
  } catch {}
  return result;
};
