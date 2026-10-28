import { nextTick } from './common';
import { publicIp } from './common/internet';
import type { InetPublicIpData } from './common/types';

export const inetPublicIp = async (timeout?: number): Promise<InetPublicIpData> => {
  await nextTick();

  // get() passes params as strings - fall back to default on invalid values
  const t = Number(timeout);
  return publicIp(Number.isFinite(t) && t > 0 ? t : undefined);
};
