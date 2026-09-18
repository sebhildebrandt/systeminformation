import { DARWIN, LINUX, WINDOWS } from './common/const';

export const processFocused = async () => {
  switch (true) {
    case LINUX:
      return (await import('./linux/process-focused.js')).processFocused();
    case DARWIN:
      return (await import('./darwin/process-focused.js')).processFocused();
    case WINDOWS:
      return (await import('./windows/process-focused.js')).processFocused();
    default:
      return null;
  }
};
