import { LINUX, WINDOWS, DARWIN, FREEBSD, NETBSD, OPENBSD, ANDROID } from './common/const';

export const networkStats = async (ifaces: string) => {
  switch (true) {
    case LINUX || ANDROID:
      return (await import('./linux/network-stats.js')).networkStats(ifaces);
    case FREEBSD || NETBSD || OPENBSD:
      return (await import('./bsd/network-stats.js')).networkStats(ifaces);
    case DARWIN:
      return (await import('./darwin/network-stats.js')).networkStats(ifaces);
    case WINDOWS:
      return (await import('./windows/network-stats.js')).networkStats(ifaces);
    default:
      return null;
  }
};
