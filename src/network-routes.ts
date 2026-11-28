import { DARWIN, FREEBSD, LINUX, NETBSD, OPENBSD, WINDOWS } from './common/const';
import type { NetworkRouteData } from './common/types';

export const networkRoutes = async (): Promise<NetworkRouteData[] | null> => {
  switch (true) {
    case LINUX:
      return (await import('./linux/network-routes.js')).networkRoutes();
    case DARWIN || FREEBSD || NETBSD || OPENBSD:
      return (await import('./darwin/network-routes.js')).networkRoutes();
    case WINDOWS:
      return (await import('./windows/network-routes.js')).networkRoutes();
    default:
      return null;
  }
};
