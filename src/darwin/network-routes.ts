import { nextTick } from '../common';
import { execFile } from '../common/exec';
import type { NetworkRouteData } from '../common/types';

const EXEC_OPTS = { timeout: 5000, maxBuffer: 1024 * 1024 * 16 };

// netstat abbreviates IPv4 networks: "127" = 127.0.0.0/8, "192.168.3" = 192.168.3.0/24, "224.0.0/4"
const ipv4Cidr = (dest: string, host: boolean) => {
  if (dest === 'default') {
    return '0.0.0.0/0';
  }
  const [addr = '', prefix] = dest.split('/');
  const octets = addr.split('.');
  const bits = prefix ?? (host ? '32' : String(octets.length * 8));
  while (octets.length < 4) {
    octets.push('0');
  }
  return `${octets.join('.')}/${bits}`;
};

// link local addresses carry their scope ("fe80::%en0/64") - the interface column has it already
const ipv6Cidr = (dest: string) => {
  if (dest === 'default') {
    return '::/0';
  }
  const value = dest.replace(/%[^/]*/, '');
  return value.includes('/') ? value : `${value}/128`;
};

export const parseNetstatRoutes = (stdout: string): NetworkRouteData[] => {
  const result: NetworkRouteData[] = [];
  let family = '';
  let gatewayCol = -1;
  let flagsCol = -1;
  let ifaceCol = -1;
  for (const line of stdout.split('\n')) {
    const parts = line.trim().split(/\s+/);
    if (/^Internet6?:$/.test(parts[0] || '')) {
      family = parts[0] === 'Internet6:' ? 'IPv6' : 'IPv4';
      continue;
    }
    if (parts[0] === 'Destination') {
      gatewayCol = parts.indexOf('Gateway');
      flagsCol = parts.indexOf('Flags');
      ifaceCol = parts.findIndex((part) => /^(netif|interface|iface)$/i.test(part));
      continue;
    }
    if (!family || gatewayCol < 0 || flagsCol < 0 || ifaceCol < 0 || parts.length <= ifaceCol) {
      continue;
    }
    const flags = parts[flagsCol] || '';
    // L = link layer address: ARP / NDP neighbor cache and own addresses, no configured routes
    if (!flags.startsWith('U') || flags.includes('L')) {
      continue;
    }
    const dest = parts[0] || '';
    const gateway = (parts[gatewayCol] || '').replace(/%.*$/, '');
    result.push({
      destination: family === 'IPv6' ? ipv6Cidr(dest) : ipv4Cidr(dest, flags.includes('H')),
      gateway: gateway.startsWith('link#') ? '' : gateway,
      iface: parts[ifaceCol] || '',
      metric: null,
      family
    });
  }
  return result;
};

export const networkRoutes = async (): Promise<NetworkRouteData[]> => {
  await nextTick();
  try {
    const { stdout } = await execFile('netstat', ['-rn'], EXEC_OPTS);
    return parseNetstatRoutes(stdout.toString());
  } catch {
    return [];
  }
};
