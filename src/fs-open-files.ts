import { DARWIN, FREEBSD, LINUX, NETBSD, OPENBSD, WINDOWS } from './common/const';
import type { FsOpenFilesData } from './common/types';
export const fsOpenFiles = async (): Promise<FsOpenFilesData | null> => {
  switch (true) {
    case FREEBSD || NETBSD || OPENBSD || DARWIN:
      return (await import('./darwin/fs-open-files.js')).fsOpenFiles();
    case LINUX:
      return (await import('./linux/fs-open-files.js')).fsOpenFiles();
    case WINDOWS:
      return (await import('./windows/fs-open-files.js')).fsOpenFiles();
    default:
      return null;
  }
};
