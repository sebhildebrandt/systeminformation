// Shared key -> si.function() map, used by si.cjs (node/dist) and si.ts (bun/deno/src).
function run(si, f) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      f = f.replace(/'/g, '');
      if (f === 'a') { si.audio().then(data => { resolve({ data, title: 'Audio' }); }); }
      else if (f === 'A') { si.displays().then(data => { resolve({ data, title: 'Displays' }); }); }
      else if (f === 'b') { si.bios().then(data => { resolve({ data, title: 'BIOS' }); }); }
      else if (f === 'B') { si.baseboard().then(data => { resolve({ data, title: 'Baseboard' }); }); }
      else if (f === 'C') { si.chassis().then(data => { resolve({ data, title: 'Chassis' }); }); }
      else if (f === 'c') { si.cpu().then(data => { resolve({ data, title: 'CPU' }); }); }
      else if (f === 'd') { si.diskLayout().then(data => { resolve({ data, title: 'Disk Layout' }); }); }
      else if (f === 'D') { si.disksIO().then(data => { resolve({ data, title: 'Disks IO' }); }); }
      else if (f === 'e') { si.blockDevices().then(data => { resolve({ data, title: 'Block Devices' }); }); }
      else if (f === 'E') { si.fsOpenFiles().then(data => { resolve({ data, title: 'Open Files' }); }); }
      else if (f === 'f') { si.fsSize().then(data => { resolve({ data, title: 'File Size' }); }); }
      else if (f === 'F') { si.fsStats().then(data => { resolve({ data, title: 'FS Stats' }); }); }
      else if (f === 'g') { si.gpu().then(data => { resolve({ data, title: 'GPU' }); }); }
      else if (f === 'G') { si.pci().then(data => { resolve({ data, title: 'PCI' }); }); }
      else if (f === 'h') { si.bluetoothDevices().then(data => { resolve({ data, title: 'Bluetooth' }); }); }
      else if (f === 'H') { si.thunderbolt().then(data => { resolve({ data, title: 'Thunderbolt' }); }); }
      else if (f === 'i') { si.inetLatency().then(data => { resolve({ data, title: 'Internet Latency' }); }); }
      else if (f === 'I') { si.inetCheckSite('https://systeminformation.io').then(data => { resolve({ data, title: 'Internet Check Site' }); }); }
      else if (f === 'j') { si.inetPublicIp().then(data => { resolve({ data, title: 'Internet Public IP' }); }); }
      else if (f === 'J') { si.cpuCurrentSpeed().then(data => { resolve({ data, title: 'CPU Current Speed' }); }); }
      else if (f === 'k') { si.camera().then(data => { resolve({ data, title: 'Camera' }); }); }
      else if (f === 'K') { si.keyboard().then(data => { resolve({ data, title: 'Keyboard' }); }); }
      else if (f === 'l') { si.cpuCurrentLoad().then(data => { resolve({ data, title: 'CPU Current Load' }); }); }
      else if (f === 'L') { si.cpuFullLoad().then(data => { resolve({ data, title: 'CPU Full Load' }); }); }
      else if (f === 'm') { si.mem().then(data => { resolve({ data, title: 'Memory' }); }); }
      else if (f === 'M') { si.memLayout().then(data => { resolve({ data, title: 'Memory Layout' }); }); }
      else if (f === 'n') { si.npu().then(data => { resolve({ data, title: 'NPU' }); }); }
      else if (f === 'N') { si.npm().then(data => { resolve({ data, title: 'NPM Packages' }); }); }
      else if (f === 'o') { si.osInfo().then(data => { resolve({ data, title: 'OS Info' }); }); }
      else if (f === 'O') { si.mouse().then(data => { resolve({ data, title: 'Mouse/Trackpad' }); }); }
      else if (f === 'p') { si.processes().then(data => { resolve({ data, title: 'Processes' }); }); }
      else if (f === 'P') { si.processLoad('postgres, login, apache, mysql, nginx, git, node').then(data => { resolve({ data, title: 'Process Load' }); }); }
      else if (f === 'r') { si.processFocused().then(data => { resolve({ data, title: 'Process Focused' }); }); }
      else if (f === 'R') { si.software().then(data => { resolve({ data, title: 'Installed Software' }); }); }
      else if (f === 's') { si.services('apache2, postgres, wsearch').then(data => { resolve({ data, title: 'Services' }); }); }
      else if (f === 'S') { si.shell().then(data => { resolve({ data, title: 'Shell' }); }); }
      else if (f === 't') { si.time().then(data => { resolve({ data, title: 'Time' }); }); }
      else if (f === 'T') { si.cpuTemperature().then(data => { resolve({ data, title: 'CPU Temperature' }); }); }
      else if (f === '*') { si.fans().then(data => { resolve({ data, title: 'Fans' }); }); }
      else if (f === 'X') { si.serialPorts().then(data => { resolve({ data, title: 'Serial Ports' }); }); }
      else if (f === 'u') { si.usb().then(data => { resolve({ data, title: 'USB' }); }); }
      else if (f === 'U') { si.uuid().then(data => { resolve({ data, title: 'UUID' }); }); }
      else if (f === 'v') { si.versions().then(data => { resolve({ data, title: 'Versions' }); }); }
      else if (f === '-') { si.version().then(data => { resolve({ data, title: 'Version' }); }); }
      else if (f === 'V') { si.vboxInfo().then(data => { resolve({ data, title: 'Virtual Box' }); }); }
      else if (f === 'w') { si.wifiNetworks().then(data => { resolve({ data, title: 'WIFI Networks' }); }); }
      else if (f === 'W') { si.wifiInterfaces().then(data => { resolve({ data, title: 'WIFI Interfaces' }); }); }
      else if (f === 'x') { si.wifiConnections().then(data => { resolve({ data, title: 'WIFI Connections' }); }); }
      else if (f === 'y') { si.system().then(data => { resolve({ data, title: 'System' }); }); }
      else if (f === 'Y') { si.battery().then(data => { resolve({ data, title: 'Battery' }); }); }
      else if (f === 'z') { si.printer().then(data => { resolve({ data, title: 'Printer' }); }); }
      else if (f === 'Z') { si.users().then(data => { resolve({ data, title: 'Users' }); }); }
      else if (f === '#') { si.networkRoutes().then(data => { resolve({ data, title: 'NET Routes' }); }); }
      else if (f === '$') { si.diskSpeed().then(data => { resolve({ data, title: 'Disk Speed' }); }); }
      else if (f === '%') { si.inetSpeed().then(data => { resolve({ data, title: 'INET Speed' }); }); }
      else if (f === '1') { si.networkInterfaceDefault().then(data => { resolve({ data, title: 'NET Iface Default' }); }); }
      else if (f === '2') { si.networkGatewayDefault().then(data => { resolve({ data, title: 'NET Gateway Default' }); }); }
      else if (f === '3') { si.networkInterfaces().then(data => { resolve({ data, title: 'NET Interfaces' }); }); }
      else if (f === '4') { si.networkStats().then(data => { resolve({ data, title: 'NET Stats' }); }); }
      else if (f === '5') { si.networkConnections().then(data => { resolve({ data, title: 'NET Connections' }); }); }
      else if (f === '6') { si.dockerInfo().then(data => { resolve({ data, title: 'Docker Info' }); }); }
      else if (f === '7') { si.dockerImages().then(data => { resolve({ data, title: 'Docker Images' }); }); }
      else if (f === '8') { si.dockerContainers(true).then(data => { resolve({ data, title: 'Docker Containers' }); }); }
      else if (f === '9') { si.dockerContainerStats('*').then(data => { resolve({ data, title: 'Docker Cont Stats' }); }); }
      else if (f === '0') { si.dockerContainerProcesses('*').then(data => { resolve({ data, title: 'Docker Cont Processes' }); }); }
      else if (f === '+') { si.dockerVolumes().then(data => { resolve({ data, title: 'Docker Volumes' }); }); }
      else if (f === ',') { si.getStaticData().then(data => { resolve({ data, title: 'All Static Data' }); }); }
      else if (f === '.') { si.getDynamicData('apache2, postgres, wsearch').then(data => { resolve({ data, title: 'All Dynamic Data' }); }); }
      else if (f === '/') { si.getAllData('apache2, postgres, wsearch').then(data => { resolve({ data, title: 'All Data' }); }); }
      else if (f === '?') {
        const valueObject = {
          cpu: '*',
          osInfo: 'platform, release',
          system: 'model, manufacturer'
        };
        si.get(valueObject).then(data => resolve({ data, title: 'Get Object' }));
      }
      else { resolve('no_key'); }
    });
  });
}

module.exports = { run };
