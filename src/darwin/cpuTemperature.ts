import { initCpuTemperature } from '../common/initials';
import { CpuTemperatureObject } from '../common/types';

export const darwinCpuTemperature = async () => {
  let result = initCpuTemperature;
  let osxTemp = null;
  try {
    osxTemp = require('osx-temperature-sensor');
  } catch (er) {
    osxTemp = null;
  }
  if (osxTemp) {
    result = osxTemp.cpuTemperature();
  }
  return result;
};

export const cpuTemperature = () => {
  return new Promise<CpuTemperatureObject | null | undefined>(resolve => {
    process.nextTick(() => {
      return resolve(darwinCpuTemperature());
    });
  });
};
