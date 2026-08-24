import { cloneObj, nextTick } from '../common';
import { initAudioResult } from '../common/defaults';
import { audioTypeLabel, audioWindowsStatus } from '../common/mappings';
import type { AudioData } from '../common/types';
import { ps, psArray } from '../common/windows';

export const audio = async (): Promise<AudioData[]> => {
  await nextTick();
  const defaults = cloneObj(initAudioResult);
  const devices = psArray(await ps.exec('Get-CimInstance Win32_SoundDevice | Select-Object DeviceID,StatusInfo,Name,Manufacturer | ConvertTo-Json -Depth 5'));
  return devices
    .filter((data: any) => data?.Name)
    .map((data: any) => ({
      ...defaults,
      id: data.DeviceID || '',
      name: data.Name,
      manufacturer: (data.Manufacturer || '').trim(),
      type: audioTypeLabel(data.Name),
      status: audioWindowsStatus(data.StatusInfo)
    }));
};
