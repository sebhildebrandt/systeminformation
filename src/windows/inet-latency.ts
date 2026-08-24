import { nextTick } from '../common';
import { sanitizeUrl } from '../common/security';
import { ps } from '../common/windows';

export const inetLatency = async (host: string) => {
  await nextTick();
  let hostSanitized = sanitizeUrl(host);
  if (!/^[A-Za-z0-9][A-Za-z0-9.:-]*$/.test(hostSanitized)) {
    hostSanitized = '';
  }
  hostSanitized = hostSanitized || '8.8.8.8';
  let result: number | null = null;
  try {
    const stdout = await ps.exec(`ping ${hostSanitized} -n 1`);
    if (stdout) {
      const lines = stdout.toString().split('\r\n').splice(1);
      lines.forEach((line: string) => {
        if ((line.toLowerCase().match(/ms/g) || []).length === 3) {
          const l = line.replace(/ +/g, ' ').split(' ');
          if (l.length > 6) {
            result = parseFloat(l[l.length - 1]);
          }
        }
      });
    }
    return result;
  } catch {
    return result;
  }
};
