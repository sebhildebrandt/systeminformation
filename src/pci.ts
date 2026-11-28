import { DARWIN, LINUX, WINDOWS } from './common/const';
import type { PciData } from './common/types';

export const pci = async (): Promise<PciData[]> => {
  switch (true) {
    case LINUX:
      return (await import('./linux/pci.js')).pci();
    case DARWIN:
      return (await import('./darwin/pci.js')).pci();
    case WINDOWS:
      return (await import('./windows/pci.js')).pci();
    default:
      return [];
  }
};
