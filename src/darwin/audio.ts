import { nextTick } from '../common';
import { exec } from '../common/exec';
import { audioDarwinChannelLabel, audioTypeLabel } from '../common/mappings';
import type { AudioData, DarwinAudioData } from '../common/types';
import { plistParser } from './../common/darwin';

const parseAudioObject = (audioObject: DarwinAudioData, id: string): AudioData => {
  const name = audioObject._name;
  const channelStr = ((audioObject.coreaudio_device_transport || '') + ' ' + (audioObject._name || '')).toLowerCase();
  return {
    id,
    name,
    manufacturer: audioObject.coreaudio_device_manufacturer,
    revision: null,
    driver: null,
    default: Boolean(audioObject.coreaudio_default_audio_input_device || false) || Boolean(audioObject.coreaudio_default_audio_output_device || false),
    channel: audioDarwinChannelLabel(channelStr),
    type: audioTypeLabel(name, Boolean(audioObject.coreaudio_device_input || ''), Boolean(audioObject.coreaudio_device_output || '')),
    in: Boolean(audioObject.coreaudio_device_input || ''),
    out: Boolean(audioObject.coreaudio_device_output || ''),
    status: 'online'
  };
};

const parseAudio = (data: string) => {
  const result: AudioData[] = [];
  const outObj = plistParser(data.toString());
  if (outObj?.length && outObj[0] && outObj[0]._items && outObj[0]._items.length) {
    for (let i = 0; i < outObj[0]._items.length; i++) {
      const audio = parseAudioObject(outObj[0]._items[i], String(i));
      result.push(audio);
    }
  }
  return result;
};

export const audio = async (): Promise<AudioData[]> => {
  try {
    await nextTick();
    const { stdout } = await exec('system_profiler SPAudioDataType -xml');
    return parseAudio(stdout);
  } catch {
    return [];
  }
};
