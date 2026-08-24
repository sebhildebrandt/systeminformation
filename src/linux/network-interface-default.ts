import { networkInterfaces as osNetworkInterfaces } from 'node:os';
import { nextTick } from '../common';
import { execOptsLinux } from '../common/const';
import { exec } from '../common/exec';

export const getFirstExternalNetworkInterface = (interfaces: any) => {
  let ifacename = '';
  let ifacenameFirst = '';

  let scopeid = 9999;

  // fallback - "first" external interface (sorted by scopeid)
  for (const dev in interfaces) {
    (interfaces[dev] || []).forEach((details: any) => {
      if (details?.internal === false) {
        ifacenameFirst = ifacenameFirst || dev; // fallback if no scopeid
        if (details.scopeid && details.scopeid < scopeid) {
          ifacename = dev;
          scopeid = details.scopeid;
        }
      }
    });
  }
  return ifacename || ifacenameFirst || '';
};

export const networkInterfaceDefault = async () => {
  await nextTick();
  const interfaces = osNetworkInterfaces();
  let ifacename = getFirstExternalNetworkInterface(interfaces);
  try {
    const { stdout } = await exec('ip route 2> /dev/null | grep default', execOptsLinux);
    const parts = stdout.split('\n')[0].split(/\s+/);
    if (parts[0] === 'none' && parts[5]) {
      ifacename = parts[5];
    } else if (parts[4]) {
      ifacename = parts[4];
    }

    if (ifacename.indexOf(':') > -1) {
      ifacename = ifacename.split(':')[1].trim();
    }
  } catch {}
  return ifacename;
};
