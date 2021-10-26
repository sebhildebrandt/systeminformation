'use strict';

import { execSafe } from '../common/exec';
import { sanitizeUrl } from '../common/security';
import { execOptsWin } from '../common/const';
import { nextTick } from '../common';

export const windowsInetLatency = async (host: string) => {
  let hostSanitized = sanitizeUrl(host);
  hostSanitized = hostSanitized || '8.8.8.8';
  let result: number | null = null;
  try {
    const params = [hostSanitized, '-n', '1'];
    const stdout = await execSafe('ping', params, execOptsWin);
    if (stdout) {
      let lines = stdout.split('\r\n');
      lines.shift();
      lines.forEach(function (line) {
        if ((line.toLowerCase().match(/ms/g) || []).length === 3) {
          let l = line.replace(/ +/g, ' ').split(' ');
          if (l.length > 6) {
            result = parseFloat(l[l.length - 1]);
          }
        }
      });
    }
    return result;
  } catch (e) {
    return result;
  }
};

export const inetLatency = async (url: string) => {
  await nextTick();
  return windowsInetLatency(url);
};
