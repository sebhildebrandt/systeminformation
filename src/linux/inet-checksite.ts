import { execSafe } from '../common/exec';
import { initCheckSite } from '../common/defaults';
import { sanitizeUrl } from '../common/security';
import { cloneObj, nextTick } from '../common';

export const nixInetCheckSite = async (url: string) => {
  const result = cloneObj(initCheckSite);
  const t = Date.now();
  result.url = sanitizeUrl(url);
  if (result.url) {
    const args = ['-I', '--connect-timeout', '5', '-m', '5'];
    args.push(result.url);
    const cmd = 'curl';
    const stdout = await execSafe(cmd, args);
    const lines = stdout.split('\n');
    const statusCode = lines[0] && lines[0].indexOf(' ') >= 0 ? parseInt(lines[0].split(' ')[1], 10) : 404;
    result.status = statusCode || 404;
    result.ok = (statusCode === 200 || statusCode === 301 || statusCode === 302 || statusCode === 304);
    result.ms = (result.ok ? Date.now() - t : 0);
    return result;
  }
  return result;
};

export const inetChecksite = async (url: string) => {
  await nextTick();
  return nixInetCheckSite(url);
};
