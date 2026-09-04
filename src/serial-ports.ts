import { ANDROID, DARWIN, LINUX, WINDOWS } from './common/const';

export const serialPorts = async () => {
  switch (true) {
    case LINUX || ANDROID:
      return (await import('./linux/serial-ports.js')).serialPorts();
    case DARWIN:
      return (await import('./darwin/serial-ports.js')).serialPorts();
    case WINDOWS:
      return (await import('./windows/serial-ports.js')).serialPorts();
    default:
      return null;
  }
};
