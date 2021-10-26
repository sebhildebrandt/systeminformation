'use strict';

import { execSafe } from '../common/exec';
import { sanitizeUrl } from '../common/security';

export const sunInetLatency = async (host: string) => {
  let hostSanitized = sanitizeUrl(host);
  hostSanitized = hostSanitized || '8.8.8.8';
  const params = ['-s', '-a', hostSanitized, '56', '2'];
  const filt = 'avg';
  const stdout = await execSafe('ping', params, { timeout: 3000 });
  let result = null;
  if (stdout) {
    const lines = stdout.split('\n').filter(line => line.indexOf(filt) >= 0).join('\n');
    const line = lines.split('=');
    if (line.length > 1) {
      const parts = line[1].split('/');
      if (parts.length > 1) {
        result = parseFloat(parts[1].replace(',', '.'));
      }
    }
  }
  return result;
};

export const inetLatency = (url: string) => {
  return new Promise<number | null>(resolve => {
    process.nextTick(() => {
      return resolve(sunInetLatency(url));
    });
  });
};
