import { nextTick } from '../common';
import { execSecure } from '../common/exec';
import { sanitizeHost } from '../common/security';

export const inetLatency = async (host?: string) => {
  await nextTick();
  const hostSanitized = sanitizeHost(host);
  if (!hostSanitized) {
    return null;
  }
  const params = ['-s', '-a', hostSanitized, '56', '2'];
  const filt = 'avg';
  const stdout = await execSecure('ping', params, { timeout: 3000 });
  let result = null;
  if (stdout) {
    const lines = stdout
      .split('\n')
      .filter((line) => line.indexOf(filt) >= 0)
      .join('\n');
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
