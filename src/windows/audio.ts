'use strict';

import * as os from 'os';
import { execCmd } from '../common/exec';
import { getValue, nextTick } from '../common';
import { audioTypeLabel } from '../common/mappings';
import { AudioObject } from '../common/types';


const parseAudio = (lines: string[]): AudioObject => {
  const status = getValue(lines, 'StatusInfo', ':');
  const name = getValue(lines, 'name', ':');

  return {
    id: getValue(lines, 'DeviceID', ':'),
    name: getValue(lines, 'name', ':'),
    manufacturer: getValue(lines, 'manufacturer', ':'),
    revision: null,
    driver: null,
    default: null,
    channel: null,
    type: audioTypeLabel(name),
    in: null,
    out: null,
    status: status,
  };
};

export const windowsAudio = async () => {
  const stdout = await execCmd('path Win32_SoundDevice get /value');
  const parts = stdout.toString().split(/\n\s*\n/);
  const result = [];
  for (let i = 0; i < parts.length; i++) {
    if (getValue(parts[i].split(os.EOL), 'name', '=')) {
      result.push(parseAudio(parts[i].split('\n')));
    }
  }
  return result;
};

export const audio = async () => {
  await nextTick();
  return windowsAudio();
};
