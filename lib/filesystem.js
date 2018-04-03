'use strict';
// ==================================================================================
// filesystem.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2018
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 8. File System
// ----------------------------------------------------------------------------------

const exec = require('child_process').exec;
const execSync = require('child_process').execSync;
const util = require('./util');

let _platform = process.platform;

const _linux = (_platform === 'linux');
const _darwin = (_platform === 'darwin');
const _windows = (_platform === 'win32');
const _freebsd = (_platform === 'freebsd');
const _openbsd = (_platform === 'openbsd');

const NOT_SUPPORTED = 'not supported';

const opts = {
  windowsHide: true
};

let _fs_speed = {};
let _disk_io = {};

// --------------------------
// FS - mounted file systems

function fsSize(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      let data = [];
      if (_linux || _freebsd || _openbsd || _darwin) {
        let cmd = '';
        if (_darwin) cmd = 'df -lkP | grep ^/';
        if (_linux) cmd = 'df -lkPT | grep ^/';
        if (_freebsd || _openbsd) cmd = 'df -lkPT';
        exec(cmd, function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            //lines.splice(0, 1);
            lines.forEach(function (line) {
              if (line !== '') {
                line = line.replace(/ +/g, ' ').split(' ');
                if (line && (line[0].startsWith('/')) || (line[6] && line[6] === '/')) {
                  data.push({
                    'fs': line[0],
                    'type': ((_linux || _freebsd || _openbsd) ? line[1] : 'HFS'),
                    'size': parseInt(((_linux || _freebsd || _openbsd) ? line[2] : line[1])) * 1024,
                    'used': parseInt(((_linux || _freebsd || _openbsd) ? line[3] : line[2])) * 1024,
                    'use': parseFloat((100.0 * ((_linux || _freebsd || _openbsd) ? line[3] : line[2]) / ((_linux || _freebsd || _openbsd) ? line[2] : line[1])).toFixed(2)),
                    'mount': line[line.length - 1]
                  });  
                }
              }
            });
          }
          if (callback) {
            callback(data);
          }
          resolve(data);
        });
      }
      if (_windows) {
        exec(util.getWmic() + ' logicaldisk get Caption,FileSystem,FreeSpace,Size', opts, function (error, stdout) {
          let lines = stdout.split('\r\n').filter(line => line.trim() !== '').filter((line, idx) => idx > 0);
          lines.forEach(function (line) {
            if (line !== '') {
              line = line.trim().split(/\s\s+/);
              data.push({
                'fs': line[0],
                'type': line[1],
                'size': line[3],
                'used': parseInt(line[3]) - parseInt(line[2]),
                'use': parseFloat((100.0 * (parseInt(line[3]) - parseInt(line[2]))) / parseInt(line[3])),
                'mount': line[0]
              });
            }
          });
          if (callback) {
            callback(data);
          }
          resolve(data);
        });
      }
    });
  });
}

exports.fsSize = fsSize;

// --------------------------
// disks

function parseBytes(s) {
  return parseInt(s.substr(s.indexOf(' (') + 2, s.indexOf(' Bytes)') - 10));
}

function parseDevices(lines) {
  let devices = [];
  let i = 0;
  lines.forEach(line => {
    if (line.length > 0) {
      if (line[0] === '*') {
        i++;
      } else {
        let parts = line.split(':');
        if (parts.length > 1) {
          if (!devices[i]) devices[i] = {
            name: '',
            identifier: '',
            type: 'disk',
            fstype: '',
            mount: '',
            size: 0,
            physical: 'HDD',
            uuid: '',
            label: '',
            model: '',
            serial: '',
            removable: false,
            protocol: ''
          };
          parts[0] = parts[0].trim().toUpperCase().replace(/ +/g, '');
          parts[1] = parts[1].trim();
          if ('DEVICEIDENTIFIER' === parts[0]) devices[i].identifier = parts[1];
          if ('DEVICENODE' === parts[0]) devices[i].name = parts[1];
          if ('VOLUMENAME' === parts[0]) {
            if (parts[1].indexOf('Not applicable') === -1) devices[i].label = parts[1];
          }
          if ('PROTOCOL' === parts[0]) devices[i].protocol = parts[1];
          if ('DISKSIZE' === parts[0]) devices[i].size = parseBytes(parts[1]);
          if ('FILESYSTEMPERSONALITY' === parts[0]) devices[i].fstype = parts[1];
          if ('MOUNTPOINT' === parts[0]) devices[i].mount = parts[1];
          if ('VOLUMEUUID' === parts[0]) devices[i].uuid = parts[1];
          if ('READ-ONLYMEDIA' === parts[0] && parts[1] === 'Yes') devices[i].physical = 'CD/DVD';
          if ('SOLIDSTATE' === parts[0] && parts[1] === 'Yes') devices[i].physical = 'SSD';
          if ('VIRTUAL' === parts[0]) devices[i].type = 'virtual';
          if ('REMOVABLEMEDIA' === parts[0]) devices[i].removable = (parts[1] === 'Removable');
          if ('PARTITIONTYPE' === parts[0]) devices[i].type = 'part';
          if ('DEVICE/MEDIANAME' === parts[0]) devices[i].model = parts[1];
        }
      }
    }
  });
  return devices;
}

