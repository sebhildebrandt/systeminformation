import { cloneObj, nextTick } from '../common';
import { initCpuTemperature } from '../common/defaults';

export const cpuTemperature = async () => {
  await nextTick();
  let result = cloneObj(initCpuTemperature);
  let osxTemp = null;
  try {
    osxTemp = require('osx-temperature-sensor');
  } catch (er) {
    osxTemp = null;
  }
  if (osxTemp) {
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
  }
  try {
    // Apple Silicon - optional macos-temperature-sensor dependency
    const macosTemp = require('macos-temperature-sensor');
    const res = macosTemp.temperature();
    if (res.cpu) {
      // round to 2 digits
      result.main = Math.round(res.cpu * 100) / 100;
      result.max = result.main;
    }
    if (res.soc) {
      result.chipset = Math.round(res.soc * 100) / 100;
    }
    if (res && res.cpuDieTemps && res.cpuDieTemps.length) {
      for (const temp of res.cpuDieTemps) {
        result.cores.push(Math.round(temp * 100) / 100);
      }
    }
  } catch {}
  return result;
};
