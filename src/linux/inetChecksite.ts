'use strict';

import { execSafe } from '../common/exec';
import { InetChecksiteData } from '../common/types';
import { initCheckSite } from '../common/initials';
import { sanitizeUrl } from '../common/security';

export const nixInetCheckSite = async (url: string) => {
  const result = initCheckSite;
  let t = Date.now();
  result.url = sanitizeUrl(url);
  if (result.url) {
    let args = ['-I', '--connect-timeout', '5', '-m', '5'];
    args.push(result.url);
    let cmd = 'curl';
    const stdout = await execSafe(cmd, args);
    const lines = stdout.split('\n');
    let statusCode = lines[0] && lines[0].indexOf(' ') >= 0 ? parseInt(lines[0].split(' ')[1], 10) : 404;
    result.status = statusCode || 404;
    result.ok = (statusCode === 200 || statusCode === 301 || statusCode === 302 || statusCode === 304);
    result.ms = (result.ok ? Date.now() - t : 0);
    return result;
  };
  return result;
};

export const inetChecksite = (url: string) => {
  return new Promise<InetChecksiteData | null | undefined>(resolve => {
    process.nextTick(() => {
      return resolve(nixInetCheckSite(url));
    });
  });
};
