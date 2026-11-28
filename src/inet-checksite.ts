import { nextTick } from './common';
import { checkWebsite } from './common/internet';
import { sanitizeUrl } from './common/security';
import type { InetChecksiteData } from './common/types';

export const inetChecksite = async (url: string): Promise<InetChecksiteData> => {
  await nextTick();
  const res = await checkWebsite(sanitizeUrl(url));
  return { url: res.url, ok: res.ok, status: res.statusCode, ms: res.ms };
};
