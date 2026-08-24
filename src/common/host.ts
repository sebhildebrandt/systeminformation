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

export const getUniqueMacAddresses = () => {
  let macs: string[] = [];
  try {
    const interfaces = networkInterfaces();
    for (const dev in interfaces) {
      if (Object.keys(interfaces).includes(dev)) {
        interfaces[dev]?.forEach((details: any) => {
          if (details?.mac && details.mac !== '00:00:00:00:00:00') {
            const mac = details.mac.toLowerCase();
            if (macs.indexOf(mac) === -1) {
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
