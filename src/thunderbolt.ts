import { DARWIN, LINUX, WINDOWS } from './common/const';

export const thunderbolt = async () => {
  switch (true) {
    case LINUX:
      return (await import('./linux/thunderbolt.js')).thunderbolt();
    case DARWIN:
      return (await import('./darwin/thunderbolt.js')).thunderbolt();
    case WINDOWS:
      return (await import('./windows/thunderbolt.js')).thunderbolt();
    default:
      return null;
  }
};
