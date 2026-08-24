import { nextTick } from '../common';
import { plistParser } from '../common/darwin';
import { exec } from '../common/exec';
import type { WifiInterfaceData } from '../common/types';

export const wifiInterfaces = async () => {
  await nextTick();
  const result: WifiInterfaceData[] = [];
  const { stdout } = await exec('system_profiler SPNetworkDataType -xml');
  const networkData: any = plistParser(stdout);
  const wifiData = networkData.filter((item: any) => item._name === 'Wi-Fi');

  if (wifiData.length >= 1) {
    const networkInterface = wifiData[0].interface || '';
    const mac = wifiData[0].Ethernet?.['MAC Address'] ? wifiData[0].Ethernet['MAC Address'] : '';
    const model = wifiData[0].hardware || '';
    result.push({
      id: 'Wi-Fi',
      networkInterface,
      model,
      vendor: model === 'AirPort' ? 'Apple' : '',
      mac
    });
  }
  return result;
};
