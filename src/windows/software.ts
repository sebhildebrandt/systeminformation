import { nextTick } from '../common';
import type { Software } from '../common/types';
import { ps, psArray } from '../common/windows';

const parseInstallDate = (value: string): Date | null => {
  const match = ('' + (value || '')).trim().match(/^(\d{4})(\d{2})(\d{2})$/);
  if (!match) {
    return null;
  }
  const parsed = new Date(parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const parseSoftware = (entries: any[]): Software[] => {
  const result: Software[] = [];
  const seen = new Set<string>();
  entries.forEach((data: any) => {
    const name = ('' + (data.DisplayName || '')).trim();
    if (!name) {
      return;
    }
    const version = ('' + (data.DisplayVersion || '')).trim();
    const key = `${name}|${version}`;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    const publisher = ('' + (data.Publisher || '')).trim();
    // WOW6432Node holds 32-bit apps on 64-bit Windows
    const wow = ('' + (data.PSPath || '')).toLowerCase().includes('wow6432node');
    result.push({
      name,
      description: '',
      version,
      installDate: parseInstallDate(data.InstallDate),
      architecture: wow ? 'x86' : '',
      source: 'registry',
      path: ('' + (data.InstallLocation || '')).trim(),
      signedBy: publisher ? [publisher] : []
    });
  });
  return result;
};

export const software = async (): Promise<Software[]> => {
  await nextTick();
  try {
    const result = await ps.exec(
      "@(Get-ItemProperty 'HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*','HKLM:\\Software\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*','HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*' -ErrorAction SilentlyContinue | Where-Object { $_.DisplayName } | Select-Object DisplayName,DisplayVersion,Publisher,InstallDate,InstallLocation,PSPath) | ConvertTo-Json -Depth 2"
    );
    return parseSoftware(psArray(result));
  } catch {
    return [];
  }
};
