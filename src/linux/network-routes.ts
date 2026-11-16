import { nextTick } from '../common';
import { execFile } from '../common/exec';
import { readFileLines } from '../common/files';
import type { NetworkRouteData } from '../common/types';

const EXEC_OPTS = { timeout: 5000, maxBuffer: 1024 * 1024 * 16 };

const toCidr = (dst: string, family: string) => {
  if (!dst || dst === 'default') {
    return family === 'IPv6' ? '::/0' : '0.0.0.0/0';
  }
  return dst.includes('/') ? dst : `${dst}/${family === 'IPv6' ? 128 : 32}`;
};

// ip -j route: multipath routes carry their gateways / devices in "nexthops" instead
// null = no JSON (iproute2 before 4.13 ignores -j and prints text)
export const parseIpRoutes = (stdout: string, family: string): NetworkRouteData[] | null => {
  let routes: any[] = [];
  try {
    routes = JSON.parse(stdout);
  } catch {
    return null;
  }
  if (!Array.isArray(routes)) {
    return null;
  }
  const result: NetworkRouteData[] = [];
  for (const route of routes) {
    const destination = toCidr(String(route?.dst || ''), family);
    // ip omits a metric of 0 (the kernel default)
    const metric = typeof route?.metric === 'number' ? route.metric : 0;
    const hops = Array.isArray(route?.nexthops) && route.nexthops.length ? route.nexthops : [route];
    for (const hop of hops) {
      result.push({ destination, gateway: String(hop?.gateway || ''), iface: String(hop?.dev || ''), metric, family });
    }
  }
  return result;
};

// /proc/net/route: hex values in host (little endian) byte order, IPv4 only
const hexToIp = (hex: string) =>
  (hex.match(/../g) || [])
    .reverse()
    .map((byte) => parseInt(byte, 16))
    .join('.');

export const parseProcRoutes = (lines: string[]): NetworkRouteData[] =>
  lines
    .slice(1)
    .map((line) => line.trim().split(/\s+/))
    .filter((parts) => parts.length >= 8 && (parseInt(parts[3] || '0', 16) & 1) === 1)
    .map((parts) => {
      const prefix = (parseInt(parts[7] || '0', 16) >>> 0).toString(2).replace(/0/g, '').length;
      const gateway = hexToIp(parts[2] || '');
      return {
        destination: `${hexToIp(parts[1] || '')}/${prefix}`,
        gateway: gateway === '0.0.0.0' ? '' : gateway,
        iface: parts[0] || '',
        metric: parseInt(parts[6] || '', 10) || 0,
        family: 'IPv4'
      };
    });

export const networkRoutes = async (): Promise<NetworkRouteData[]> => {
  await nextTick();
  try {
    const [v4, v6] = await Promise.all([execFile('ip', ['-j', 'route', 'show'], EXEC_OPTS), execFile('ip', ['-j', '-6', 'route', 'show'], EXEC_OPTS).catch(() => ({ stdout: '[]' }))]);
    const routes = parseIpRoutes(v4.stdout.toString(), 'IPv4');
    if (routes) {
      return [...routes, ...(parseIpRoutes(v6.stdout.toString(), 'IPv6') || [])];
    }
  } catch {}
  // no iproute2 (busybox, minimal containers) or no JSON support
  return parseProcRoutes(await readFileLines('/proc/net/route'));
};
