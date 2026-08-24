import { EOL, networkInterfaces as osNetworkInterfaces } from 'node:os';
import { nextTick } from '../common';
import { execOptsWin } from '../common/const';
import { exec } from '../common/exec';

export const getFirstExternalNetworkInterface = (interfaces: any) => {
  let ifacename = '';
  let ifacenameFirst = '';

  let scopeid = 9999;

  // fallback - "first" external interface (sorted by scopeid)
  for (const dev in interfaces) {
    (interfaces[dev] || []).forEach((details: any) => {
      if (details && details.internal === false) {
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
    // https://www.inetdaemon.com/tutorials/internet/ip/routing/default_route.shtml
    let defaultIp = '';
    const { stdout } = await exec('netstat -r', execOptsWin);
    const lines = stdout.split(EOL);
    lines.forEach((line) => {
      line = line.replace(/\s+/g, ' ').trim();
      if (line.indexOf('0.0.0.0 0.0.0.0') > -1 && !/[a-zA-Z]/.test(line)) {
        const parts = line.split(' ');
        if (parts.length >= 5) {
          defaultIp = parts[parts.length - 2];
        }
      }
    });
    if (defaultIp) {
      for (const dev in interfaces) {
        (interfaces[dev] || []).forEach((details) => {
          if (details?.address && details.address === defaultIp) {
            ifacename = dev;
          }
        });
      }
    }
  } catch {}
  return ifacename;
};
