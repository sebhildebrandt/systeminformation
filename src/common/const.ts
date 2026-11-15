import { existsSync } from 'node:fs';

export const PLATFORM = process.platform;

export const AIX = PLATFORM === 'aix';
export const DARWIN = PLATFORM === 'darwin';
export const FREEBSD = PLATFORM === 'freebsd';
export const LINUX = PLATFORM === 'linux';
export const OPENBSD = PLATFORM === 'openbsd';
export const NETBSD = PLATFORM === 'netbsd';
export const SUNOS = PLATFORM === 'sunos';
export const WINDOWS = PLATFORM === 'win32';
export const ANDROID = PLATFORM === 'android';

export const WINDIR = process.env.WINDIR || 'C:\\Windows';

// cmd.exe and libuv search cwd before PATH: run from system32 so bare names never resolve to files in the caller's cwd (CWE-427)
const WIN_SYSDIR = `${WINDIR}\\system32`;

export const execOptsWin = {
  windowsHide: true,
  maxBuffer: 1024 * 102400,
  env: Object.assign({}, process.env, { LANG: 'en_US.UTF-8' }),
  cwd: WINDOWS && existsSync(WIN_SYSDIR) ? WIN_SYSDIR : undefined
};

export const execOptsLinux = {
  maxBuffer: 1024 * 102400,
  stdio: ['pipe', 'pipe', 'ignore']
};

export const MAX_BUFFER_SIZE = 1024 * 102400;

export const UNKNOWN = 'unknown';

export const VBOXMANAGE = WINDOWS ? `"${(process.env.VBOX_INSTALL_PATH || process.env.VBOX_MSI_INSTALL_PATH || '').replace(/["%!^&|<>`$;\r\n]/g, '')}\\VBoxManage.exe"` : 'vboxmanage';
