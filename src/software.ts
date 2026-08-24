import { DARWIN, LINUX, WINDOWS } from './common/const';

export const software = async () => {
  switch (true) {
    case LINUX:
      return (await import('./linux/software.js')).software();
    case DARWIN:
      return (await import('./darwin/software.js')).software();
    case WINDOWS:
      return (await import('./windows/software.js')).software();
    default:
      return null;
  }
};
