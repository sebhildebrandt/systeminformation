import { ANDROID, DARWIN, LINUX, WINDOWS } from './common/const';

export const wifiInterfaces = async () => {
  switch (true) {
    case LINUX || ANDROID:
      return (await import('./linux/wifi-interfaces.js')).wifiInterfaces();
    case DARWIN:
      return (await import('./darwin/wifi-interfaces.js')).wifiInterfaces();
    case WINDOWS:
      return (await import('./windows/wifi-interfaces.js')).wifiInterfaces();
    default:
      return null;
  }
};
