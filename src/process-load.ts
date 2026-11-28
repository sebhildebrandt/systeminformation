import { joinList } from './common';
import { LINUX, WINDOWS, DARWIN, FREEBSD, NETBSD, SUNOS, ANDROID, OPENBSD } from './common/const';
import type { ProcessLoadData } from './common/types';

export const processLoad = async (processNames: string | string[] = ''): Promise<ProcessLoadData[]> => {
  const names = joinList(processNames);
  switch (true) {
    case LINUX || FREEBSD || NETBSD || OPENBSD || DARWIN || SUNOS || ANDROID:
      return (await import('./linux/process-load.js')).processLoad(names);
    case WINDOWS:
      return (await import('./windows/process-load.js')).processLoad(names);
    default:
      return [];
  }
};
