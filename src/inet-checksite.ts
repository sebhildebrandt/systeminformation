import { nextTick } from './common';
import { checkWebsite } from './common/internet';
import { sanitizeUrl } from './common/security';

export const inetChecksite = async (url: string) => {
  await nextTick();

  return checkWebsite(sanitizeUrl(url));
};
