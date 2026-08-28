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

// ARM boards (e.g. Raspberry Pi) have no PCI bus at all - ALSA lists the sound cards instead (#545)
const parseAudioAlsa = (stdout: string): AudioData[] => {
  const result: AudioData[] = [];
  const [cards, pcms] = `${stdout}`.split('--pcm--');
  const lines = (cards || '').split('\n');
  lines.forEach((line, i) => {
    // ' 1 [Device         ]: USB-Audio - USB Audio Device'
    const card = line.match(/^\s*(\d+)\s+\[(.+?)\s*\]:\s*(\S+)\s+-\s+(.*)$/);
    if (card) {
      const index = card[1];
      const driver = card[3];
      const name = card[4].trim();
      // second line holds the long name, which is prefixed with the manufacturer on USB devices
      const longName = (lines[i + 1] || '').trim();
      const manufacturer = longName.indexOf(name) > 0 ? longName.substring(0, longName.indexOf(name)).trim() : '';
      const devices = (pcms || '').split('\n').filter((pcm) => pcm.indexOf(`/card${index}/pcm`) >= 0);
      const out = devices.some((pcm) => pcm.trim().endsWith('p'));
      const isIn = devices.some((pcm) => pcm.trim().endsWith('c'));
      const usb = `${driver} ${longName}`.toLowerCase().indexOf('usb') >= 0;
      const hdmi = `${card[2]} ${name}`.toLowerCase().indexOf('hdmi') >= 0;
      result.push({
        id: `hw:${index}`,
        name,
        manufacturer,
        revision: null,
        driver,
        default: null,
        channel: usb ? 'USB' : hdmi ? 'HDMI' : 'Onboard',
        type: audioTypeLabel(name, isIn, out),
        in: devices.length ? isIn : null,
        out: devices.length ? out : null,
        status: 'online'
      });
    }
  });
  return result;
};

const getAudioAlsa = async (): Promise<AudioData[]> => {
  try {
    const { stdout } = await exec('cat /proc/asound/cards 2>/dev/null; echo "--pcm--"; ls -d /proc/asound/card*/pcm* 2>/dev/null', execOptsLinux);
    return parseAudioAlsa(stdout.toString());
  } catch {
    return [];
  }
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
  if (!result.length) {
    return await getAudioAlsa();
  }
  return result;
};
