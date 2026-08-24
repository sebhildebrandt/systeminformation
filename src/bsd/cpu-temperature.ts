import { cloneObj, nextTick } from '../common';
import { exec } from '../common/exec';
import { initCpuTemperature } from '../common/defaults';

export const cpuTemperature = async () => {
  await nextTick();
  const result = cloneObj(initCpuTemperature);
  const { stdout } = await exec('/sbin/sysctl -i dev.cpu | grep temp');
  const lines = stdout.toString().split('\n');
  let sum = 0;
  lines.forEach((line) => {
    const parts = line.split(':');
    if (parts.length > 1) {
      const temp = parseFloat(parts[1].replace(',', '.'));
      if (!result.max || temp > result.max) {
        result.max = temp;
      }
      sum = sum + temp;
      result.cores.push(temp);
    }
  });
  if (result.cores.length) {
    result.main = Math.round((sum / result.cores.length) * 100) / 100;
  }
  return result;
};
