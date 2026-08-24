import { execSecure } from '../common/exec';
import { sanitizeUrl } from '../common/security';
import { DARWIN, FREEBSD, LINUX, NETBSD, OPENBSD } from '../common/const';
import { nextTick } from '../common';

export const inetLatency = async (host: string) => {
  await nextTick();
  let hostSanitized = sanitizeUrl(host);
  hostSanitized = hostSanitized || '8.8.8.8';
  let params: string[] = [];
  if (LINUX) {
    params = ['-c', '2', '-w', '3', hostSanitized];
  }
  if (NETBSD || FREEBSD || OPENBSD) {
    params = ['-c', '2', '-t', '3', hostSanitized];
  }
  if (DARWIN) {
    params = ['-c2', '-t3', hostSanitized];
  }
  const stdout = await execSecure('ping', params);
  let result = null;
  if (stdout) {
    const lines = stdout
      .split('\n')
      .filter((line) => line.indexOf('rtt') >= 0 || line.indexOf('round-trip') >= 0 || line.indexOf('avg') >= 0)
      .join('\n');

    const line = lines.split('=');
    if (line.length > 1) {
      const parts = line[1].split('/');
      if (parts.length > 1) {
        result = parseFloat(parts[1]);
      }
    }
  }
  return result;
};
