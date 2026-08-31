import { readdir } from 'fs/promises';
import { nextTick } from '../common';
import { readSysfs } from '../common/files';
import type { FanData } from '../common/types';

const toNumber = (value: string) => {
  const result = Number.parseFloat(value);
  return Number.isNaN(result) ? null : result;
};

// pwm is 0..255 in sysfs
const pwmToPercent = (value: string) => {
  const raw = toNumber(value);
  return raw === null ? null : Math.round((raw / 255) * 100);
};

// hwmon exposes one fan<N>_input (rpm) per tachometer, optionally fan<N>_label and pwm<N>
const hwmonFans = async (hwmonPath: string): Promise<FanData[]> => {
  const fans: FanData[] = [];
  let nodes: string[] = [];
  try {
    nodes = await readdir(hwmonPath);
  } catch {
    return fans;
  }
  for (const node of nodes) {
    const entries = [];
    try {
      entries.push(...(await readdir(`${hwmonPath}/${node}`)));
    } catch {
      continue;
    }
    const source = (await readSysfs(`${hwmonPath}/${node}/name`)) || node;
    for (const entry of entries) {
      const match = /^fan(\d+)_input$/.exec(entry);
      if (!match) {
        continue;
      }
      const index = match[1];
      const rpm = toNumber(await readSysfs(`${hwmonPath}/${node}/fan${index}_input`));
      if (rpm === null) {
        continue;
      }
      fans.push({
        id: `${node}/fan${index}`,
        label: (await readSysfs(`${hwmonPath}/${node}/fan${index}_label`)) || null,
        rpm,
        pwm: pwmToPercent(await readSysfs(`${hwmonPath}/${node}/pwm${index}`)),
        source
      });
    }
  }
  return fans;
};

// fans without a tachometer (e.g. pwm-fan on a Raspberry Pi 4) only show up as a
// thermal cooling device with a discrete state - no rpm, but a duty cycle
const coolingDeviceFans = async (thermalPath: string): Promise<FanData[]> => {
  const fans: FanData[] = [];
  let nodes: string[] = [];
  try {
    nodes = (await readdir(thermalPath)).filter((entry) => entry.startsWith('cooling_device'));
  } catch {
    return fans;
  }
  for (const node of nodes) {
    const type = await readSysfs(`${thermalPath}/${node}/type`);
    if (!type.toLowerCase().includes('fan')) {
      continue;
    }
    const current = toNumber(await readSysfs(`${thermalPath}/${node}/cur_state`));
    const max = toNumber(await readSysfs(`${thermalPath}/${node}/max_state`));
    if (current === null || !max) {
      continue;
    }
    fans.push({
      id: node,
      label: null,
      rpm: null,
      pwm: Math.round((current / max) * 100),
      source: type
    });
  }
  return fans;
};

export const fans = async (hwmonPath = '/sys/class/hwmon', thermalPath = '/sys/class/thermal'): Promise<FanData[]> => {
  await nextTick();
  const result = await hwmonFans(hwmonPath);
  if (!result.length) {
    return coolingDeviceFans(thermalPath);
  }
  return result;
};
