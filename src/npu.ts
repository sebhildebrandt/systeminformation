import { DARWIN, LINUX, WINDOWS } from './common/const';

export const npu = async () => {
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
