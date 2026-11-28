import { ANDROID, DARWIN, LINUX, WINDOWS } from './common/const';
import type { BluetoothDeviceData } from './common/types';

export const bluetoothDevices = async (): Promise<BluetoothDeviceData[]> => {
  switch (true) {
    case LINUX || ANDROID:
      return (await import('./linux/bluetooth-devices.js')).bluetoothDevices();
    case DARWIN:
      return (await import('./darwin/bluetooth-devices.js')).bluetoothDevices();
    case WINDOWS:
      return (await import('./windows/bluetooth-devices.js')).bluetoothDevices();
    default:
      return [];
  }
};
