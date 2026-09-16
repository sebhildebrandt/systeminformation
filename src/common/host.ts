import { execSync } from 'node:child_process';
import { EOL, hostname, networkInterfaces } from 'node:os';
import { DARWIN, FREEBSD, LINUX, NETBSD, OPENBSD, WINDOWS } from './const';
import { exec } from './exec';

// Reine Host-Identitäts-Helfer ohne Abhängigkeit auf defaults.
// Bewusst nicht in network.ts (das defaults importiert) -> vermeidet zirkulären Import.

export const getFQDN = async () => {
  try {
    let stdout = '';
    switch (true) {
      case LINUX || DARWIN:
        try {
          ({ stdout } = await exec('hostname -f 2>/dev/null'));
          return stdout.toString().split(EOL)[0];
        } catch {}
        break;
      case FREEBSD || NETBSD || OPENBSD:
        try {
          ({ stdout } = await exec('hostname 2>/dev/null'));
          return stdout.split(EOL)[0];
        } catch {}
        break;
      case WINDOWS:
        ({ stdout } = await exec('echo %COMPUTERNAME%.%USERDNSDOMAIN%'));
        return stdout.toString().replace('.%USERDNSDOMAIN%', '').split(EOL)[0];
      default:
        return hostname();
    }
  } catch {}
  return hostname();
};

// macOS 26+ (and hardened linux kernels) mask MACs in getifaddrs(), so node reports these placeholders
const MASKED_MACS = ['00:00:00:00:00:00', '02:00:00:00:00:00'];

// Reads MAC addresses per interface from ifconfig / ip, used when node reports masked values.
const getMacAddressesSync = (): Record<string, string> => {
  const result: Record<string, string> = {};
  let iface = '';
  let mac = '';
  try {
    if (LINUX) {
      const lines = execSync('export LC_ALL=C; ip link show up; unset LC_ALL', { encoding: 'utf8' }).split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line && line[0] !== ' ') {
          const next = (lines[i + 1] || '').trim().split(' ');
          if (next[0] === 'link/ether') {
            iface = (line.split(' ')[1] || '').replace(/:$/, '');
            mac = next[1] || '';
          }
          if (iface && mac) {
            result[iface] = mac.trim();
            iface = '';
            mac = '';
          }
        }
      }
    } else if (DARWIN || FREEBSD || NETBSD || OPENBSD) {
      const lines = execSync('/sbin/ifconfig', { encoding: 'utf8' }).split('\n');
      for (const line of lines) {
        if (line && line[0] !== '\t' && line.indexOf(':') > 0) {
          iface = line.split(':')[0];
        } else if (line.indexOf('\tether ') === 0) {
          mac = line.split('\tether ')[1] || '';
          if (iface && mac) {
            result[iface] = mac.trim();
            iface = '';
            mac = '';
          }
        }
      }
    }
  } catch {}
  return result;
};

export const getUniqueMacAddresses = () => {
  let macs: string[] = [];
  try {
    const interfaces = networkInterfaces();
    let fallbackMacs: Record<string, string> | null = null;
    for (const dev in interfaces) {
      if (Object.keys(interfaces).includes(dev)) {
        interfaces[dev]?.forEach((details: any) => {
          if (details?.mac) {
            let mac = details.mac.toLowerCase();
            if (MASKED_MACS.includes(mac)) {
              if (fallbackMacs === null) {
                fallbackMacs = getMacAddressesSync();
              }
              mac = (fallbackMacs[dev] || '').toLowerCase();
            }
            if (mac && !MASKED_MACS.includes(mac) && macs.indexOf(mac) === -1) {
              macs.push(mac);
            }
          }
        });
      }
    }
    macs = macs.sort((a, b) => {
      if (a < b) {
        return -1;
      }
      if (a > b) {
        return 1;
      }
      return 0;
    });
  } catch (e) {
    macs.push('00:00:00:00:00:00');
  }
  return macs;
};
