import { ANDROID, DARWIN, LINUX, WINDOWS } from './common/const';

export const wifiConnections = async () => {
  switch (true) {
    case LINUX || ANDROID:
      return (await import('./linux/wifi-connections.js')).wifiConnections();
    case DARWIN:
      return (await import('./darwin/wifi-connections.js')).wifiConnections();
    case WINDOWS:
      return (await import('./windows/wifi-connections.js')).wifiConnections();
    default:
      return null;
  }
};
