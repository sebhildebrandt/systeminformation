import { ps } from '../common/windows';

export const shell = async () => {
  let result = 'CMD';
  try {
    const ppid = Number(process.ppid);
    if (Number.isInteger(ppid) && ppid > 0) {
      const stdout = await ps.exec(`Get-CimInstance -ClassName Win32_Process | where-object {$_.ProcessId -eq ${ppid} } | select Name`);
      if (stdout && stdout.toString().toLowerCase().indexOf('powershell') >= 0) {
        result = 'PowerShell';
      }
    }
  } catch {}
  return result;
};
