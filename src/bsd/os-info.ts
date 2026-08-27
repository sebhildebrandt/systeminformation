import { execSave } from '../common/exec';
import { initOsInfo } from '../common/defaults';
import { getLogoFile } from '../common/mappings';
import { getValue, nextTick } from '../common';
import { getCodepage } from '../common/codepage';

// newest package manager activity = last time the system was updated
const getLastUpdate = async (): Promise<Date | null> => {
  const { stdout } = await execSave('stat -f %m /var/db/pkg/local.sqlite /var/db/pkg /var/db/freebsd-update 2>/dev/null');
  const times = (stdout || '')
    .split('\n')
    .map((line) => parseInt(line.trim(), 10))
    .filter((sec) => sec > 0);
  return times.length ? new Date(Math.max(...times) * 1000) : null;
};

// '' = headless/console session
const getDisplayServer = (): string => {
  const sessionType = (process.env.XDG_SESSION_TYPE || '').toLowerCase();
  return sessionType || (process.env.WAYLAND_DISPLAY ? 'wayland' : process.env.DISPLAY ? 'x11' : '');
};

export const osInfo = async () => {
  await nextTick();
  const defaults = await initOsInfo();
  const { stdout } = await execSave('sysctl kern.ostype kern.osrelease kern.osrevision kern.hostuuid machdep.bootmethod kern.geom.confxml');
  const lines = stdout.toString().split('\n');
  const distro = getValue(lines, 'kern.ostype');
  const logofile = getLogoFile(distro);
  const release = getValue(lines, 'kern.osrelease').split('-')[0];
  const serial = getValue(lines, 'kern.hostuuid');
  const bootmethod = getValue(lines, 'machdep.bootmethod');
  const uefiConf = stdout.toString().indexOf('<type>efi</type>') >= 0;
  const uefi = bootmethod ? bootmethod.toLowerCase().indexOf('uefi') >= 0 : uefiConf ? uefiConf : null;
  return {
    ...defaults,
    distro: distro || defaults.distro,
    logofile: logofile || defaults.logofile,
    release: release || defaults.release,
    serial: serial || defaults.serial,
    codename: '',
    codepage: getCodepage(),
    uefi: uefi || null,
    lastUpdate: await getLastUpdate(),
    displayServer: getDisplayServer()
  };
  return defaults;
};
