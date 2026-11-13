import { readFile, stat } from 'node:fs/promises';
import { getValue, nextTick } from '../common';
import { getCodepage } from '../common/codepage';
import { WINDIR } from '../common/const';
import { initOsInfo } from '../common/defaults';
import { getLogoFile, getWindowsRelease } from '../common/mappings';
import { ps } from '../common/windows';

const windowsIsUefi = async () => {
  try {
    const logFile = `${WINDIR}\\Panther\\setupact.log`;
    // skip huge logs
    if ((await stat(logFile)).size > 50 * 1024 * 1024) {
      throw new Error('setupact.log too large');
    }
    const content = await readFile(logFile, 'latin1');
    const line = content
      .split('\n')
      .filter((l) => l.includes('Detected boot environment'))
      .join('\n');
    if (line) {
      return line.toLowerCase().includes('efi');
    }
  } catch {}
  return (process.env.firmware_type || '').toLowerCase().includes('efi');
};

export const osInfo = async () => {
  await nextTick();
  const result = await initOsInfo();
  try {
    result.logofile = getLogoFile();
    result.release = result.kernel;
    const workload = [];
    workload.push(ps.exec('Get-CimInstance Win32_OperatingSystem | select Caption,SerialNumber,BuildNumber,ServicePackMajorVersion,ServicePackMinorVersion | fl'));
    workload.push(ps.exec('(Get-CimInstance Win32_ComputerSystem).HypervisorPresent'));
    workload.push(ps.exec('Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SystemInformation]::TerminalServerSession'));
    workload.push(ps.exec('reg query "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion" /v DisplayVersion'));
    workload.push(ps.exec("(Get-CimInstance Win32_OperatingSystem).InstallDate.ToString('yyyy-MM-ddTHH:mm:ss')"));
    workload.push(ps.exec('[bool](Get-Process dwm -ErrorAction SilentlyContinue)'));
    // latest installed OS update (date only, QFE has no time part)
    workload.push(
      ps.exec(
        "Get-HotFix | Where-Object { $_.Description -match 'Update' } | Sort-Object InstalledOn -Descending | Select-Object -First 1 -ExpandProperty InstalledOn | ForEach-Object { $_.ToString('yyyy-MM-ddTHH:mm:ss') }"
      )
    );

    const data = await Promise.allSettled(workload).then((results) => results.map((result) => (result.status === 'fulfilled' ? result.value : null)));
    const lines = data[0] ? data[0].toString().split('\r\n') : [''];
    result.distro = getValue(lines, 'Caption', ':').trim();
    result.serial = getValue(lines, 'SerialNumber', ':').trim();
    result.build = getValue(lines, 'BuildNumber', ':').trim();
    result.servicepack = `${getValue(lines, 'ServicePackMajorVersion', ':').trim()}.${getValue(lines, 'ServicePackMinorVersion', ':').trim()}`;
    result.codepage = getCodepage();
    const hyperv = data[1] ? data[1].toString().toLowerCase() : '';
    result.hypervisor = hyperv.indexOf('true') !== -1;
    const term = data[2] ? data[2].toString() : '';
    if (data[3]) {
      const codenameParts = data[3].split('REG_SZ');
      result.codename = codenameParts.length > 1 ? codenameParts[1].trim() : '';
    }
    if (!result.codename) {
      const buildNum = parseInt(result.build, 10);
      result.codename = getWindowsRelease(buildNum);
    }

    result.remoteSession = term.toString().toLowerCase().indexOf('true') >= 0;
    const uefi = await windowsIsUefi();
    result.uefi = uefi;
    if (data[4]) {
      const installDate = new Date(data[4].toString().trim());
      result.installDate = Number.isNaN(installDate.getTime()) ? null : installDate;
    }
    // dwm.exe running = Desktop Window Manager active, '' = headless (e.g. server core)
    result.displayServer = data[5] && data[5].toString().toLowerCase().indexOf('true') >= 0 ? 'dwm' : '';
    if (data[6]) {
      const lastUpdate = new Date(data[6].toString().trim());
      result.lastUpdate = Number.isNaN(lastUpdate.getTime()) ? null : lastUpdate;
    }
  } catch {}
  return result;
};
