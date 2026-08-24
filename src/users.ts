import { DARWIN, FREEBSD, LINUX, NETBSD, OPENBSD, SUNOS, WINDOWS } from './common/const';

export const users = async () => {
  switch (true) {
    case LINUX:
      return (await import('./linux/users.js')).users();
    case NETBSD || FREEBSD || OPENBSD:
      return (await import('./darwin/users.js')).users();
    case SUNOS:
      return (await import('./sun/users.js')).users();
    case DARWIN:
      return (await import('./darwin/users.js')).users();
    case WINDOWS:
      return (await import('./windows/users.js')).users();
    default:
      return null;
  }
};