function parseBlk(lines) {
  let data = [];

  lines.filter(line => line !== '').forEach((line) => {
    line = util.decodeEscapeSequence(line);
    line = line.replace(/\\/g,'\\\\');
    let disk = JSON.parse(line);
    data.push({
      'name': disk.name,
      'type': disk.type,
      'fstype': disk.fstype,
      'mount': disk.mountpoint,
      'size': parseInt(disk.size),
      'physical': (disk.type === 'disk' ? (disk.rota === '0' ? 'SSD' : 'HDD') : (disk.type === 'rom' ? 'CD/DVD' : '')),
      'uuid': disk.uuid,
      'label': disk.label,
      'model': disk.model,
      'serial': disk.serial,
      'removable': disk.rm === '1',
      'protocol': disk.tran
    });
  });

  data = util.unique(data);
  data = util.sortByKey(data, ['type', 'name']);
  return data;
}

function blkStdoutToObject(stdout) {
  return stdout.toString()
    .replace(/NAME=/g, '{"name":')
    .replace(/FSTYPE=/g, ',"fstype":')
    .replace(/TYPE=/g, ',"type":')
    .replace(/SIZE=/g, ',"size":')
    .replace(/MOUNTPOINT=/g, ',"mountpoint":')
    .replace(/UUID=/g, ',"uuid":')
    .replace(/ROTA=/g, ',"rota":')
    .replace(/RO=/g, ',"ro":')
    .replace(/RM=/g, ',"rm":')
    .replace(/TRAN=/g, ',"tran":')
    .replace(/SERIAL=/g, ',"serial":')
    .replace(/LABEL=/g, ',"label":')
    .replace(/MODEL=/g, ',"model":')
    .replace(/OWNER=/g, ',"owner":')
    .replace(/\n/g, '}\n');
}

function blockDevices(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      let data = [];
      if (_linux) {
        // see https://wiki.ubuntuusers.de/lsblk/
        // exec("lsblk -bo NAME,TYPE,SIZE,FSTYPE,MOUNTPOINT,UUID,ROTA,RO,TRAN,SERIAL,LABEL,MODEL,OWNER,GROUP,MODE,ALIGNMENT,MIN-IO,OPT-IO,PHY-SEC,LOG-SEC,SCHED,RQ-SIZE,RA,WSAME", function (error, stdout) {
        exec('lsblk -bPo NAME,TYPE,SIZE,FSTYPE,MOUNTPOINT,UUID,ROTA,RO,RM,TRAN,SERIAL,LABEL,MODEL,OWNER', function (error, stdout) {
          if (!error) {
            let lines = blkStdoutToObject(stdout).split('\n');
            data = parseBlk(lines);
            if (callback) {
              callback(data);
            }
            resolve(data);
          } else {
            exec('lsblk -bPo NAME,TYPE,SIZE,FSTYPE,MOUNTPOINT,UUID,ROTA,RO,RM,LABEL,MODEL,OWNER', function (error, stdout) {
              if (!error) {
                let lines = blkStdoutToObject(stdout).split('\n');
                data = parseBlk(lines);
              }
              if (callback) {
                callback(data);
              }
              resolve(data);
            });
          }
        });
      }
      if (_darwin) {
        exec('diskutil info -all', function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            // parse lines into temp array of devices
            data = parseDevices(lines);
          }
          if (callback) {
            callback(data);
          }
          resolve(data);
        });
      }
      if (_windows) {
        let drivetypes = ['Unknown', 'NoRoot', 'Removable', 'HDD', 'Network', 'CD/DVD', 'RAM'];
        exec(util.getWmic() + ' logicaldisk get Caption,Description,DeviceID,DriveType,FileSystem,FreeSpace,Name,Size,VolumeName,VolumeSerialNumber /value', opts, function (error, stdout) {
          if (!error) {
            let devices = stdout.toString().split(/\n\s*\n/);
            devices.forEach(function (device) {
              let lines = device.split('\r\n');
              let drivetype = util.getValue(lines, 'drivetype', '=');
              if (drivetype) {
                data.push({
                  name: util.getValue(lines, 'name', '='),
                  identifier: util.getValue(lines, 'caption', '='),
                  type: 'disk',
                  fstype: util.getValue(lines, 'filesystem', '=').toLowerCase(),
                  mount: util.getValue(lines, 'caption', '='),
                  size: util.getValue(lines, 'size', '='),
                  physical: (drivetype >= 0 && drivetype <= 6) ? drivetypes[drivetype] : drivetypes[0],
                  uuid: util.getValue(lines, 'volumeserialnumber', '='),
                  label: util.getValue(lines, 'volumename', '='),
                  model: '',
                  serial: util.getValue(lines, 'volumeserialnumber', '='),
                  removable: drivetype === '2',
                  protocol: ''
                });
              }
            });              
          }
          if (callback) {
            callback(data);
          }
          resolve(data);
        });
      }
    });
  });
}

