import { cpus } from 'node:os';
import { nextTick } from './common';
import { execOptsLinux, LINUX } from './common/const';
import { getCpuSpeed } from './common/cpu';
import { exec } from './common/exec';
import type { CpuCurrentSpeedObject } from './common/types';

export const getCpuCurrentSpeed = async (): Promise<CpuCurrentSpeedObject> => {
  const oscpus = cpus();
  let minFreq = 999999999;
  let maxFreq = 0;
  let avgFreq = 0;
  const cores: number[] = [];
  const speeds: number[] = [];

  if (oscpus?.length && oscpus[0]?.speed !== undefined) {
    for (const i in oscpus) {
      speeds.push(oscpus[i].speed > 100 ? (oscpus[i].speed + 1) / 1000 : oscpus[i].speed / 10);
    }
  } else if (LINUX) {
    try {
      const { stdout } = await exec('cat /proc/cpuinfo | grep "cpu MHz" | cut -d " " -f 3', execOptsLinux);
      const speedStrings = stdout.split('\n').filter((line) => line.length > 0);
      for (const i in speedStrings) {
        speeds.push(Math.floor(parseInt(speedStrings[i], 10) / 10) / 100);
      }
    } catch {}
  }
  if (speeds?.length) {
    try {
      for (const i in speeds) {
        avgFreq = avgFreq + speeds[i];
        if (speeds[i] > maxFreq) {
          maxFreq = speeds[i];
        }
        if (speeds[i] < minFreq) {
          minFreq = speeds[i];
        }
        cores.push(parseFloat(speeds[i].toFixed(2)));
      }
      avgFreq = avgFreq / speeds.length;
      return {
        min: parseFloat(minFreq.toFixed(2)),
        max: parseFloat(maxFreq.toFixed(2)),
        avg: parseFloat(avgFreq.toFixed(2)),
        cores: cores
      };
    } catch {
      return {
        min: 0,
        max: 0,
        avg: 0,
        cores: cores
      };
    }
  } else {
    return {
      min: 0,
      max: 0,
      avg: 0,
      cores: cores
    };
  }
};

export const cpuCurrentSpeed = async () => {
  await nextTick();
  let result = await getCpuCurrentSpeed();
  if (result.avg === 0 && getCpuSpeed() !== 0) {
    const currCpuSpeed = getCpuSpeed();
    result = {
      min: currCpuSpeed,
      max: currCpuSpeed,
      avg: currCpuSpeed,
      cores: []
    };
  }
  return result;
};
