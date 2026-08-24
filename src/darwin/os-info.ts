import { getValue, nextTick } from '../common';
import { getCodepage } from '../common/codepage';
import { initOsInfo } from '../common/defaults';
import { exec, execSave } from '../common/exec';
import { getLogoFile } from '../common/mappings';

// birth time of the initial-setup marker = when the OS was first set up
const getInstallDate = async (): Promise<Date | null> => {
  try {
    const { stdout } = await exec('stat -f "%SB" -t "%Y-%m-%dT%H:%M:%S" /var/db/.AppleSetupDone');
    const date = new Date(stdout.toString().trim());
    return Number.isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

// WindowServer running = Quartz compositor active, '' = headless
const getDisplayServer = async (): Promise<string> => {
  const { stdout } = await execSave('pgrep WindowServer 2>/dev/null');
  return (stdout || '').trim() ? 'quartz' : '';
};

const getCodename = (release: string): string => {
  let codename = 'macOS';
  switch (true) {
    case release.indexOf('10.4') > -1:
      codename = 'OS X Tiger';
      break;
    case release.indexOf('10.5') > -1:
      codename = 'OS X Leopard';
      break;
    case release.indexOf('10.6') > -1:
      codename = 'OS X Snow Leopard';
      break;
    case release.indexOf('10.7') > -1:
      codename = 'OS X Lion';
      break;
    case release.indexOf('10.8') > -1:
      codename = 'OS X Mountain Lion';
      break;
    case release.indexOf('10.9') > -1:
      codename = 'OS X Mavericks';
      break;
    case release.indexOf('10.10') > -1:
      codename = 'OS X Yosemite';
      break;
    case release.indexOf('10.11') > -1:
      codename = 'OS X El Capitan';
      break;
    case release.indexOf('10.12') > -1:
      codename = 'Sierra';
      break;
    case release.indexOf('10.13') > -1:
      codename = 'High Sierra';
      break;
    case release.indexOf('10.14') > -1:
      codename = 'Mojave';
      break;
    case release.indexOf('10.15') > -1:
      codename = 'Catalina';
      break;
    case release.startsWith('11.'):
      codename = 'Big Sur';
      break;
    case release.startsWith('12.'):
      codename = 'Monterey';
      break;
    case release.startsWith('13.'):
      codename = 'Ventura';
      break;
    case release.startsWith('14.'):
      codename = 'Sonoma';
      break;
    case release.startsWith('15.'):
      codename = 'Sequoia';
      break;
    case release.startsWith('26.'):
      codename = 'Tahoe';
      break;
    default:
      codename = 'macOS';
  }
  return codename;
};

export const osInfo = async () => {
  await nextTick();
  const defaults = await initOsInfo();
  try {
    const { stdout } = await exec('sw_vers; sysctl -i kern.ostype kern.osrelease kern.osrevision kern.uuid');
    const lines = stdout.toString().split('\n');
    const distro = getValue(lines, 'ProductName');
    const release = (getValue(lines, 'ProductVersion', ':', true, true) + ' ' + getValue(lines, 'ProductVersionExtra', ':', true, true)).trim();
    return {
      ...defaults,
      serial: getValue(lines, 'kern.uuid'),
      distro,
      release,
      build: getValue(lines, 'BuildVersion'),
      logofile: getLogoFile(distro),
      codename: getCodename(release),
      uefi: true,
      codepage: getCodepage(),
      installDate: await getInstallDate(),
      displayServer: await getDisplayServer()
    };
  } catch {}
  return defaults;
};
