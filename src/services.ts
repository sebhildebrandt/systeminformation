import { joinList } from './common';
import { ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, OPENBSD, WINDOWS } from './common/const';
import type { ServiceData } from './common/types';

export const services = async (serviceNames: string | string[] = ''): Promise<ServiceData[] | null> => {
  const names = joinList(serviceNames);
  switch (true) {
    case LINUX || FREEBSD || NETBSD || OPENBSD || DARWIN || ANDROID:
      return (await import('./linux/services.js')).services(names);
    case WINDOWS:
      return (await import('./windows/services.js')).services(names);
    default:
      return null;
  }
};
