import { ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, OPENBSD, WINDOWS } from './common/const';

export const services = async (srv: string) => {
  switch (true) {
    case LINUX || FREEBSD || NETBSD || OPENBSD || DARWIN || ANDROID:
      return (await import('./linux/services.js')).services(srv);
    case WINDOWS:
      return (await import('./windows/services.js')).services(srv);
    default:
      return null;
  }
};
