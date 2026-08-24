import { cloneObj, getValue, nextTick } from '../common';
import { execOptsWin } from '../common/const';
import { initUUID } from '../common/defaults';
import { exec } from '../common/exec';
import type { UuidData } from '../common/types';
import { ps } from '../common/windows';

export const uuid = async () => {
  await nextTick();
  const result: UuidData = cloneObj(initUUID);
  try {
    let sysdir = '%windir%\\System32';
    if (process.arch === 'ia32' && Object.prototype.hasOwnProperty.call(process.env, 'PROCESSOR_ARCHITEW6432')) {
      sysdir = '%windir%\\sysnative\\cmd.exe /c %windir%\\System32';
    }
    const psOut = await ps.exec('Get-CimInstance Win32_ComputerSystemProduct | select UUID | fl');
    const lines = psOut.toString().split('\r\n');
    result.hardware = getValue(lines, 'uuid', ':').toLowerCase();
    const { stdout } = await exec(`${sysdir}\\reg query "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography" /v MachineGuid`, execOptsWin);
    const parts = stdout.toString().split('\n\r')[0].split('REG_SZ');
    result.os = parts.length > 1 ? parts[1].replace(/\r+|\n+|\s+/gi, '').toLowerCase() : '';
    return result;
  } catch {}
  return result;
};
