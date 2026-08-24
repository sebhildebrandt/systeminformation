import { nextTick } from '../common';
import { initOsInfo } from '../common/defaults';
import { exec } from '../common/exec';
import { getLogoFile } from '../common/mappings';

// '' = headless/console session
const getDisplayServer = (): string => {
  const sessionType = (process.env.XDG_SESSION_TYPE || '').toLowerCase();
  return sessionType || (process.env.WAYLAND_DISPLAY ? 'wayland' : process.env.DISPLAY ? 'x11' : '');
};

export const osInfo = async () => {
  await nextTick();
  const result = await initOsInfo();
  try {
    result.release = result.kernel;
    const { stdout } = await exec('uname -o');
    const lines = stdout.toString().split('\n');
    result.distro = lines[0];
    result.logofile = getLogoFile(result.distro);
    result.displayServer = getDisplayServer();
  } catch {}
  return result;
};
