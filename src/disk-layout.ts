import { DARWIN, LINUX, WINDOWS } from './common/const';
export const diskLayout = async () => {
  switch (true) {
    case LINUX:
      return (await import('./linux/disk-layout.js')).diskLayout();
    case DARWIN:
      return (await import('./darwin/disk-layout.js')).diskLayout();
    case WINDOWS:
      return (await import('./windows/disk-layout.js')).diskLayout();
    default:
      return null;
  }
};
