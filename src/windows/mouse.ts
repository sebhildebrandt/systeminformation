import { nextTick } from '../common';
import type { Mouse } from '../common/types';
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

// Win32_PointingDevice.PointingType
const parseType = (pointingType: number, name: string): string => {
  if (pointingType === 7 || /touchpad|trackpad/i.test(name)) {
    return 'Trackpad';
  }
  if (pointingType === 4) {
    return 'Track Ball';
  }
  if (pointingType === 5) {
    return 'Track Point';
  }
  if (pointingType === 8) {
    return 'Touch Screen';
  }
  return 'Mouse';
};

const parseMouse = (devices: any[]): Mouse[] =>
  devices.map((data: any) => {
    const deviceId = data.PNPDeviceID || data.DeviceID || '';
    const name = (data.Name || data.Description || '').trim();
    return {
      name,
      type: parseType(parseInt(data.PointingType, 10) || 0, name),
      vendor: (data.Manufacturer || '').trim() || matchId(deviceId, 'VID'),
      model: matchId(deviceId, 'PID'),
      serial: parseSerial(deviceId),
      connection: parseConnection(deviceId)
    };
  });

export const mouse = async (): Promise<Mouse[]> => {
  await nextTick();
  try {
    const result = await ps.exec('@(Get-CimInstance Win32_PointingDevice | Select-Object Name,Description,Manufacturer,DeviceID,PNPDeviceID,PointingType) | ConvertTo-Json -Depth 3');
    return parseMouse(psArray(result));
  } catch {
    return [];
  }
};
