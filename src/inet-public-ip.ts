import { nextTick } from './common';
import { publicIp } from './common/internet';
import type { InetPublicIpData } from './common/types';

export const inetPublicIp = async (timeout?: number): Promise<InetPublicIpData> => {
  await nextTick();

  return publicIp(timeout);
};
