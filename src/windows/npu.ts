import { cloneObj, nextTick } from '../common';
import { NpuData } from '../common/types';
import { initNpuData } from '../common/defaults';
import { ps, psArray } from '../common/windows';

// vendor product names for NPUs: Intel "AI Boost", AMD "IPU Device"/XDNA, Qualcomm "Hexagon NPU"
const NPU_MATCH = /neural|\bnpu\b|ai boost|xdna|hexagon|ai accelerator|compute accelerator|ipu device/i;

const matchId = (deviceId: string, key: string): string => {
  const match = deviceId.match(new RegExp(`${key}_([0-9A-Fa-f]{4})`));
  return match ? match[1].toLowerCase() : '';
};

export const npu = async (): Promise<NpuData[]> => {
  await nextTick();
  const devices = psArray(await ps.exec('@(Get-CimInstance Win32_PnPEntity | Select-Object Name,DeviceID,Manufacturer,Service) | ConvertTo-Json -Depth 3'));
  return devices
    .filter((data: any) => NPU_MATCH.test(data.Name || ''))
    .map((data: any) => {
      const deviceId = data.DeviceID || '';
      return {
        ...cloneObj(initNpuData),
        vendor: (data.Manufacturer || '').trim(),
        name: (data.Name || '').trim(),
        vendorId: matchId(deviceId, 'VEN'),
        deviceId: matchId(deviceId, 'DEV'),
        driver: data.Service || ''
      };
    });
};
