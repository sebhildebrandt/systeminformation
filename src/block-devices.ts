import { DARWIN, LINUX, WINDOWS } from './common/const';
export const blockDevices = async () => {
  switch (true) {
    case LINUX:
      return (await import('./linux/block-devices.js')).blockDevices();
    case DARWIN:
      return (await import('./darwin/block-devices.js')).blockDevices();
    case WINDOWS:
      return (await import('./windows/block-devices.js')).blockDevices();
    default:
      return null;
  }
};
