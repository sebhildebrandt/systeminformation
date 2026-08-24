import { ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, OPENBSD, WINDOWS } from './common/const';

export const memLayout = async () => {
  switch (true) {
    case LINUX || NETBSD || FREEBSD || OPENBSD || ANDROID:
      return (await import('./linux/mem-layout.js')).memLayout();
    case DARWIN:
      return (await import('./darwin/mem-layout.js')).memLayout();
    case WINDOWS:
      return (await import('./windows/mem-layout.js')).memLayout();
    default:
      return null;
  }
};
