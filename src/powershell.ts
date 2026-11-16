import { WINDOWS } from './common/const';
import { ps } from './common/windows';

export const powerShellStart = async (): Promise<void> => {
  if (WINDOWS) {
    await ps.start();
  }
};

// the pool restarts on demand with the next call that needs PowerShell
export const powerShellRelease = async (): Promise<void> => {
  await ps.stop();
};
