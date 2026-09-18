import { readFile, readlink } from 'node:fs/promises';
import { toInt } from '../common';
import { execSecure } from '../common/exec';
import type { ProcessFocusedData } from '../common/types';

// xprop blocks until the window owner answers the property request - an unresponsive x client
// would otherwise keep processFocused() pending forever, and execSecure only settles on close
const EXEC_OPTS = { timeout: 5000 };

export const parseXpropWindowId = (stdout: string) => {
  const id = (stdout.match(/window id # (0x[0-9a-f]+)/i) || [])[1] || '';
  return Number(id) ? id : '';
};

export const parseXpropPid = (stdout: string) => toInt((stdout.match(/_NET_WM_PID\(CARDINAL\) = (\d+)/) || [])[1]);

const activeWindowPid = async () => {
  const pid = toInt(await execSecure('xdotool', ['getactivewindow', 'getwindowpid'], EXEC_OPTS));
  if (pid) {
    return pid;
  }
  const windowId = parseXpropWindowId(await execSecure('xprop', ['-root', '_NET_ACTIVE_WINDOW'], EXEC_OPTS));
  return windowId ? parseXpropPid(await execSecure('xprop', ['-id', windowId, '_NET_WM_PID'], EXEC_OPTS)) : 0;
};

// X11 only - wayland exposes no way to query the focused window without a compositor specific
// protocol, so the result is null there
export const processFocused = async (): Promise<ProcessFocusedData | null> => {
  const pid = await activeWindowPid();
  if (!pid) {
    return null;
  }
  const path = await readlink(`/proc/${pid}/exe`).catch(() => '');
  const name = path ? path.split('/').pop() || '' : (await readFile(`/proc/${pid}/comm`, 'utf8').catch(() => '')).trim();
  return { pid, name, path };
};
