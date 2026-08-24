import { LINUX, WINDOWS, DARWIN, FREEBSD, NETBSD, OPENBSD, ANDROID } from './common/const';
export const networkGatewayDefault = async () => {
  switch (true) {
    case LINUX || FREEBSD || NETBSD || OPENBSD || ANDROID:
      return (await import('./linux/network-gateway-default.js')).networkGatewayDefault();
    case DARWIN:
      return (await import('./darwin/network-gateway-default.js')).networkGatewayDefault();
    case WINDOWS:
      return (await import('./windows/network-gateway-default.js')).networkGatewayDefault();
    default:
      return null;
  }
};