exports.blockDevices = blockDevices;

// --------------------------
// FS - speed

function calcFsSpeed(rx, wx) {
  let result = {
    rx: 0,
    wx: 0,
    tx: 0,
    rx_sec: -1,
    wx_sec: -1,
    tx_sec: -1,
    ms: 0
  };

  if (_fs_speed && _fs_speed.ms) {
    result.rx = rx;
    result.wx = wx;
    result.tx = result.rx + result.wx;
    result.ms = Date.now() - _fs_speed.ms;
    result.rx_sec = (result.rx - _fs_speed.bytes_read) / (result.ms / 1000);
    result.wx_sec = (result.wx - _fs_speed.bytes_write) / (result.ms / 1000);
    result.tx_sec = result.rx_sec + result.wx_sec;
    _fs_speed.rx_sec = result.rx_sec;
    _fs_speed.wx_sec = result.wx_sec;
    _fs_speed.tx_sec = result.tx_sec;
    _fs_speed.bytes_read = result.rx;
    _fs_speed.bytes_write = result.wx;
    _fs_speed.bytes_overall = result.rx + result.wx;
    _fs_speed.ms = Date.now();
    _fs_speed.last_ms = result.ms;
  } else {
    result.rx = rx;
    result.wx = wx;
    result.tx = result.rx + result.wx;
    _fs_speed.rx_sec = -1;
    _fs_speed.wx_sec = -1;
    _fs_speed.tx_sec = -1;
    _fs_speed.bytes_read = result.rx;
    _fs_speed.bytes_write = result.wx;
    _fs_speed.bytes_overall = result.rx + result.wx;
    _fs_speed.ms = Date.now();
    _fs_speed.last_ms = 0;
  }
  return result;
}

