'use strict';

import { execSafe } from './common/exec';
import { InetChecksiteData } from './common/types';
import { initCheckSite } from './common/initials';
import { sanitizeUrl } from './common/security';
import { AIX, ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS, execOptsWin } from './common/const';

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
    const lines = stdout.split('\n').filter(line => line.indexOf(filt) >= 0).join('\n');

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

// --------------------------
// check inet latency

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

export const inetChecksite = (url: string) => {
  return new Promise<InetChecksiteData | null | undefined>(resolve => {
    process.nextTick(() => {
      return resolve(windowsInetCheckSite(url));
    });
  });
};
export const inetLatency = (url: string) => {
  return new Promise<number | null>(resolve => {
    process.nextTick(() => {
      return resolve(windowsInetLatency(url));
    });
  });
};
