'use strict';

import { execCmd, powerShell } from '../common/exec';
import { initUUID } from '../common/initials';
import { UuidData } from '../common/types';
import { getValue, nextTick } from '../common';

export const windowsUuid = async () => {
  const result: UuidData = initUUID;
  try {
    let sysdir = '%windir%\\System32';
    if (process.arch === 'ia32' && Object.prototype.hasOwnProperty.call(process.env, 'PROCESSOR_ARCHITEW6432')) {
      sysdir = '%windir%\\sysnative\\cmd.exe /c %windir%\\System32';
    }
    let stdout = (await execCmd(`${sysdir}\\reg query "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography" /v MachineGuid`)).toString();
    const parts = stdout.split('\n\r')[0].split('REG_SZ');
    result.os = parts.length > 1 ? parts[1].replace(/\r+|\n+|\s+/ig, '').toLowerCase() : '';
    stdout = await powerShell('Get-WmiObject Win32_ComputerSystemProduct | fl *');
    const lines = stdout.split('\r\n');
    result.hardware = getValue(lines, 'uuid', ':').toLowerCase();
  } catch (e) {
  }
  return result;
};

export const uuid = async () => {
  await nextTick();
  return windowsUuid();
};
