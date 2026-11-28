import { ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, OPENBSD, WINDOWS } from './common/const';
import type { NetworkInterfaceData } from './common/types';

export const networkInterfaces = async (filter = '', rescan = true): Promise<NetworkInterfaceData[] | null> => {
  // objects without string conversion would throw here
  filter = typeof filter === 'string' ? filter : '';
  switch (true) {
    case LINUX || ANDROID:
      return (await import('./linux/network-interfaces.js')).networkInterfaces(filter, rescan);
    case FREEBSD || NETBSD || OPENBSD || DARWIN:
      return (await import('./darwin/network-interfaces.js')).networkInterfaces(filter, rescan);
    case WINDOWS:
      return (await import('./windows/network-interfaces.js')).networkInterfaces(filter, rescan);
    default:
      return null;
  }
};
