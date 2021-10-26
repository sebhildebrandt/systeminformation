'use strict';

import * as os from 'os';
import { execCmd } from '../common/exec';
import { getValue, nextTick } from '../common';
import { AudioObject, AudioPCI } from '../common/types';
import { audioTypeLabel } from '../common/mappings';

const getAudioPci = async () => {
  const result = [];
  try {
    const parts = await execCmd('lspci -v 2>/dev/null').toString().split(`${os.EOL}${os.EOL}`);
    for (let i = 0; i < parts.length; i++) {
      const lines = parts[i].split(os.EOL);
      if (lines && lines.length && lines[0].toLowerCase().indexOf('audio') >= 0) {
        const audio = {};
        result.push({
          slotId: lines[0].split(' ')[0],
          driver: getValue(lines, 'Kernel driver in use', ':', true) || getValue(lines, 'Kernel modules', ':', true)
        });
      }
    }
    return result;
  } catch (e) {
    return result;
  }
};

const parseAudioPci = (lines: string[], audioPCI: AudioPCI[]): AudioObject => {
  const slotId = getValue(lines, 'Slot');
  const pciMatch = audioPCI.filter((item) => { return item.slotId === slotId; });
  const name = getValue(lines, 'SDevice');

  return {
    id: slotId,
    name,
    manufacturer: getValue(lines, 'SVendor'),
    revision: getValue(lines, 'Rev'),
    driver: pciMatch && pciMatch.length === 1 && pciMatch[0].driver ? pciMatch[0].driver : '',
    default: null,
    channel: 'PCIe',
    type: audioTypeLabel(name),
    in: null,
    out: null,
    status: 'online',

  };
};

export const nixAudio = async () => {
  const stdout = await execCmd('lspci -vmm 2>/dev/null');
  const audioPCI = await getAudioPci();
  const parts = stdout.toString().split(`${os.EOL}${os.EOL}`);
  const result = [];
  for (let i = 0; i < parts.length; i++) {
    const lines = parts[i].split('\n');
    if (getValue(lines, 'class', ':', true).toLowerCase().indexOf('audio') >= 0) {
      const audio = parseAudioPci(lines, audioPCI);
      result.push(audio);
    }
  }
  return result;
};

export const audio = async () => {
  await nextTick();
  return nixAudio();
};
