import { ANDROID, DARWIN, LINUX, WINDOWS } from './common/const';

export const wifiNetworks = async () => {
  switch (true) {
    case LINUX || ANDROID:
      return (await import('./linux/wifi-networks.js')).wifiNetworks();
    case DARWIN:
      return (await import('./darwin/wifi-networks.js')).wifiNetworks();
    case WINDOWS:
      return (await import('./windows/wifi-networks.js')).wifiNetworks();
    default:
      return null;
  }
};
