import { nextTick } from '../../common';
import { powerShell } from '../../common/exec';
import { audioTypeLabel } from '../../common/mappings';

interface WindowsAudio {
  DeviceID: string;
  Name: string;
  Manufacturer: string;
  Status: string;
}

export const windowsAudio = async () => {
  const devices = await powerShell('Get-WmiObject Win32_SoundDevice | ConvertTo-Json -Depth 5').then(stdout => JSON.parse(stdout) as WindowsAudio[]);
  return devices.map(data => ({
    id: data.DeviceID,
    name: data.Name,
    manufacturer: data.Manufacturer.trim(),
    type: audioTypeLabel(data.Name),
    status: data.Status
  }));
};

export const audio = async () => {
  await nextTick();
  return windowsAudio();
};
