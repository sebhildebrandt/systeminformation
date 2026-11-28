import { nextTick } from '../common';
import { sanitizeHost } from '../common/security';
import { ps } from '../common/windows';

export const inetLatency = async (host?: string) => {
  await nextTick();
  const hostSanitized = sanitizeHost(host);
  let result: number | null = null;
  if (!hostSanitized) {
    return result;
  }
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
