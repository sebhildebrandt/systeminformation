import { plistParser } from '../common/darwin';
import { nextTick, toInt } from '../common';
import { exec } from '../common/exec';
import { Thunderbolt } from '../common/types';

const niceThunderboltName = (name: string): string => {
  name = name.replace('thunderbolt', 'Thunderbolt ');
  name = name.replace('usb4', 'USB4 ');
  name = name.replace('_bus_', 'Bus ');
  return name;
};

const parseThunderboltDevices = (data: any): Thunderbolt[] => {
  const result: Thunderbolt[] = [];
  data.forEach((element: any) => {
    console.log(element);
  });
  return result;
};
const parseThunderbolt = (data: any): Thunderbolt[] => {
  let result: Thunderbolt[] = [];
  // Thunderbolt BUS
  data.forEach((element: any) => {
    if (element._name) {
      const nameParts = element._name.split('_bus_');
      const bus = nameParts?.length >= 2 ? toInt(nameParts[1]) : null;
      const speedString = (element.receptacle_1_tag?.current_speed_key || '').toLowerCase().split('gb/s')[0];
      const speed = toInt(speedString.replace(/\D/g, ''));
      result.push({
        name: niceThunderboltName(element._name || ''),
        uuid: element.domain_uuid_key || element.switch_uid_key || '',
        bus,
        type: 'hub',
        speed
      });
      if (element._items) {
        result = result.concat(parseThunderboltDevices(element._items));
      }
    }
  });

  return result;
};

export const thunderbolt = async (): Promise<any> => {
  await nextTick();

  try {
    const { stdout } = await exec('system_profiler SPThunderboltDataType -xml');
    const outObj = plistParser(stdout);
    return parseThunderbolt(outObj);
  } catch {
    return [];
  }
};
