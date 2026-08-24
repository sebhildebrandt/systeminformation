import { networkInterfaces as osNetworkInterfaces } from 'node:os';
import { nextTick } from '../common';
import { DARWIN } from '../common/const';
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
    const cmd = DARWIN ? "route -n get default 2>/dev/null | grep interface: | awk '{print $2}'" : 'route get 0.0.0.0 | grep interface:';
    const { stdout } = await exec(cmd);
    ifacename = stdout.split('\n')[0];
    if (ifacename.indexOf(':') > -1) {
      ifacename = ifacename.split(':')[1].trim();
    }
  } catch {}
  return ifacename;
};
