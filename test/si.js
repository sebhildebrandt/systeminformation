const si = require('../lib/index');

function test(f) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      f = f.replace(/'/g, '');
      // console.log(f);
      if (f === 'a') { si.audio().then(data => { if (data !== null) { resolve({ data, title: 'Audio' }); } else { resolve('not_supported') } }) }
      else if (f === 'b') { si.bios().then(data => { if (data !== null) { resolve({ data, title: 'BIOS' }); } else { resolve('not_supported') } }) }
      else if (f === 'B') { si.baseboard().then(data => { if (data !== null) { resolve({ data, title: 'Baseboard' }); } else { resolve('not_supported') } }) }
      else if (f === 'C') { si.chassis().then(data => { if (data !== null) { resolve({ data, title: 'Chassis' }); } else { resolve('not_supported') } }) }
      else if (f === 'c') { si.cpu().then(data => { if (data !== null) { resolve({ data, title: 'CPU' }); } else { resolve('not_supported') } }) }
      else if (f === 'd') { si.diskLayout().then(data => { if (data !== null) { resolve({ data, title: 'Disk Layout' }); } else { resolve('not_supported') } }) }
      else if (f === 'D') { si.disksIO().then(data => { if (data !== null) { resolve({ data, title: 'Disks IO' }); } else { resolve('not_supported') } }) }
      else if (f === 'e') { si.blockDevices().then(data => { if (data !== null) { resolve({ data, title: 'Block Devices' }); } else { resolve('not_supported') } }) }
      else if (f === 'E') { si.fsOpenFiles().then(data => { if (data !== null) { resolve({ data, title: 'Open Files' }); } else { resolve('not_supported') } }) }
      else if (f === 'f') { si.fsSize().then(data => { if (data !== null) { resolve({ data, title: 'File System' }); } else { resolve('not_supported') } }) }
      else if (f === 'F') { si.fsStats().then(data => { if (data !== null) { resolve({ data, title: 'FS Stats' }); } else { resolve('not_supported') } }) }
      else if (f === 'g') { si.graphics().then(data => { if (data !== null) { resolve({ data, title: 'Graphics' }); } else { resolve('not_supported') } }) }
      else if (f === 'h') { si.bluetoothDevices().then(data => { if (data !== null) { resolve({ data, title: 'Bluetooth' }); } else { resolve('not_supported') } }) }
      else if (f === 'i') { si.inetLatency().then(data => { if (data !== null) { resolve({ data, title: 'Internet Latency' }); } else { resolve('not_supported') } }) }
      else if (f === 'I') { si.inetChecksite('www.plus-innovations.com').then(data => { if (data !== null) { resolve({ data, title: 'Internet Check Site' }); } else { resolve('not_supported') } }) }
      else if (f === 'j') { si.cpuCurrentSpeed().then(data => { if (data !== null) { resolve({ data, title: 'CPU Current Speed' }); } else { resolve('not_supported') } }) }
      else if (f === 'l') { si.currentLoad().then(data => { if (data !== null) { resolve({ data, title: 'CPU Current Load' }); } else { resolve('not_supported') } }) }
      else if (f === 'L') { si.fullLoad().then(data => { if (data !== null) { resolve({ data, title: 'CPU Full Load' }); } else { resolve('not_supported') } }) }
      else if (f === 'm') { si.mem().then(data => { if (data !== null) { resolve({ data, title: 'Memory' }); } else { resolve('not_supported') } }) }
      else if (f === 'M') { si.memLayout().then(data => { if (data !== null) { resolve({ data, title: 'Memory Layout' }); } else { resolve('not_supported') } }) }
      else if (f === 'o') { si.osInfo().then(data => { if (data !== null) { resolve({ data, title: 'OS Info' }); } else { resolve('not_supported') } }) }
      else if (f === 'p') { si.processes().then(data => { if (data !== null) { resolve({ data, title: 'Processes' }); } else { resolve('not_supported') } }) }
      else if (f === 'P') { si.processLoad('postgres, login, apache, mysql, nginx, git').then(data => { if (data !== null) { resolve({ data, title: 'Process Load' }); } else { resolve('not_supported') } }) }
      else if (f === 'r') { si.printer().then(data => { if (data !== null) { resolve({ data, title: 'Printer' }); } else { resolve('not_supported') } }) }
      else if (f === 's') { si.services('apache2, postgres').then(data => { if (data !== null) { resolve({ data, title: 'Services' }); } else { resolve('not_supported') } }) }
      else if (f === 'S') { si.shell().then(data => { if (data !== null) { resolve({ data, title: 'Shell' }); } else { resolve('not_supported') } }) }
      else if (f === 't') { resolve({ data: si.time(), title: 'Time' }) }
      else if (f === 'T') { si.cpuTemperature().then(data => { if (data !== null) { resolve({ data, title: 'CPU Temperature' }); } else { resolve('not_supported') } }) }
      else if (f === 'u') { si.usb().then(data => { if (data !== null) { resolve({ data, title: 'USB' }); } else { resolve('not_supported') } }) }
      else if (f === 'U') { si.uuid().then(data => { if (data !== null) { resolve({ data, title: 'UUID' }); } else { resolve('not_supported') } }) }
      else if (f === 'v') { si.versions().then(data => { if (data !== null) { resolve({ data, title: 'Versions' }); } else { resolve('not_supported') } }) }
      else if (f === 'V') { si.vboxInfo().then(data => { if (data !== null) { resolve({ data, title: 'Virtual Box' }); } else { resolve('not_supported') } }) }
      else if (f === 'w') { si.wifiNetworks().then(data => { if (data !== null) { resolve({ data, title: 'WIFI Networks' }); } else { resolve('not_supported') } }) }
      else if (f === 'y') { si.system().then(data => { if (data !== null) { resolve({ data, title: 'System' }); } else { resolve('not_supported') } }) }
      else if (f === 'Y') { si.battery().then(data => { if (data !== null) { resolve({ data, title: 'Battery' }); } else { resolve('not_supported') } }) }
      else if (f === 'z') { si.users().then(data => { if (data !== null) { resolve({ data, title: 'Users' }); } else { resolve('not_supported') } }) }
      else if (f === '1') { si.networkInterfaceDefault().then(data => { if (data !== null) { resolve({ data, title: 'NET Iface Default' }); } else { resolve('not_supported') } }) }
      else if (f === '2') { si.networkGatewayDefault().then(data => { if (data !== null) { resolve({ data, title: 'NET Gateway Default' }); } else { resolve('not_supported') } }) }
      else if (f === '3') { si.networkInterfaces().then(data => { if (data !== null) { resolve({ data, title: 'NET Interfaces' }); } else { resolve('not_supported') } }) }
      else if (f === '4') { si.networkStats().then(data => { if (data !== null) { resolve({ data, title: 'NET Stats' }); } else { resolve('not_supported') } }) }
      else if (f === '5') { si.networkConnections().then(data => { if (data !== null) { resolve({ data, title: 'NET Connections' }); } else { resolve('not_supported') } }) }
      else if (f === '6') { si.dockerInfo().then(data => { if (data !== null) { resolve({ data, title: 'Docker Info' }); } else { resolve('not_supported') } }) }
      else if (f === '7') { si.dockerContainers(true).then(data => { if (data !== null) { resolve({ data, title: 'Docker Containers' }); } else { resolve('not_supported') } }) }
      else if (f === '8') { si.dockerContainerStats('1').then(data => { if (data !== null) { resolve({ data, title: 'Docker Cont Stats' }); } else { resolve('not_supported') } }) }
      else if (f === '9') { si.dockerContainerProcesses('1').then(data => { if (data !== null) { resolve({ data, title: 'Docker Cont Processes' }); } else { resolve('not_supported') } }) }
      else if (f === '0') { si.dockerAll().then(data => { if (data !== null) { resolve({ data, title: 'Docker All' }); } else { resolve('not_supported') } }) }
      else if (f === ',') { si.getStaticData().then(data => { if (data !== null) { resolve({ data, title: 'All Static Data' }); } else { resolve('not_supported') } }) }
      else if (f === '.') { si.getDynamicData('apache2, postgres').then(data => { if (data !== null) { resolve({ data, title: 'All Dynamic Data' }); } else { resolve('not_supported') } }) }
      else if (f === '/') { si.getAllData('apache2, postgres').then(data => { if (data !== null) { resolve({ data, title: 'All Data' }); } else { resolve('not_supported') } }) }
      else if (f === '?') {
        const valueObject = {
          cpu: '*',
          osInfo: 'platform, release',
          system: 'model, manufacturer'
        }
        si.get(valueObject).then(data => resolve({ data, title: 'Get Object' }))
      }
      else resolve('no_key');
    })
  })
}

const key = process.argv[2];
// console.log(process.argv)

// console.log(process.argv);

test(key).then(data => {
  console.log(JSON.stringify(data));
})
