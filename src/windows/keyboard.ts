import { nextTick } from '../common';
import type { Keyboard } from '../common/types';
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
  // {00001124-...} is the Bluetooth HID service class UUID
  if (id.includes('BTHENUM') || id.startsWith('BTH') || id.includes('{00001124')) {
    return 'bluetooth';
  }
  if (id.startsWith('USB') || (id.startsWith('HID') && id.includes('VID_'))) {
    return 'usb';
  }
  if (id.startsWith('ACPI') || id.startsWith('PS2')) {
    return 'internal';
  }
  return '';
};

const parseKeyboard = (devices: any[]): Keyboard[] =>
  devices.map((data: any) => {
    const deviceId = data.PNPDeviceID || data.DeviceID || '';
    return {
      name: (data.Name || data.Description || '').trim(),
      vendor: matchId(deviceId, 'VID'),
      model: matchId(deviceId, 'PID'),
      serial: parseSerial(deviceId),
      connection: parseConnection(deviceId)
    };
  });

export const keyboard = async (): Promise<Keyboard[]> => {
  await nextTick();
  try {
    const result = await ps.exec('@(Get-CimInstance Win32_Keyboard | Select-Object Name,Description,DeviceID,PNPDeviceID) | ConvertTo-Json -Depth 3');
    return parseKeyboard(psArray(result));
  } catch {
    return [];
  }
};
