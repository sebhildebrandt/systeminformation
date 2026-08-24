import { exec } from '../common/exec';
import { toInt, getValue, nextTick } from '../common';
import { WifiInterfaceData } from '../common/types';
import { sanitizeShellString } from '../common/security';
import { execOptsLinux } from '../common/const';

type interfaceList = {
  id: number;
  networkInterface: string;
  mac: string;
  channel: number;
};
const interfaceListLinux = async () => {
  const result: interfaceList[] = [];
  try {
    const { stdout } = await exec('iw dev 2>/dev/null', execOptsLinux);
    const all = stdout
      .split('\n')
      .map((line: string) => line.trim())
      .join('\n');
    const parts = all.split('\nInterface ').splice(1);
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
    try {
      const { stdout } = await exec('nmcli -t -f general,wifi-properties,wired-properties,interface-flags,capabilities,nsp device show 2>/dev/null', execOptsLinux);
      const parts = stdout.split('\nGENERAL.DEVICE:');
      let i = 1;
      parts.forEach((ifaceDetails) => {
        const lines = ifaceDetails.split('\n');
        const networkInterface = getValue(lines, 'GENERAL.DEVICE');
        const type = getValue(lines, 'GENERAL.TYPE');
        const id = i++;
        const mac = getValue(lines, 'GENERAL.HWADDR');
        const channel = 0;
        if (type.toLowerCase() === 'wifi') {
          result.push({
            id,
            networkInterface,
            mac,
            channel
          });
        }
      });
      return result;
    } catch (e) {
      return [];
    }
  }
};

const nmiDeviceLinux = async (networkInterface: string) => {
  const cmd = `nmcli -t -f general,wifi-properties,capabilities,ip4,ip6 device show ${networkInterface} 2>/dev/null`;
  try {
    const { stdout } = await exec(cmd, execOptsLinux);
    const lines = stdout.split('\n');
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

export const wifiInterfaces = async () => {
  await nextTick();
  const result: WifiInterfaceData[] = [];
  const interfaces = await interfaceListLinux();
  for (const interfaceDetail of interfaces) {
    const networkInterface = sanitizeShellString(interfaceDetail.networkInterface, true);
    const nmiDetails = await nmiDeviceLinux(networkInterface);
    result.push({
      id: '' + interfaceDetail.id,
      networkInterface: interfaceDetail.networkInterface,
      model: nmiDetails.product ? nmiDetails.product : null,
      vendor: nmiDetails.vendor ? nmiDetails.vendor : null,
      mac: interfaceDetail.mac
    });
  }
  return result;
};
