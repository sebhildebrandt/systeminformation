import { readdir, readFile } from 'node:fs/promises';
import { nextTick, toInt } from '../common';
import { Thunderbolt } from '../common/types';

const TB_PATH = '/sys/bus/thunderbolt/devices';

const readAttr = async (dir: string, name: string): Promise<string> => {
  try {
    return (await readFile(`${dir}/${name}`)).toString().trim();
  } catch {
    return '';
  }
};

// sysfs only exposes the Thunderbolt generation, not the link rate — map to the nominal Gb/s
const generationToSpeed = (generation: number): number => {
  switch (generation) {
    case 1:
      return 10;
    case 2:
      return 20;
    case 3:
    case 4:
      return 40;
    default:
      return 0;
  }
};

export const thunderbolt = async (): Promise<Thunderbolt[]> => {
  await nextTick();
  const result: Thunderbolt[] = [];
  try {
    // routers are named "<domain>-<route>"; skip domains ("domainN") and retimers ("...:port.n")
    const entries = (await readdir(TB_PATH)).filter((entry) => /^\d+-\d+$/.test(entry)).sort();
    for (const entry of entries) {
      const dir = `${TB_PATH}/${entry}`;
      const [domain, route] = entry.split('-');
      const deviceName = await readAttr(dir, 'device_name');
      const vendorName = await readAttr(dir, 'vendor_name');
      const generation = toInt(await readAttr(dir, 'generation'));
      result.push({
        name: deviceName || vendorName || entry,
        uuid: await readAttr(dir, 'unique_id'),
        bus: toInt(domain),
        type: route === '0' ? 'host' : 'device',
        speed: generationToSpeed(generation)
      });
    }
  } catch {}
  return result;
};
