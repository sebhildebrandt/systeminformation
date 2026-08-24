import { readFile } from 'node:fs/promises';
import { nextTick } from '../common';
import { Keyboard } from '../common/types';

const parseKeyboard = (stdout: string): Keyboard[] => {
  const result: Keyboard[] = [];
  const blocks = stdout.split(/\n\s*\n/);
  blocks.forEach((block) => {
    let bus = '';
    let vendor = '';
    let product = '';
    let name = '';
    let serial = '';
    let handlers = '';
    let ev = '';
    block.split('\n').forEach((line) => {
      if (line.startsWith('I:')) {
        bus = (line.match(/Bus=([0-9a-fA-F]+)/) || [])[1] || '';
        vendor = (line.match(/Vendor=([0-9a-fA-F]+)/) || [])[1] || '';
        product = (line.match(/Product=([0-9a-fA-F]+)/) || [])[1] || '';
      } else if (line.startsWith('N:')) {
        name = (line.match(/Name="(.*)"/) || [])[1] || '';
      } else if (line.startsWith('U:')) {
        serial = (line.split('=')[1] || '').trim();
      } else if (line.startsWith('H:')) {
        handlers = line;
      } else if (line.startsWith('B: EV=')) {
        ev = (line.split('=')[1] || '').trim();
      }
    });
    // real keyboards expose the `kbd` handler and support key auto-repeat (EV_REP, bit 20);
    // this excludes power/sleep buttons which also register a `kbd` handler
    const evMask = parseInt(ev, 16) || 0;
    const isKeyboard = handlers.split(/[=\s]+/).includes('kbd') && (evMask & 0x100000) !== 0;
    if (isKeyboard) {
      const connection = bus === '0003' ? 'usb' : bus === '0005' ? 'bluetooth' : bus === '0011' || bus === '0019' ? 'internal' : '';
      result.push({
        name,
        vendor,
        model: product,
        serial,
        connection
      });
    }
  });
  return result;
};

export const keyboard = async (): Promise<Keyboard[]> => {
  await nextTick();
  try {
    const stdout = (await readFile('/proc/bus/input/devices')).toString();
    return parseKeyboard(stdout);
  } catch {
    return [];
  }
};
