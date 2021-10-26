import { nextTick } from '../common';
import { execCmd } from '../common/exec';
import { initCpuTemperature } from '../common/initials';
import { CpuTemperatureObject } from '../common/types';

export const bsdCpuTemperature = async () => {
  let result = initCpuTemperature;
  const stdout = (await execCmd('sysctl dev.cpu | grep temp')).toString();
  let lines = stdout.toString().split('\n');
  let sum = 0;
  lines.forEach((line: string) => {
    const parts = line.split(':');
    if (parts.length > 1) {
      const temp = parseFloat(parts[1].replace(',', '.'));
      if (!result.max || temp > result.max) { result.max = temp; }
      sum = sum + temp;
      result.cores.push(temp);
    }
  });
  if (result.cores.length) {
    result.main = Math.round(sum / result.cores.length * 100) / 100;
  }
  return result;
};

export const cpuTemperature = async () => {
  await nextTick();
  return bsdCpuTemperature();
};
