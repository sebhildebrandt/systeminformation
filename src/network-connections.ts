import { LINUX, WINDOWS, DARWIN, FREEBSD, NETBSD, OPENBSD, ANDROID } from './common/const';
import type { NetworkConnectionData } from './common/types';

export const networkConnections = async (): Promise<NetworkConnectionData[]> => {
  switch (true) {
    case LINUX || FREEBSD || NETBSD || OPENBSD || ANDROID:
      return (await import('./linux/network-connections.js')).networkConnections();
    case DARWIN:
      return (await import('./darwin/network-connections.js')).networkConnections();
    case WINDOWS:
      return (await import('./windows/network-connections.js')).networkConnections();
    default:
      return [];
  }
};
