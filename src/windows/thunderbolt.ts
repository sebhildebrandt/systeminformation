import { nextTick } from '../common';
import { Thunderbolt } from '../common/types';
import { ps, psArray } from '../common/windows';

const parseType = (name: string): string => {
  if (name.toLowerCase().includes('host router') || name.toLowerCase().includes('controller')) {
    return 'host';
  }
  if (name.toLowerCase().includes('device router')) {
    return 'device';
  }
  return '';
};

export const thunderbolt = async (): Promise<Thunderbolt[]> => {
  await nextTick();
  try {
    // TB3 controllers appear as PCI devices named "Thunderbolt(TM) ...",
    // TB4/USB4 routers via the native USB4 stack (PNPClass 'USB4').
    // WMI exposes neither link speed nor router UUID.
    const data = await ps.exec(
      "@(Get-CimInstance Win32_PnPEntity | Where-Object { $_.PNPClass -eq 'USB4' -or $_.Name -like '*Thunderbolt*' } | Select-Object Name,DeviceID,PNPClass) | ConvertTo-Json -Depth 3"
    );
    return psArray(data).map((element: any) => {
      const name = (element.Name || '').trim();
      return {
        name,
        uuid: '',
        bus: null,
        type: parseType(name),
        speed: 0
      };
    });
  } catch {
    return [];
  }
};
