import { execCmd } from '../common/exec';
import { getValue, nextTick } from '../common';
import { WifiInterfaceData } from '../common/types';

export const darwinWifiInterfaces = async () => {
  const result: WifiInterfaceData[] = [];
  const stdout = await execCmd('system_profiler SPNetworkDataType');
  const parts1 = stdout.toString().split('\n\n    Wi-Fi:\n\n');
  if (parts1.length > 1) {
    const lines = parts1[1].split('\n\n')[0].split('\n');
    const networkInterface = getValue(lines, 'BSD Device Name', ':', true);
    const mac = getValue(lines, 'MAC Address', ':', true);
    const model = getValue(lines, 'hardware', ':', true);
    result.push({
      id: 'Wi-Fi',
      networkInterface,
      model,
      vendor: '',
      mac
    });
  }
  return result;
};

export const wifiInterfaces = async () => {
  await nextTick();
  return darwinWifiInterfaces();
};
