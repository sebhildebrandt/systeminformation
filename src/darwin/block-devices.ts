import { initFsBlockDevice } from '../common/defaults';
import { cloneObj } from '../common/index';
import { exec } from '../common/exec';
import { FsBlockDevicesData } from '../common/types';
import { getValue, nextTick, toInt } from '../common';
import { MAX_BUFFER_SIZE } from '../common/const';

const parseBytes = (s: string) => {
  const from = s.indexOf(' (') + 2;
  const to = s.indexOf(' Bytes)');
  return toInt(s.substring(from, to));
};

const getDevicesMac = (data: FsBlockDevicesData[]) => {
  const result: any = [];
  data.forEach((element) => {
    if (element.type.startsWith('disk')) {
      result.push({ name: element.name, model: element.model, device: element.name });
    }
    if (element.type.startsWith('virtual')) {
      let device = '';
      result.forEach((e: any) => {
        if (e.model === element.model) {
          device = e.device;
        }
      });
      if (device) {
        result.push({ name: element.name, model: element.model, device });
      }
    }
  });
  return result;
};

const matchDevicesMac = (data: FsBlockDevicesData[]): FsBlockDevicesData[] => {
  let result = data;
  try {
    const devices = getDevicesMac(data);
    result = result.map((blockdevice) => {
      if (blockdevice.type.startsWith('part') || blockdevice.type.startsWith('disk') || blockdevice.type.startsWith('virtual')) {
        devices.forEach((element: any) => {
          if (blockdevice.name.startsWith(element.name)) {
            blockdevice.device = element.device;
          }
        });
      }
      return blockdevice;
    });
  } catch {}
  return result;
};

const parseDarwinDevices = (stdout: string): FsBlockDevicesData[] => {
  const parts = stdout.toString().split('\n***');
  const defaults = cloneObj(initFsBlockDevice);
  const devices: FsBlockDevicesData[] = [];
  parts.forEach((part: string) => {
    const lines = part.split('\n');
    const label = getValue(lines, 'Volume Name', ':', true);
    let physical = getValue(lines, 'Media Read-Only', ':', true) === 'Yes' ? 'CD/ DVD' : defaults.physical;
    if (getValue(lines, 'Solid State', ':', true) === 'Yes') {
      physical = 'SSD';
    }
    let deviceType = getValue(lines, 'Virtual', ':', true) === 'Yes' ? 'virtual' : defaults.type;
    if (getValue(lines, 'Partition Type', ':', true)) {
      deviceType = 'part';
    }
    const identifier = getValue(lines, 'Device Identifier', ':', true);

    if (identifier) {
      devices.push({
        ...defaults,
        identifier,
        name: getValue(lines, 'Device Node', ':', true),
        label: label.indexOf('Not applicable') === -1 ? label : '',
        protocol: getValue(lines, 'Protocol', ':', true),
        size: parseBytes(getValue(lines, 'Disk Size', ':', true)),
        fsType: getValue(lines, 'File System Personality', ':', true),
        mount: getValue(lines, 'Mount Point', ':', true),
        uuid: getValue(lines, 'Volume UUID', ':', true),
        physical,
        type: deviceType,
        removable: getValue(lines, 'Removable Media', ':', true) === 'Yes',
        model: getValue(lines, 'Device / Media Name', ':', true),
        group: '',
        device: ''
      });
    }
  });

  return devices;
};

export const blockDevices = async (): Promise<FsBlockDevicesData[]> => {
  await nextTick();
  try {
    const { stdout } = await exec('diskutil info -all', { maxBuffer: MAX_BUFFER_SIZE });
    const data = parseDarwinDevices(stdout);
    return matchDevicesMac(data);
  } catch {
    return [];
  }
};
