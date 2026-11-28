import { joinList } from './common';
import { LINUX, WINDOWS, DARWIN, FREEBSD, NETBSD, OPENBSD, ANDROID } from './common/const';
import type { NetworkStatsData } from './common/types';

export const networkStats = async (interfaces: string | string[] = ''): Promise<NetworkStatsData[]> => {
  const names = joinList(interfaces);
  switch (true) {
    case LINUX || ANDROID:
      return (await import('./linux/network-stats.js')).networkStats(names);
    case FREEBSD || NETBSD || OPENBSD:
      return (await import('./bsd/network-stats.js')).networkStats(names);
    case DARWIN:
      return (await import('./darwin/network-stats.js')).networkStats(names);
    case WINDOWS:
      return (await import('./windows/network-stats.js')).networkStats(names);
    default:
      return [];
  }
};
