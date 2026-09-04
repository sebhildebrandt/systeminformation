import { readdir, readlink, realpath } from 'fs/promises';
import { basename, dirname } from 'path';
import { cloneObj, nextTick } from '../common';
import { initSerialPortResult } from '../common/defaults';
import { fileExists, readSysfs } from '../common/files';
import type { SerialPortData, SerialPortType } from '../common/types';

const busType = (subsystem: string, name: string): SerialPortType => {
  switch (subsystem) {
    case 'usb':
    case 'usb-serial':
      return 'usb';
    case 'pnp':
    case 'amba':
    case 'platform':
    case 'of_serial':
      return 'onboard';
    case 'pci':
      return 'pci';
    case 'bluetooth':
      return 'bluetooth';
    default:
      return name.startsWith('rfcomm') ? 'bluetooth' : 'unknown';
  }
};

// ttyUSB* hangs two levels below the USB device, ttyACM* one - so walk up until
// the level carrying the USB descriptors is found instead of assuming a depth
const usbDevicePath = async (devicePath: string) => {
  let current = devicePath;
  for (let depth = 0; depth < 6; depth++) {
    if (await fileExists(`${current}/idVendor`)) {
      return current;
    }
    const parent = dirname(current);
    if (parent === current) {
      return '';
    }
    current = parent;
  }
  return '';
};

// /dev/serial/by-id only exists with udev running, but is the only stable identifier
const stableIds = async (path: string) => {
  const map: Record<string, string> = {};
  try {
    for (const entry of await readdir(path)) {
      try {
        map[basename(await readlink(`${path}/${entry}`))] = entry;
      } catch {}
    }
  } catch {}
  return map;
};

export const serialPorts = async (sysPath = '/sys/class/tty', byIdPath = '/dev/serial/by-id'): Promise<SerialPortData[]> => {
  await nextTick();
  const result: SerialPortData[] = [];
  let names: string[] = [];
  try {
    names = await readdir(sysPath);
  } catch {
    return result;
  }
  const byId = await stableIds(byIdPath);
  for (const name of names.sort()) {
    let devicePath = '';
    try {
      // only real ports have a device link - pty/console/virtual ttys do not
      devicePath = await realpath(`${sysPath}/${name}/device`);
    } catch {
      continue;
    }
    // serial8250 pre-registers ttyS0..ttyS31; PORT_UNKNOWN (0) means no port is there
    if ((await readSysfs(`${sysPath}/${name}/type`)) === '0') {
      continue;
    }
    let subsystem = '';
    try {
      subsystem = basename(await realpath(`${devicePath}/subsystem`));
    } catch {}
    const port: SerialPortData = {
      ...cloneObj(initSerialPortResult),
      device: `/dev/${name}`,
      name,
      type: busType(subsystem, name),
      pnpId: byId[name] || null
    };
    const usbPath = await usbDevicePath(devicePath);
    if (usbPath) {
      port.type = 'usb';
      port.vendorId = (await readSysfs(`${usbPath}/idVendor`)).toLowerCase() || null;
      port.productId = (await readSysfs(`${usbPath}/idProduct`)).toLowerCase() || null;
      port.manufacturer = (await readSysfs(`${usbPath}/manufacturer`)) || null;
      port.serialNumber = (await readSysfs(`${usbPath}/serial`)) || null;
      port.name = (await readSysfs(`${usbPath}/product`)) || name;
    }
    result.push(port);
  }
  return result;
};
