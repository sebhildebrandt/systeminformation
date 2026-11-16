import { nextTick } from '../common';
import type { FanData } from '../common/types';

export const fans = async (): Promise<FanData[]> => {
  await nextTick();
  const result: FanData[] = [];
  try {
    // optional macos-smc dependency - reads the SMC fan keys (FNum, F0Ac, F0Mn, F0Mx)
    const smc = require('macos-smc');
    const res = smc.fans();
    if (Array.isArray(res)) {
      res.forEach((fan: any, index: number) => {
        result.push({
          id: `fan${typeof fan?.id === 'number' ? fan.id : index}`,
          label: null,
          rpm: typeof fan?.rpm === 'number' ? Math.round(fan.rpm) : null,
          // rpm position within the fan's min..max range - the SMC exposes no pwm
          pwm: typeof fan?.percent === 'number' ? Math.round(fan.percent) : null,
          source: 'SMC'
        });
      });
    }
  } catch {}
  return result;
};
