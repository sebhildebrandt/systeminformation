import { readdir, readFile, readlink, realpath } from 'node:fs/promises';
import { cloneObj, nextTick } from '../common';
import { NpuData } from '../common/types';
import { initNpuData } from '../common/defaults';

// modern AI accelerators (Intel VPU, AMD XDNA) expose themselves via the kernel "accel" subsystem
const ACCEL_PATH = '/sys/class/accel';

const readAttr = async (path: string): Promise<string> => {
  try {
    return (await readFile(path)).toString().trim();
  } catch {
    return '';
  }
};

const vendorName = (vendorId: string): string => {
  switch (vendorId) {
    case '8086':
      return 'Intel';
    case '1022':
    case '1002':
      return 'AMD';
    case '10de':
      return 'NVIDIA';
    default:
      return '';
  }
};

const driverLabel = (driver: string): string => {
  switch (driver) {
    case 'ivpu':
      return 'Intel AI Boost NPU';
    case 'amdxdna':
      return 'AMD XDNA NPU';
    default:
      return 'NPU';
  }
};

export const npu = async (): Promise<NpuData[]> => {
  await nextTick();
  const result: NpuData[] = [];
  const seen = new Set<string>();
  try {
    const nodes = (await readdir(ACCEL_PATH)).filter((node) => node.startsWith('accel')).sort();
    for (const node of nodes) {
      let dev: string;
      try {
        dev = await realpath(`${ACCEL_PATH}/${node}/device`);
      } catch {
        continue;
      }
      if (seen.has(dev)) {
        continue;
      }
      seen.add(dev);
      const vendorId = (await readAttr(`${dev}/vendor`)).replace(/^0x/i, '').toLowerCase();
      const deviceId = (await readAttr(`${dev}/device`)).replace(/^0x/i, '').toLowerCase();
      let driver = '';
      try {
        driver = (await readlink(`${dev}/driver`)).split('/').pop() || '';
      } catch {}
      result.push({
        ...cloneObj(initNpuData),
        vendor: vendorName(vendorId),
        name: driverLabel(driver),
        vendorId,
        deviceId,
        driver
      });
    }
  } catch {}
  return result;
};
