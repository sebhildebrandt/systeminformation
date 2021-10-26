import { execCmd } from '../common/exec';
import { toInt, getValue, nextTick } from '../common';
import { WifiInterfaceData } from '../common/types';

type ifaceList = {
  id: number,
  iface: string,
  mac: string,
  channel: number;
};
const ifaceListLinux = async () => {
  const result: ifaceList[] = [];
  const cmd = 'iw dev';
  try {
    const all = (await execCmd(cmd)).toString().split('\n').map((line: string) => line.trim()).join('\n');
    const parts = all.split('\nInterface ');
    parts.shift();
    parts.forEach((ifaceDetails: string) => {
      const lines = ifaceDetails.split('\n');
      const iface = lines[0];
      const id = toInt(getValue(lines, 'ifindex', ' '));
      const mac = getValue(lines, 'addr', ' ');
      const channel = toInt(getValue(lines, 'channel', ' '));
      result.push({
        id,
        iface,
        mac,
        channel
      });
    });
    return result;
  } catch (e) {
    return [];
  }
};

const nmiDeviceLinux = async (iface: string) => {
  const cmd = `nmcli -t -f general,wifi-properties,capabilities,ip4,ip6 device show ${iface} 2>/dev/null`;
  try {
    const lines = (await execCmd(cmd)).toString().split('\n');
    const ssid = getValue(lines, 'GENERAL.CONNECTION');
    return {
      iface,
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
  const ifaces = await ifaceListLinux();
  ifaces.forEach(async (ifaceDetail) => {
    const nmiDetails = await nmiDeviceLinux(ifaceDetail.iface);
    result.push({
      id: '' + ifaceDetail.id,
      iface: ifaceDetail.iface,
      model: nmiDetails.product ? nmiDetails.product : null,
      vendor: nmiDetails.vendor ? nmiDetails.vendor : null,
      mac: ifaceDetail.mac,
    });
  });
  return result;
};

export const wifiInterfaces = async () => {
  await nextTick();
  return linuxWifiInterfaces();
};
