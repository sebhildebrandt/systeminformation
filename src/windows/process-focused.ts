import type { ProcessFocusedData } from '../common/types';
import { ps } from '../common/windows';

// the persistent powershell worker keeps the compiled type around, so only add it once
const WIN_FOREGROUND =
  `if (-not ([System.Management.Automation.PSTypeName]'SI.Win').Type) { Add-Type -Namespace SI -Name Win -MemberDefinition '` +
  '[DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow(); ' +
  '[DllImport("user32.dll")] public static extern int GetWindowThreadProcessId(IntPtr hWnd, out int pid);' +
  `' }; ` +
  '$p = 0; [void][SI.Win]::GetWindowThreadProcessId([SI.Win]::GetForegroundWindow(), [ref]$p); ' +
  '$proc = Get-Process -Id $p -ErrorAction SilentlyContinue; ' +
  '[PSCustomObject]@{pid=$p;name=$proc.ProcessName;path=$proc.Path} | ConvertTo-Json -compress';

// the powershell pool already parses ConvertTo-Json output, plain strings are accepted too
export const parseWindowsFocused = (data: any): ProcessFocusedData | null => {
  let parsed = data;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return null;
    }
  }
  if (!parsed || !parsed.pid) {
    return null;
  }
  return { pid: parsed.pid, name: parsed.name || '', path: parsed.path || '' };
};

export const processFocused = async (): Promise<ProcessFocusedData | null> => {
  try {
    return parseWindowsFocused(await ps.exec(WIN_FOREGROUND));
  } catch {
    return null;
  }
};
