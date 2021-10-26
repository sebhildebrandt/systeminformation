import { execCmd, powerShell } from '../common/exec';
import { initOsInfo } from '../common/defaults';
import { getLogoFile } from '../common/mappings';
import { getValue, nextTick } from '../common';
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
  const result = await initOsInfo();
  try {
    result.logofile = getLogoFile();
    result.release = result.kernel;
    const workload = [];
    workload.push(powerShell('Get-WmiObject Win32_OperatingSystem | fl *'));
    workload.push(powerShell('(Get-CimInstance Win32_ComputerSystem).HypervisorPresent'));
    workload.push(powerShell('Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SystemInformation]::TerminalServerSession'));
    const data = await Promise.allSettled(workload).then(results => results.map(result => result.status === 'fulfilled' ? result.value : null));
    const lines = data[0] ? data[0].toString().split('\r\n') : [''];
    result.distro = getValue(lines, 'Caption', ':').trim();
    result.serial = getValue(lines, 'SerialNumber', ':').trim();
    result.build = getValue(lines, 'BuildNumber', ':').trim();
    result.servicepack = getValue(lines, 'ServicePackMajorVersion', ':').trim() + '.' + getValue(lines, 'ServicePackMinorVersion', ':').trim();
    result.codepage = getCodepage();
    const hyperv = data[1] ? data[1].toString().toLowerCase() : '';
    result.hypervisor = hyperv.indexOf('true') !== -1;
    const term = data[2] ? data[2].toString() : '';
    result.remoteSession = (term.toString().toLowerCase().indexOf('true') >= 0);
    const uefi = await windowsIsUefi();
    result.uefi = uefi;
  } catch { }
  return result;
};

export const osInfo = async () => {
  await nextTick();
  return windowsOsInfo();
};
