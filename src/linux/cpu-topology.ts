import { toInt } from '../common';
import { readFileLines, readSysfs } from '../common/files';
import type { CpuTopologyData } from '../common/types';

// some ARM kernels report -1 for an unknown package; toInt() would map garbage to 0
const toId = (value: string) => (/^\d+$/.test(value.trim()) ? toInt(value) : null);

// os.cpus() follows the cpuN lines of /proc/stat - their names give the real cpu number, which
// differs from the index as soon as a cpu is offline
export const cpuTopology = async (): Promise<CpuTopologyData[]> => {
  const names = (await readFileLines('/proc/stat')).map((line) => line.split(' ')[0] || '').filter((name) => /^cpu\d+$/.test(name));
  return Promise.all(
    names.map(async (name) => {
      const dir = `/sys/devices/system/cpu/${name}/topology`;
      const [coreId, socketId] = await Promise.all([readSysfs(`${dir}/core_id`), readSysfs(`${dir}/physical_package_id`)]);
      return { coreId: toId(coreId), socketId: toId(socketId) };
    })
  );
};