function fsStats(callback) {

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) {
          callback(NOT_SUPPORTED);
        }
        reject(error);
      }

      let result = {
        rx: 0,
        wx: 0,
        tx: 0,
        rx_sec: -1,
        wx_sec: -1,
        tx_sec: -1,
        ms: 0
      };

      let rx = 0;
      let wx = 0;
      if ((_fs_speed && !_fs_speed.ms) || (_fs_speed && _fs_speed.ms && Date.now() - _fs_speed.ms >= 500)) {
        if (_linux) {
          // exec("df -k | grep /dev/", function(error, stdout) {
          exec('lsblk | grep /', function (error, stdout) {
            if (!error) {
              let lines = stdout.toString().split('\n');
              let fs_filter = [];
              lines.forEach(function (line) {
                if (line !== '') {
                  line = line.replace(/[├─│└]+/g, '').trim().split(' ');
                  if (fs_filter.indexOf(line[0]) === -1) fs_filter.push(line[0]);
                }
              });

              let output = fs_filter.join('|');
              exec('cat /proc/diskstats | egrep "' + output + '"', function (error, stdout) {
                if (!error) {
                  let lines = stdout.toString().split('\n');
                  lines.forEach(function (line) {
                    line = line.trim();
                    if (line !== '') {
                      line = line.replace(/ +/g, ' ').split(' ');

                      rx += parseInt(line[5]) * 512;
                      wx += parseInt(line[9]) * 512;
                    }
                  });
                  result = calcFsSpeed(rx, wx);
                }
                if (callback) {
                  callback(result);
                }
                resolve(result);
              });
            } else {
              if (callback) {
                callback(result);
              }
              resolve(result);
            }
          });
        }
        if (_darwin) {
          exec('ioreg -c IOBlockStorageDriver -k Statistics -r -w0 | sed -n "/IOBlockStorageDriver/,/Statistics/p" | grep "Statistics" | tr -cd "01234567890,\n"', function (error, stdout) {
            if (!error) {
              let lines = stdout.toString().split('\n');
              lines.forEach(function (line) {
                line = line.trim();
                if (line !== '') {
                  line = line.split(',');

                  rx += parseInt(line[2]);
                  wx += parseInt(line[9]);
                }
              });
              result = calcFsSpeed(rx, wx);
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        }
      } else {
        result.ms = _fs_speed.last_ms;
        result.rx = _fs_speed.bytes_read;
        result.wx = _fs_speed.bytes_write;
        result.tx = _fs_speed.bytes_read + _fs_speed.bytes_write;
        result.rx_sec = _fs_speed.rx_sec;
        result.wx_sec = _fs_speed.wx_sec;
        result.tx_sec = _fs_speed.tx_sec;
        if (callback) {
          callback(result);
        }
        resolve(result);
      }
    });
  });
}

exports.fsStats = fsStats;

function calcDiskIO(rIO, wIO) {
  let result = {
    rIO: 0,
    wIO: 0,
    tIO: 0,
    rIO_sec: -1,
    wIO_sec: -1,
    tIO_sec: -1,
    ms: 0
  };
  if (_disk_io && _disk_io.ms) {
    result.rIO = rIO;
    result.wIO = wIO;
    result.tIO = rIO + wIO;
    result.ms = Date.now() - _disk_io.ms;
    result.rIO_sec = (result.rIO - _disk_io.rIO) / (result.ms / 1000);
    result.wIO_sec = (result.wIO - _disk_io.wIO) / (result.ms / 1000);
    result.tIO_sec = result.rIO_sec + result.wIO_sec;
    _disk_io.rIO = rIO;
    _disk_io.wIO = wIO;
    _disk_io.rIO_sec = result.rIO_sec;
    _disk_io.wIO_sec = result.wIO_sec;
    _disk_io.tIO_sec = result.tIO_sec;
    _disk_io.last_ms = result.ms;
    _disk_io.ms = Date.now();
  } else {
    result.rIO = rIO;
    result.wIO = wIO;
    result.tIO = rIO + wIO;
    _disk_io.rIO = rIO;
    _disk_io.wIO = wIO;
    _disk_io.rIO_sec = -1;
    _disk_io.wIO_sec = -1;
    _disk_io.tIO_sec = -1;
    _disk_io.last_ms = 0;
    _disk_io.ms = Date.now();
  }
  return result;
}

