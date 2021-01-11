const si = require('../lib/index');

function test(f) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      if (f === 'a') { si.audio().then(data => resolve({ data, title: 'Audio' }) )}
      else if (f === 'b') { si.bios().then(data => resolve({ data, title: 'BIOS' })) }
      else if (f === 'B') { si.baseboard().then(data => resolve({ data, title: 'Baseboard' })) }
      else if (f === 'C') { si.chassis().then(data => resolve({ data, title: 'Chassis' })) }
      else if (f === 'c') { si.cpu().then(data => resolve({ data, title: 'CPU' })) }
      else if (f === 'd') { si.diskLayout().then(data => resolve({ data, title: 'Disk Layout' })) }
      else if (f === 'D') { si.disksIO().then(data => resolve({ data, title: 'Disks IO' })) }
      else if (f === 'e') { si.blockDevices().then(data => resolve({ data, title: 'Block Devices' })) }
      else if (f === 'E') { si.fsOpenFiles().then(data => resolve({ data, title: 'Open Files' })) }
      else if (f === 'f') { si.fsSize().then(data => resolve({ data, title: 'File System' })) }
      else if (f === 'F') { si.fsStats().then(data => resolve({ data, title: 'FS Stats' })) }
      else if (f === 'g') { si.graphics().then(data => resolve({ data, title: 'Graphics' })) }
      else if (f === 'h') { si.bluetooth().then(data => resolve({ data, title: 'Bluetooth' })) }
      else if (f === 'i') { si.inetLatency().then(data => resolve({ data, title: 'Internet Latency' })) }
      else if (f === 'I') { si.inetChecksite('www.plus-innovations.com').then(data => resolve({ data, title: 'Internet Check Site' })) }
      else if (f === 'l') { si.cpuCurrentspeed().then(data => resolve({ data, title: 'CPU Current Speed' })) }
      else if (f === 'L') { si.fullLoad().then(data => resolve({ data, title: 'CPU Full Load' })) }
      else if (f === 'm') { si.mem().then(data => resolve({ data, title: 'Memory' })) }
      else if (f === 'M') { si.memLayout().then(data => resolve({ data, title: 'Memory Layout' })) }
      else if (f === 'o') { si.osInfo().then(data => resolve({ data, title: 'OS Info' })) }
      else if (f === 'p') { si.processes().then(data => resolve({ data, title: 'Processes' })) }
      else if (f === 'P') { si.processLoad('postgres').then(data => resolve({ data, title: 'Process Load' })) }
      else if (f === 'r') { si.printer().then(data => resolve({ data, title: 'Printer' })) }
      else if (f === 's') { si.services('apache2, postgres').then(data => resolve({ data, title: 'Services' })) }
      else if (f === 'S') { si.shell().then(data => resolve({ data, title: 'Shell' })) }
      else if (f === 't') { resolve({ data: si.time(), title: 'Time' }) }
      else if (f === 'T') { si.cpuTemperature().then(data => resolve({ data, title: 'CPU Temperature' })) }
      else if (f === 'u') { si.usb().then(data => resolve({ data, title: 'USB' })) }
      else if (f === 'U') { si.uuid().then(data => resolve({ data, title: 'UUID' })) }
      else if (f === 'v') { si.versions().then(data => resolve({ data, title: 'Versions' })) }
      else if (f === 'V') { si.vboxInfo().then(data => resolve({ data, title: 'Virtual Box' })) }
      else if (f === 'w') { si.wifiNetworks().then(data => resolve({ data, title: 'WIFI Networks' })) }
      else if (f === 'y') { si.battery().then(data => resolve({ data, title: 'Battery' })) }
      else if (f === 'z') { si.users().then(data => resolve({ data, title: 'Users' })) }
      else resolve();
    })
  })
}

const key = process.argv[2];

// console.log(process.argv);

test(key).then(data => {
  console.log(JSON.stringify(data));
})
