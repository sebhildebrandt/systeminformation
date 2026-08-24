import { cloneObj, nextTick } from '../common';
import { exec } from '../common/exec';
import { NpuData } from '../common/types';
import { initNpuData } from '../common/defaults';

// on Apple Silicon the Neural Engine registers as the IODeviceTree node "ane0"
export const npu = async (): Promise<NpuData[]> => {
  await nextTick();
  try {
    const { stdout } = await exec('ioreg -rn ane0');
    if (!stdout.includes('"name" = <"ane0">')) {
      return [];
    }
    let model = '';
    try {
      model = (await exec('sysctl -n machdep.cpu.brand_string')).stdout.trim();
    } catch {}
    // core count exposed via the ANE interface node's DeviceProperties
    let cores: number | null = null;
    try {
      const match = (await exec('ioreg -rc H11ANEIn')).stdout.match(/ANEDevicePropertyNumANECores"?=(\d+)/);
      if (match) {
        cores = parseInt(match[1], 10);
      }
    } catch {}
    return [
      {
        ...cloneObj(initNpuData),
        vendor: 'Apple',
        name: 'Apple Neural Engine',
        model,
        cores
      }
    ];
  } catch {
    return [];
  }
};