function disksIO(callback) {

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) {
          callback(NOT_SUPPORTED);
        }
        reject(error);
      }

      let result = {
        rIO: 0,
        wIO: 0,
        tIO: 0,
        rIO_sec: -1,
        wIO_sec: -1,
        tIO_sec: -1,
        ms: 0
      };
      let rIO = 0;
      let wIO = 0;

      if ((_disk_io && !_disk_io.ms) || (_disk_io && _disk_io.ms && Date.now() - _disk_io.ms >= 500)) {
        if (_linux || _freebsd || _openbsd) {
          // prints Block layer statistics for all mounted volumes
          // var cmd = "for mount in `lsblk | grep / | sed -r 's/│ └─//' | cut -d ' ' -f 1`; do cat /sys/block/$mount/stat | sed -r 's/ +/;/g' | sed -r 's/^;//'; done";
          // var cmd = "for mount in `lsblk | grep / | sed 's/[│└─├]//g' | awk '{$1=$1};1' | cut -d ' ' -f 1 | sort -u`; do cat /sys/block/$mount/stat | sed -r 's/ +/;/g' | sed -r 's/^;//'; done";
          let cmd = 'for mount in `lsblk | grep " disk " | sed "s/[│└─├]//g" | awk \'{$1=$1};1\' | cut -d " " -f 1 | sort -u`; do cat /sys/block/$mount/stat | sed -r "s/ +/;/g" | sed -r "s/^;//"; done';

          exec(cmd, function (error, stdout) {
            if (!error) {
              let lines = stdout.split('\n');
              lines.forEach(function (line) {
                // ignore empty lines
                if (!line) return;

                // sum r/wIO of all disks to compute all disks IO
                let stats = line.split(';');
                rIO += parseInt(stats[0]);
                wIO += parseInt(stats[4]);
              });
              result = calcDiskIO(rIO, wIO);

              if (callback) {
                callback(result);
              }
              resolve(result);
            } else {
              if (callback) {
                callback(result);
              }
              resolve(result);
            }
          });
        }
        if (_darwin) {
          exec('ioreg -c IOBlockStorageDriver -k Statistics -r -w0 | sed -n "/IOBlockStorageDriver/,/Statistics/p" | grep "Statistics" | tr -cd "01234567890,\n"', function (error, stdout) {
            if (!error) {
              let lines = stdout.toString().split('\n');
              lines.forEach(function (line) {
                line = line.trim();
                if (line !== '') {
                  line = line.split(',');

                  rIO += parseInt(line[10]);
                  wIO += parseInt(line[0]);
                }
              });
              result = calcDiskIO(rIO, wIO);
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        }
      } else {
        result.rIO = _disk_io.rIO;
        result.wIO = _disk_io.wIO;
        result.tIO = _disk_io.rIO + _disk_io.wIO;
        result.ms = _disk_io.last_ms;
        result.rIO_sec = _disk_io.rIO_sec;
        result.wIO_sec = _disk_io.wIO_sec;
        result.tIO_sec = _disk_io.tIO_sec;
        if (callback) {
          callback(result);
        }
        resolve(result);
      }
    });
  });
}

exports.disksIO = disksIO;

