'use strict';

import { execSafe } from '../common/exec';
import { sanitizeUrl } from '../common/security';
import { AIX, ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS, execOptsWin } from '../common/const';
import { nextTick } from '../common';

export const nixInetLatency = async (host: string) => {
  let hostSanitized = sanitizeUrl(host);
  hostSanitized = hostSanitized || '8.8.8.8';
  let params: string[] = [];
  let filt = '';
  if (LINUX) {
    params = ['-c', '2', '-w', '3', hostSanitized];
    filt = 'rtt';
  }
  if (NETBSD || FREEBSD) {
    params = ['-c', '2', '-t', '3', hostSanitized];
    filt = 'round-trip';
  }
  if (DARWIN) {
    params = ['-c2', '-t3', hostSanitized];
    filt = 'avg';
  }
  const stdout = await execSafe('ping', params);
  let result = null;
  if (stdout) {
    const lines = stdout.split('\n').filter((line: string) => line.indexOf(filt) >= 0).join('\n');

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

export const inetLatency = async (url: string) => {
  await nextTick();
  return nixInetLatency(url);
};
