import { nextTick } from '../common';
import { execCmd } from '../common/exec';
import { audioDarwinChannelLabel, audioTypeLabel } from '../common/mappings';
import { AudioObject, DarwinAudioObject } from '../common/types';

const parseAudio = (audioObject: DarwinAudioObject, id: string): AudioObject => {
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
    status: 'online',
  };
};

export const darwinAudio = async () => {
  const result = [];
  try {
    const stdout = await execCmd('system_profiler SPAudioDataType -json');
    const outObj = JSON.parse(stdout.toString());
    if (outObj.SPAudioDataType && outObj.SPAudioDataType.length && outObj.SPAudioDataType[0] && outObj.SPAudioDataType[0]['_items'] && outObj.SPAudioDataType[0]['_items'].length) {
      for (let i = 0; i < outObj.SPAudioDataType[0]['_items'].length; i++) {
        const audio = parseAudio(outObj.SPAudioDataType[0]['_items'][i], String(i));
        result.push(audio);
      }
    }
  } catch { }
  return result;
};

export const audio = async () => {
  await nextTick();
  return darwinAudio();
};
