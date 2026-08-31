import { nextTick } from '../common';
import type { FanData } from '../common/types';

export const fans = async (): Promise<FanData[]> => {
  await nextTick();
  const result: FanData[] = [];
  try {
    // optional macos-temperature-sensor dependency - reads the SMC fan keys (FNum, F0Ac)
    const macosTemp = require('macos-temperature-sensor');
    if (typeof macosTemp.fans === 'function') {
      const res = macosTemp.fans();
      if (Array.isArray(res)) {
        res.forEach((fan: any, index: number) => {
          result.push({
            id: `fan${index}`,
            label: fan?.label || null,
            rpm: typeof fan?.rpm === 'number' ? Math.round(fan.rpm) : null,
            pwm: typeof fan?.pwm === 'number' ? Math.round(fan.pwm) : null,
            source: 'SMC'
          });
        });
      }
    }
  } catch {}
  return result;
};
