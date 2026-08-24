import { LINUX, WINDOWS, DARWIN, FREEBSD, NETBSD, SUNOS, OPENBSD, ANDROID } from './common/const';

export const networkInterfaceDefault = async () => {
  switch (true) {
    case LINUX || ANDROID:
      return (await import('./linux/network-interface-default.js')).networkInterfaceDefault();
    case FREEBSD || NETBSD || OPENBSD || DARWIN || SUNOS:
      return (await import('./darwin/network-interface-default.js')).networkInterfaceDefault();
    case WINDOWS:
      return (await import('./windows/network-interface-default.js')).networkInterfaceDefault();
    default:
      return null;
  }
};
