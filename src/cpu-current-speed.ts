import { cpus } from 'os';
import { nextTick } from './common';
import { CpuCurrentSpeedObject } from './common/types';

export const getCpuCurrentSpeed = (): CpuCurrentSpeedObject => {

  const oscpus = cpus();
  let minFreq = 999999999;
  let maxFreq = 0;
  let avgFreq = 0;
  const cores: number[] = [];

  if (oscpus && oscpus.length) {
    for (const i in oscpus) {
      if (Object.keys(oscpus).includes(i)) {
        const freq = oscpus[i].speed > 100 ? (oscpus[i].speed + 1) / 1000 : oscpus[i].speed / 10;
        avgFreq = avgFreq + freq;
        if (freq > maxFreq) { maxFreq = freq; }
        if (freq < minFreq) { minFreq = freq; }
        cores.push(parseFloat(freq.toFixed(2)));
      }
    }
    avgFreq = avgFreq / oscpus.length;
    return {
      min: parseFloat(minFreq.toFixed(2)),
      max: parseFloat(maxFreq.toFixed(2)),
      avg: parseFloat((avgFreq).toFixed(2)),
      cores: cores
    };
  } else {
    return {
      min: 0,
      max: 0,
      avg: 0,
      cores: cores
    };
  }
};

// TODO: _cpu_speed
const _cpu_speed = 0;

export const cpuCurrentSpeed = async () => {
  await nextTick();
  let result = getCpuCurrentSpeed();
  if (result.avg === 0 && _cpu_speed !== 0) {
    const currCpuSpeed = _cpu_speed;
    result = {
      min: currCpuSpeed,
      max: currCpuSpeed,
      avg: currCpuSpeed,
      cores: []
    };
  }
  return result;
};
