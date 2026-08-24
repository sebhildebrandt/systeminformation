import { ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, OPENBSD, WINDOWS } from './common/const';

export const battery = async () => {
  switch (true) {
    case LINUX || ANDROID:
      return (await import('./linux/battery.js')).battery();
    case FREEBSD || NETBSD || OPENBSD:
      return (await import('./bsd/battery.js')).battery();
    case DARWIN:
      return (await import('./darwin/battery.js')).battery();
    case WINDOWS:
      return (await import('./windows/battery.js')).battery();
    default:
      return null;
  }
};
