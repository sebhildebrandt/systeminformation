import { LINUX, WINDOWS, DARWIN, FREEBSD, NETBSD, OPENBSD, ANDROID } from './common/const';

export const networkConnections = async () => {
  switch (true) {
    case LINUX || FREEBSD || NETBSD || OPENBSD || ANDROID:
      return (await import('./linux/network-connections.js')).networkConnections();
    case DARWIN:
      return (await import('./darwin/network-connections.js')).networkConnections();
    case WINDOWS:
      return (await import('./windows/network-connections.js')).networkConnections();
    default:
      return null;
  }
};
