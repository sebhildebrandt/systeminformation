'use strict';

import { execCmd, powerShell } from '../common/exec';
import { initOsInfo } from '../common/initials';
import { getLogoFile } from '../common/mappings';
import { OsData } from '../common/types';
import { getValue, nextTick, noop, promiseAll } from '../common';
import { getCodepage } from '../common/codepage';

const windowsIsUefi = async () => {
  try {
    const stdout = (await execCmd('findstr /C:"Detected boot environment" "%windir%\\Panther\\setupact.log"')).toString();
    const line = stdout.split('\n\r')[0];
    return (line.toLowerCase().indexOf('efi') >= 0);
  } catch (e) {
    const stdout = (await execCmd('echo %firmware_type%')).toString();
    const line = stdout.toString() || '';
    return (line.toLowerCase().indexOf('efi') >= 0);
  }
};

export const windowsOsInfo = async () => {
  let result = await initOsInfo();
  try {
    result.logofile = getLogoFile();
    result.release = result.kernel;
    const workload = [];
    workload.push(powerShell('Get-WmiObject Win32_OperatingSystem | fl *'));
    workload.push(powerShell('(Get-CimInstance Win32_ComputerSystem).HypervisorPresent'));
    workload.push(powerShell('Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SystemInformation]::TerminalServerSession'));
    const data = await promiseAll(workload);
    let lines = data.results[0] ? data.results[0].toString().split('\r\n') : [''];
    result.distro = getValue(lines, 'Caption', ':').trim();
    result.serial = getValue(lines, 'SerialNumber', ':').trim();
    result.build = getValue(lines, 'BuildNumber', ':').trim();
    result.servicepack = getValue(lines, 'ServicePackMajorVersion', ':').trim() + '.' + getValue(lines, 'ServicePackMinorVersion', ':').trim();
    result.codepage = getCodepage();
    const hyperv = data.results[1] ? data.results[1].toString().toLowerCase() : '';
    result.hypervisor = hyperv.indexOf('true') !== -1;
    const term = data.results[2] ? data.results[2].toString() : '';
    result.remoteSession = (term.toString().toLowerCase().indexOf('true') >= 0);
    const uefi = await windowsIsUefi();
    result.uefi = uefi;
  } catch (e) {
    noop();
  }
  return result;
};

export const osInfo = async () => {
  await nextTick();
  return windowsOsInfo();
};
