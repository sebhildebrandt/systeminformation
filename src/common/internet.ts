import { Resolver } from 'dns';
import http from 'http';
import https from 'https';
import { isIPv4, isIPv6 } from 'net';

export const checkWebsite = (url: string, timeout = 5000) => {
  const client = url.startsWith('https:') || url.indexOf(':443/') > 0 || url.indexOf(':8443/') > 0 ? https : http;
  const t = Date.now();
  return new Promise((resolve) => {
    const request = client
      .get(url, (res: any) => {
        res.on('data', () => {});
        res.on('end', () => {
          resolve({
            url,
            statusCode: res.statusCode,
            ok: res.statusCode >= 200 && res.statusCode <= 399,
            message: res.statusMessage,
            ms: Date.now() - t
          });
        });
      })
      .on('error', (e: any) => {
        resolve({
          url,
          statusCode: 404,
          ok: false,
          message: e.message,
          ms: Date.now() - t
        });
      })
      .setTimeout(timeout, () => {
        request.destroy();
        resolve({
          url,
          statusCode: 408,
          ok: false,
          message: 'Request Timeout',
          ms: Date.now() - t
        });
      });
  });
};

// OpenDNS resolves myip.opendns.com to the address of the querying client
const dnsPublicIp = (family: 4 | 6, timeout: number) =>
  new Promise<string>((resolve) => {
    const resolver = new Resolver({ timeout, tries: 1 });
    try {
      resolver.setServers([family === 4 ? '208.67.222.222' : '2620:119:35::35']);
    } catch {
      return resolve('');
    }
    const done = (err: any, addresses: string[]) => resolve(!err && addresses?.length ? addresses[0] : '');
    if (family === 4) {
      resolver.resolve4('myip.opendns.com', done);
    } else {
      resolver.resolve6('myip.opendns.com', done);
    }
  });

// fallback for networks blocking external DNS resolvers
const webPublicIp = (family: 4 | 6, timeout: number) =>
  new Promise<string>((resolve) => {
    const request = https
      .get(family === 4 ? 'https://api.ipify.org' : 'https://api6.ipify.org', { family }, (res: any) => {
        let body = '';
        res.on('data', (chunk: any) => {
          body += chunk;
          // the reply is a plain IP address - anything longer is not what we asked for
          if (body.length > 64) {
            request.destroy();
            resolve('');
          }
        });
        res.on('end', () => resolve(res.statusCode === 200 ? body.trim() : ''));
      })
      .on('error', () => resolve(''))
      .setTimeout(timeout, () => {
        request.destroy();
        resolve('');
      });
  });

export const publicIp = async (timeout = 5000) => {
  const t = Date.now();
  const valid = (family: 4 | 6, ip: string) => ((family === 4 ? isIPv4(ip) : isIPv6(ip)) ? ip : '');
  const lookup = async (family: 4 | 6) => valid(family, await dnsPublicIp(family, timeout)) || valid(family, await webPublicIp(family, timeout));
  const [ip4, ip6] = await Promise.all([lookup(4), lookup(6)]);
  return { ip4, ip6, ms: Date.now() - t };
};
