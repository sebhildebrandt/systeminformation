import { cloneObj, getValue, nextTick } from '../common';
import { execOptsWin, WINDIR } from '../common/const';
import { initUUID } from '../common/defaults';
import { execFile } from '../common/exec';
import type { UuidData } from '../common/types';
import { ps } from '../common/windows';

export const uuid = async () => {
  await nextTick();
  const result: UuidData = cloneObj(initUUID);
  try {
    // Sysnative: 64-bit reg.exe from a 32-bit node process
    const sysdir = process.arch === 'ia32' && Object.prototype.hasOwnProperty.call(process.env, 'PROCESSOR_ARCHITEW6432') ? 'Sysnative' : 'System32';
    const psOut = await ps.exec('Get-CimInstance Win32_ComputerSystemProduct | select UUID | fl');
    const lines = psOut.toString().split('\r\n');
    result.hardware = getValue(lines, 'uuid', ':').toLowerCase();
    const { stdout } = await execFile(`${WINDIR}\\${sysdir}\\reg.exe`, ['query', 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography', '/v', 'MachineGuid'], execOptsWin);
    const parts = stdout.toString().split('\n\r')[0].split('REG_SZ');
    result.os = parts.length > 1 ? parts[1].replace(/\r+|\n+|\s+/gi, '').toLowerCase() : '';
    return result;
  } catch {}
  return result;
};
