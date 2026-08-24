import { readdir, readFile, realpath } from 'node:fs/promises';
import { nextTick } from '../common';
import { Camera } from '../common/types';

const V4L_PATH = '/sys/class/video4linux';

const readAttr = async (path: string): Promise<string> => {
  try {
    return (await readFile(path)).toString().trim();
  } catch {
    return '';
  }
};

export const camera = async (): Promise<Camera[]> => {
  await nextTick();
  const result: Camera[] = [];
  const seen = new Set<string>();
  try {
    const nodes = (await readdir(V4L_PATH)).filter((node) => node.startsWith('video')).sort();
    for (const node of nodes) {
      const base = `${V4L_PATH}/${node}`;
      const name = await readAttr(`${base}/name`);
      let iface: string;
      try {
        iface = await realpath(`${base}/device`);
      } catch {
        continue;
      }
      // USB video class (0x0e) marks a real camera; the name check catches non-USB cams
      const interfaceClass = await readAttr(`${iface}/bInterfaceClass`);
      if (interfaceClass !== '0e' && !/camera|webcam/i.test(name)) {
        continue;
      }
      // a camera exposes several video nodes (capture, metadata) on the same interface
      if (seen.has(iface)) {
        continue;
      }
      seen.add(iface);
      // USB device attributes live above the interface dir (which ascends to the one holding idVendor)
      let dev = iface;
      for (let i = 0; i < 6; i++) {
        if (await readAttr(`${dev}/idVendor`)) {
          break;
        }
        const parent = dev.substring(0, dev.lastIndexOf('/'));
        if (!parent || parent === dev) {
          break;
        }
        dev = parent;
      }
      const idVendor = await readAttr(`${dev}/idVendor`);
      result.push({
        name,
        vendor: (await readAttr(`${dev}/manufacturer`)) || idVendor || '',
        model: (await readAttr(`${dev}/product`)) || (await readAttr(`${dev}/idProduct`)) || '',
        serial: await readAttr(`${dev}/serial`),
        connection: idVendor ? 'usb' : iface.includes('/pci') ? 'pci' : ''
      });
    }
  } catch {}
  return result;
};
