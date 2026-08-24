import { cloneObj, nextTick } from '../common';
import { PciData } from '../common/types';
import { initPciData } from '../common/defaults';
import { ps, psArray } from '../common/windows';

const matchId = (deviceId: string, key: string, len: number): string => {
  const match = deviceId.match(new RegExp(`${key}_([0-9A-Fa-f]{${len}})`));
  return match ? match[1].toLowerCase() : '';
};

const parsePci = (devices: any[]): PciData[] =>
  (devices || []).map((data: any) => {
    const deviceId = data.DeviceID || '';
    // SUBSYS is stored as DDDDVVVV (subdevice + subvendor)
    const subsys = matchId(deviceId, 'SUBSYS', 8);
    return {
      ...cloneObj(initPciData),
      slot: '',
      type: data.PNPClass || '',
      vendor: (data.Manufacturer || '').trim(),
      vendorId: matchId(deviceId, 'VEN', 4),
      model: (data.Name || '').trim(),
      deviceId: matchId(deviceId, 'DEV', 4),
      subVendorId: subsys ? subsys.slice(4, 8) : '',
      subDeviceId: subsys ? subsys.slice(0, 4) : '',
      revision: matchId(deviceId, 'REV', 2),
      driver: data.Service || ''
    };
  });

export const pci = async (): Promise<PciData[]> => {
  await nextTick();
  const devices = psArray(
    await ps.exec(
      "@(Get-CimInstance Win32_PnPEntity | Where-Object { $_.DeviceID -like 'PCI*' } | Select-Object Name,DeviceID,Manufacturer,Service,PNPClass) | ConvertTo-Json -Depth 3"
    )
  );
  return parsePci(devices);
};
