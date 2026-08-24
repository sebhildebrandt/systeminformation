import { nextTick } from '../common';
import type { Camera } from '../common/types';
import { ps, psArray } from '../common/windows';

const matchId = (deviceId: string, key: string): string => {
  const match = deviceId.match(new RegExp(`${key}_([0-9A-Fa-f]{4})`));
  return match ? match[1].toLowerCase() : '';
};

const parseSerial = (deviceId: string): string => {
  const last = deviceId.split('\\').pop() || '';
  return last.includes('&') ? '' : last;
};

const parseConnection = (deviceId: string): string => {
  const id = deviceId.toUpperCase();
  if (id.includes('BTHENUM') || id.startsWith('BTH')) {
    return 'bluetooth';
  }
  if (id.startsWith('USB')) {
    return 'usb';
  }
  if (id.startsWith('PCI')) {
    return 'pci';
  }
  return '';
};

const parseCamera = (devices: any[]): Camera[] =>
  devices.map((data: any) => {
    const deviceId = data.DeviceID || '';
    return {
      name: (data.Name || '').trim(),
      vendor: (data.Manufacturer || '').trim() || matchId(deviceId, 'VID'),
      model: matchId(deviceId, 'PID'),
      serial: parseSerial(deviceId),
      connection: parseConnection(deviceId)
    };
  });

export const camera = async (): Promise<Camera[]> => {
  await nextTick();
  try {
    const result = await ps.exec(
      "@(Get-CimInstance Win32_PnPEntity | Where-Object { $_.PNPClass -eq 'Camera' -or $_.PNPClass -eq 'Image' } | Select-Object Name,Manufacturer,DeviceID) | ConvertTo-Json -Depth 3"
    );
    return parseCamera(psArray(result));
  } catch {
    return [];
  }
};
