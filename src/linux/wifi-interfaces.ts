import { execCmd } from '../common/exec';
import { toInt, getValue, nextTick } from '../common';
import { WifiInterfaceData } from '../common/types';

type interfaceList = {
  id: number,
  networkInterface: string,
  mac: string,
  channel: number;
};
const interfaceListLinux = async () => {
  const result: interfaceList[] = [];
  const cmd = 'iw dev';
  try {
    const all = (await execCmd(cmd)).toString().split('\n').map((line: string) => line.trim()).join('\n');
    const parts = all.split('\nInterface ');
    parts.shift();
    parts.forEach((interfaceDetails: string) => {
      const lines = interfaceDetails.split('\n');
      const networkInterface = lines[0];
      const id = toInt(getValue(lines, 'ifindex', ' '));
      const mac = getValue(lines, 'addr', ' ');
      const channel = toInt(getValue(lines, 'channel', ' '));
      result.push({
        id,
        networkInterface,
        mac,
        channel
      });
    });
    return result;
  } catch (e) {
    return [];
  }
};

const nmiDeviceLinux = async (networkInterface: string) => {
  const cmd = `nmcli -t -f general,wifi-properties,capabilities,ip4,ip6 device show ${networkInterface} 2>/dev/null`;
  try {
    const lines = (await execCmd(cmd)).toString().split('\n');
    const ssid = getValue(lines, 'GENERAL.CONNECTION');
    return {
      interface: networkInterface,
      type: getValue(lines, 'GENERAL.TYPE'),
      vendor: getValue(lines, 'GENERAL.VENDOR'),
      product: getValue(lines, 'GENERAL.PRODUCT'),
      mac: getValue(lines, 'GENERAL.HWADDR').toLowerCase(),
      ssid: ssid !== '--' ? ssid : null
    };
  } catch (e) {
    return {};
  }
};

export const linuxWifiInterfaces = async () => {
  const result: WifiInterfaceData[] = [];
  const interfaces = await interfaceListLinux();
  interfaces.forEach(async (interfaceDetail) => {
    const nmiDetails = await nmiDeviceLinux(interfaceDetail.networkInterface);
    result.push({
      id: '' + interfaceDetail.id,
      networkInterface: interfaceDetail.networkInterface,
      model: nmiDetails.product ? nmiDetails.product : null,
      vendor: nmiDetails.vendor ? nmiDetails.vendor : null,
      mac: interfaceDetail.mac,
    });
  });
  return result;
};

export const wifiInterfaces = async () => {
  await nextTick();
  return linuxWifiInterfaces();
};
