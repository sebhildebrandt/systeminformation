import { ANDROID, DARWIN, LINUX, WINDOWS } from './common/const';

export const bluetoothDevices = async () => {
  switch (true) {
    case LINUX || ANDROID:
      return (await import('./linux/bluetooth.js')).bluetoothDevices();
    case DARWIN:
      return (await import('./darwin/bluetooth.js')).bluetoothDevices();
    case WINDOWS:
      return (await import('./windows/bluetooth.js')).bluetoothDevices();
    default:
      return null;
  }
};
