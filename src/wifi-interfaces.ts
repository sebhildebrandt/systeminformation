import { ANDROID, DARWIN, LINUX, WINDOWS } from './common/const';
import type { WifiInterfaceData } from './common/types';

export const wifiInterfaces = async (): Promise<WifiInterfaceData[]> => {
  switch (true) {
    case LINUX || ANDROID:
      return (await import('./linux/wifi-interfaces.js')).wifiInterfaces();
    case DARWIN:
      return (await import('./darwin/wifi-interfaces.js')).wifiInterfaces();
    case WINDOWS:
      return (await import('./windows/wifi-interfaces.js')).wifiInterfaces();
    default:
      return [];
  }
};