function diskLayout(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {

      let result = [];

      if (_linux) {
        exec('export LC_ALL=C; lshw -class disk; unset LC_ALL', function (error, stdout) {
          if (!error) {
            let devices = stdout.toString().split('*-');
            devices.shift();
            devices.forEach(function (device) {
              let lines = device.split('\n');
              let mediumType = '';
              const logical = util.getValue(lines, 'logical name', ':', true).trim().replace(/\/dev\//g, '');
              try {
                mediumType = execSync('cat /sys/block/' + logical + '/queue/rotational').toString().split('\n')[0];
              } catch (e) {
                util.noop();
              }

              const sizeString = util.getValue(lines, 'size', ':', true).trim();
              if (sizeString && lines.length > 0 && lines[0].trim() === 'disk') {
                const sizeValue = sizeString.match(/\(([^)]+)\)/)[1];
                result.push({
                  type: (mediumType === '0' ? 'SSD' : (mediumType === '1' ? 'HD' : (device.indexOf('SSD') > -1 ? 'SSD' : 'HD'))), // to be tested ... /sys/block/sda/queue/rotational
                  name: util.getValue(lines, 'product:', ':', true),
                  vendor: util.getValue(lines, 'vendor:', ':', true),
                  size: parseInt(sizeValue, 10) * 1000 * 1000 * 1000 * (sizeValue.indexOf('T') >= 0 ? 1000 : 1),
                  bytesPerSector: -1,
                  totalCylinders: -1,
                  totalHeads: -1,
                  totalSectors: -1,
                  totalTracks: -1,
                  tracksPerCylinder: -1,
                  sectorsPerTrack: -1,
                  firmwareRevision: util.getValue(lines, 'version:', ':', true).trim(),
                  serialNum: util.getValue(lines, 'serial:', ':', true).trim(),
                  interfaceType: '',
                });
              }
            });
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_freebsd || _openbsd) {
        if (callback) { callback(result); }
        resolve(result);
      }      

      if (_darwin) {
        exec('system_profiler SPSerialATADataType SPNVMeDataType', function (error, stdout) {
          if (!error) {
            let parts = stdout.toString().split('NVMExpress:');

            let devices = parts[0].split(' Physical Interconnect: ');
            devices.shift();
            devices.forEach(function (device) {
              device = 'InterfaceType: ' + device;
              let lines = device.split('\n');
              const mediumType = util.getValue(lines, 'Medium Type', ':', true).trim();
              const sizeStr = util.getValue(lines, 'capacity', ':', true).trim();
              if (sizeStr) {
                let sizeValue = 0;
                if (sizeStr.indexOf('(') >= 0) {
                  sizeValue = parseInt(sizeStr.match(/\(([^)]+)\)/)[1].replace(/\./g, '').replace(/,/g, ''));
                } 
                if (!sizeValue) {
                  sizeValue = parseInt(sizeStr);
                }
                if (sizeValue) {
                  result.push({
                    type: mediumType.startsWith('Solid') ? 'SSD' : 'HD',
                    name: util.getValue(lines, 'Model', ':', true).trim(),
                    vendor: '',
                    size: sizeValue,
                    bytesPerSector: -1,
                    totalCylinders: -1,
                    totalHeads: -1,
                    totalSectors: -1,
                    totalTracks: -1,
                    tracksPerCylinder: -1,
                    sectorsPerTrack: -1,
                    firmwareRevision: util.getValue(lines, 'Revision', ':', true).trim(),
                    serialNum: util.getValue(lines, 'Serial Number', ':', true).trim(),
                    interfaceType: util.getValue(lines, 'InterfaceType', ':', true).trim()
                  });
                }
              }
            });
            if (parts.length > 1) {
              let devices = parts[1].split('\n\n          Capacity:');
              devices.shift();
              devices.forEach(function (device) {
                device = '!Capacity: ' + device;
                let lines = device.split('\n');
                const linkWidth = util.getValue(lines, 'link width', ':', true).trim();
                const sizeStr = util.getValue(lines, '!capacity', ':', true).trim();
                if (sizeStr) {
                  let sizeValue = 0;
                  if (sizeStr.indexOf('(') >= 0) {
                    sizeValue = parseInt(sizeStr.match(/\(([^)]+)\)/)[1].replace(/\./g, '').replace(/,/g, ''));
                  } 
                  if (!sizeValue) {
                    sizeValue = parseInt(sizeStr);
                  }
                  if (sizeValue) {
                    result.push({
                      type: 'NVMe',
                      name: util.getValue(lines, 'Model', ':', true).trim(),
                      vendor: '',
                      size: sizeValue,
                      bytesPerSector: -1,
                      totalCylinders: -1,
                      totalHeads: -1,
                      totalSectors: -1,
                      totalTracks: -1,
                      tracksPerCylinder: -1,
                      sectorsPerTrack: -1,
                      firmwareRevision: util.getValue(lines, 'Revision', ':', true).trim(),
                      serialNum: util.getValue(lines, 'Serial Number', ':', true).trim(),
                      interfaceType: ('PCIe ' + linkWidth).trim(),
                    });
                  }
                }
              });
            }
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_windows) {

        exec(util.getWmic() + ' diskdrive get /value', {encoding: 'utf8', windowsHide: true}, function (error, stdout) {
          if (!error) {
            let devices = stdout.toString().split(/\n\s*\n/);
            devices.forEach(function (device) {
              let lines = device.split('\r\n');
              const size = util.getValue(lines, 'Size', '=').trim();
              if (size) {
                result.push({
                  type: device.indexOf('SSD') > -1 ? 'SSD' : 'HD',  // not really correct(!) ... maybe this one is better: MSFT_PhysicalDisk - Media Type??
                  name: util.getValue(lines, 'Caption', '='),
                  vendor: util.getValue(lines, 'Manufacturer', '='),
                  size: parseInt(size),
                  bytesPerSector: parseInt(util.getValue(lines, 'BytesPerSector', '=')),
                  totalCylinders: parseInt(util.getValue(lines, 'TotalCylinders', '=')),
                  totalHeads: parseInt(util.getValue(lines, 'TotalHeads', '=')),
                  totalSectors: parseInt(util.getValue(lines, 'TotalSectors', '=')),
                  totalTracks: parseInt(util.getValue(lines, 'TotalTracks', '=')),
                  tracksPerCylinder: parseInt(util.getValue(lines, 'TracksPerCylinder', '=')),
                  sectorsPerTrack: parseInt(util.getValue(lines, 'SectorsPerTrack', '=')),
                  firmwareRevision: util.getValue(lines, 'FirmwareRevision', '=').trim(),
                  serialNum: util.getValue(lines, 'SerialNumber', '=').trim(),
                  interfaceType: util.getValue(lines, 'InterfaceType', '=').trim()
                });
              }
            });
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
    });
  });
}

exports.diskLayout = diskLayout;
