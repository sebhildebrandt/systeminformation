'use strict';

import { InetChecksiteData } from '../common/types';
import { initCheckSite } from '../common/initials';
import { sanitizeUrl } from '../common/security';
import { nextTick } from '../common';

export const windowsInetCheckSite = async (url: string) => {
  const result = initCheckSite;
  let t = Date.now();
  result.url = sanitizeUrl(url);
  if (result.url) {
    const http = (result.url.startsWith('https:') ? require('https') : require('http'));
    try {
      const res = await http.get(result.url);
      const statusCode = res.statusCode;

      result.status = statusCode || 404;
      result.ok = (statusCode === 200 || statusCode === 301 || statusCode === 302 || statusCode === 304);

      if (statusCode !== 200) {
        res.resume();
        result.ms = (result.ok ? Date.now() - t : 0);
        return result;
      } else {
        res.on('data', () => { });
        res.on('end', () => {
          result.ms = (result.ok ? Date.now() - t : 0);
          return result;
        });
      }
    } catch (e) {
      return result;
    }
  }
  return result;
};

export const inetChecksite = async (url: string) => {
  await nextTick();
  return windowsInetCheckSite(url);
};
