import { nextTick } from './common';
import * as si from './index';

// all (quasi-)static data — mostly hardware information
export const getStaticData = async () => {
  await nextTick();
  const [
    version,
    system,
    bios,
    baseboard,
    chassis,
    os,
    uuid,
    versions,
    cpu,
    cpuFlags,
    gpu,
    displays,
    net,
    memLayout,
    diskLayout,
    audio,
    bluetooth,
    usb,
    printer,
    camera,
    keyboard,
    mouse,
    pci,
    thunderbolt,
    npu,
    wifiInterfaces,
    software
  ] = await Promise.all([
    si.version(),
    si.system(),
    si.bios(),
    si.baseboard(),
    si.chassis(),
    si.osInfo(),
    si.uuid(),
    si.versions(),
    si.cpu(),
    si.cpuFlags(),
    si.gpu(),
    si.displays(),
    si.networkInterfaces(),
    si.memLayout(),
    si.diskLayout(),
    si.audio(),
    si.bluetoothDevices(),
    si.usb(),
    si.printer(),
    si.camera(),
    si.keyboard(),
    si.mouse(),
    si.pci(),
    si.thunderbolt(),
    si.npu(),
    si.wifiInterfaces(),
    si.software()
  ]);
  return {
    version,
    system,
    bios,
    baseboard,
    chassis,
    os,
    uuid,
    versions,
    cpu: { ...cpu, flags: cpuFlags },
    gpu,
    displays,
    net,
    memLayout,
    diskLayout,
    audio,
    bluetooth,
    usb,
    printer,
    camera,
    keyboard,
    mouse,
    pci,
    thunderbolt,
    npu,
    wifiInterfaces,
    software
  };
};

// all dynamic data — e.g. for monitoring agents
// - srv:   comma separated list of services to monitor e.g. "mysql, apache, postgresql" ('*' = all)
// - iface: network interface for which to monitor network speed (default: first external interface)
export const getDynamicData = async (srv = '', iface = '') => {
  await nextTick();
  const [
    time,
    cpuCurrentSpeed,
    users,
    processes,
    currentLoad,
    temp,
    fans,
    networkStats,
    networkConnections,
    mem,
    battery,
    services,
    fsSize,
    fsStats,
    disksIO,
    wifiNetworks,
    wifiConnections,
    fsOpenFiles,
    blockDevices,
    inetLatency
  ] = await Promise.all([
    si.time(),
    si.cpuCurrentSpeed(),
    si.users(),
    si.processes(),
    si.currentLoad(),
    si.cpuTemperature(),
    si.fans(),
    (async () => si.networkStats(iface || (await si.networkInterfaceDefault()) || '*'))(),
    si.networkConnections(),
    si.mem(),
    si.battery(),
    si.services(srv || '*'),
    si.fsSize(),
    si.fsStats(),
    si.disksIO(),
    si.wifiNetworks(),
    si.wifiConnections(),
    si.fsOpenFiles(),
    si.blockDevices(),
    si.inetLatency('8.8.8.8')
  ]);
  return {
    time,
    node: process.versions.node,
    v8: process.versions.v8,
    cpuCurrentSpeed,
    users,
    processes,
    currentLoad,
    temp,
    fans,
    networkStats,
    networkConnections,
    mem,
    battery,
    services,
    fsSize,
    fsStats,
    disksIO,
    wifiNetworks,
    wifiConnections,
    fsOpenFiles,
    blockDevices,
    inetLatency
  };
};

// all data at once (static + dynamic)
export const getAllData = async (srv = '', iface = '') => {
  return { ...(await getStaticData()), ...(await getDynamicData(srv, iface)) };
};
