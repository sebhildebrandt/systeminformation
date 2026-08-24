import { nextTick } from '../common';
import { bluetoothTypeLabel } from '../common/mappings';
import type { BluetoothObject } from '../common/types';
import { ps, psArray } from '../common/windows';

const parseBluetoothDevices = (device: any): BluetoothObject => {
  const name = device.Name || '';

  return {
    device: null,
    name,
    manufacturer: device.Manufacturer || null,
    macDevice: null,
    macHost: null,
    batteryPercent: null,
    type: bluetoothTypeLabel(name.toLowerCase()),
    connected: null
  };
};

export const bluetoothDevices = async () => {
  await nextTick();
  const result: BluetoothObject[] = [];
  const pnpDevices = psArray(
    await ps.exec('Get-CimInstance Win32_PNPEntity | select PNPClass, Name, Manufacturer, Status, Service, ConfigManagerErrorCode, Present | ConvertTo-Json -Depth 5 -Compress')
  );
  pnpDevices.forEach((device: any) => {
    if ((device.PNPClass || '').toLowerCase() === 'bluetooth' && Number(device.ConfigManagerErrorCode) === 0 && !device.Service) {
      result.push(parseBluetoothDevices(device));
    }
  });
  return result;
};
