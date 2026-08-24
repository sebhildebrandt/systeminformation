import { ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, OPENBSD, SUNOS, WINDOWS } from './common/const';

export const inetLatency = async (host: string) => {
  switch (true) {
    case LINUX || DARWIN || NETBSD || FREEBSD || OPENBSD || ANDROID:
      return (await import('./linux/inet-latency.js')).inetLatency(host);
    case SUNOS:
      return (await import('./sun/inet-latency.js')).inetLatency(host);
    case WINDOWS:
      return (await import('./windows/inet-latency.js')).inetLatency(host);
    default:
      return null;
  }
};
