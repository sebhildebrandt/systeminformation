import { LINUX, WINDOWS, DARWIN, FREEBSD, NETBSD, OPENBSD, ANDROID } from './common/const';

export const networkInterfaces = async (defaultString = '', rescan = true) => {
  defaultString = '' + defaultString;
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
