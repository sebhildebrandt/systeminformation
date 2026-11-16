import type { CpuCurrentSpeedObject } from '../common/types';

const round2 = (value: number) => Math.round(value * 100) / 100;

// Apple Silicon reports a fixed speed in os.cpus() - the real frequency comes from the optional
// macos-smc dependency (IOReport residency since the previous call). Cores are in cluster order,
// which is not guaranteed to match the os.cpus() index.
export const appleSiliconSpeed = async (): Promise<CpuCurrentSpeedObject | null> => {
  try {
    const smc = require('macos-smc');
    if (typeof smc.frequencies !== 'function') {
      return null;
    }
    const res = await smc.frequencies();
    // an idle core has no active residency - it sits in its lowest DVFS state
    const cores: number[] = (res?.cpu?.cores || [])
      .map((core: any) => (typeof core?.mhz === 'number' ? core.mhz : core?.minMhz))
      .filter((mhz: unknown): mhz is number => typeof mhz === 'number' && mhz > 0)
      .map((mhz: number) => round2(mhz / 1000));
    if (!cores.length) {
      return null;
    }
    return {
      min: Math.min(...cores),
      max: Math.max(...cores),
      avg: round2(cores.reduce((sum, speed) => sum + speed, 0) / cores.length),
      cores
    };
  } catch {
    return null;
  }
};
