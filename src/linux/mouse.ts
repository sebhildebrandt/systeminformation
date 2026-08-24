import { readFile } from 'node:fs/promises';
import { nextTick } from '../common';
import { Mouse } from '../common/types';

const parseMouse = (stdout: string): Mouse[] => {
  const result: Mouse[] = [];
  const blocks = stdout.split(/\n\s*\n/);
  blocks.forEach((block) => {
    let bus = '';
    let vendor = '';
    let product = '';
    let name = '';
    let serial = '';
    let handlers = '';
    let prop = '';
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
      } else if (line.startsWith('B: PROP=')) {
        prop = (line.split('=')[1] || '').trim();
      } else if (line.startsWith('B: EV=')) {
        ev = (line.split('=')[1] || '').trim();
      }
    });
    const propMask = parseInt(prop, 16) || 0;
    const evMask = parseInt(ev, 16) || 0;
    // pointing device if it exposes a legacy `mouseN` handler (classic mice / PS-2 touchpads)
    // or the kernel flags it INPUT_PROP_POINTER (modern I2C / libinput touchpads have no mouseN)
    const hasMouseHandler = handlers.split(/[=\s]+/).some((token) => /^mouse\d+$/.test(token));
    const isPointer = (propMask & 0x1) !== 0; // INPUT_PROP_POINTER
    if (hasMouseHandler || isPointer) {
      const lower = name.toLowerCase();
      const isButtonpad = (propMask & 0x4) !== 0; // INPUT_PROP_BUTTONPAD
      const hasAbs = (evMask & 0x8) !== 0; // EV_ABS (touchpads report absolute coords)
      const hasRel = (evMask & 0x4) !== 0; // EV_REL (mice report relative motion)
      const isTrackpad = lower.includes('touchpad') || lower.includes('trackpad') || isButtonpad || (hasAbs && !hasRel);
      const connection =
        bus === '0003' ? 'usb' : bus === '0005' ? 'bluetooth' : bus === '0011' || bus === '0018' || bus === '0019' ? 'internal' : '';
      result.push({
        name,
        type: isTrackpad ? 'Trackpad' : 'Mouse',
        vendor,
        model: product,
        serial,
        connection
      });
    }
  });
  return result;
};

export const mouse = async (): Promise<Mouse[]> => {
  await nextTick();
  try {
    const stdout = (await readFile('/proc/bus/input/devices')).toString();
    return parseMouse(stdout);
  } catch {
    return [];
  }
};
