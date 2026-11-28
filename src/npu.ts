import { DARWIN, LINUX, WINDOWS } from './common/const';
import type { NpuData } from './common/types';

export const npu = async (): Promise<NpuData[] | null> => {
  switch (true) {
    case LINUX:
      return (await import('./linux/npu.js')).npu();
    case DARWIN:
      return (await import('./darwin/npu.js')).npu();
    case WINDOWS:
      return (await import('./windows/npu.js')).npu();
    default:
      return null;
  }
};
