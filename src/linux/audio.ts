import { EOL } from 'node:os';
import { getValue, nextTick } from '../common';
import { execOptsLinux } from '../common/const';
import { exec } from '../common/exec';
import { audioTypeLabel } from '../common/mappings';
import type { AudioData, AudioPCI } from '../common/types';

const getAudioPci = async () => {
  const result: any = [];
  try {
    const { stdout } = await exec('lspci -v 2>/dev/null', execOptsLinux);
    const parts = stdout.split(`${EOL}${EOL}`);
    parts.forEach((part) => {
      const lines = part.split(EOL);
      if (lines?.length && lines[0].toLowerCase().indexOf('audio') >= 0) {
        result.push({
          slotId: lines[0].split(' ')[0],
          driver: getValue(lines, 'Kernel driver in use', ':', true) || getValue(lines, 'Kernel modules', ':', true)
        });
      }
    });
    return result;
  } catch (e) {
    return result;
  }
};

const parseAudioPci = (lines: string[], audioPCI: AudioPCI[]): AudioData => {
  const slotId = getValue(lines, 'Slot');
  const pciMatch = audioPCI.filter((item) => {
    return item.slotId === slotId;
  });
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
    status: 'online'
  };
};

export const audio = async (): Promise<AudioData[]> => {
  await nextTick();
  const result: AudioData[] = [];
  try {
    const { stdout } = await exec('lspci -vmm 2>/dev/null', execOptsLinux);
    const audioPCI = await getAudioPci();
    const parts = stdout.toString().split(`${EOL}${EOL}`);
    parts.forEach((part) => {
      const lines = part.split('\n');
      if (getValue(lines, 'class', ':', true).toLowerCase().indexOf('audio') >= 0) {
        const audio = parseAudioPci(lines, audioPCI);
        result.push(audio);
      }
    });
  } catch {}
  return result;
};
