import { ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, OPENBSD, WINDOWS } from './common/const';

export const networkInterfaces = async (defaultString = '', rescan = true) => {
  // objects without string conversion would throw here
  defaultString = typeof defaultString === 'string' ? defaultString : '';
  switch (true) {
    case LINUX || ANDROID:
      return (await import('./linux/network-interfaces.js')).networkInterfaces(defaultString, rescan);
    case FREEBSD || NETBSD || OPENBSD || DARWIN:
      return (await import('./darwin/network-interfaces.js')).networkInterfaces(defaultString, rescan);
    case WINDOWS:
      return (await import('./windows/network-interfaces.js')).networkInterfaces(defaultString, rescan);
    default:
      return null;
  }
};
