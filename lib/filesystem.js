'use strict';
// ==================================================================================
// filesystem.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2017
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 8. File System
// ----------------------------------------------------------------------------------

const os = require('os');
const exec = require('child_process').exec;
const fs = require('fs');
const util = require('./util');

let _platform = os.type();

const _linux = (_platform === 'Linux');
const _darwin = (_platform === 'Darwin');
const _windows = (_platform === 'Windows_NT');
const NOT_SUPPORTED = 'not supported';

let _fs_speed = {};
let _disk_io = {};

// --------------------------
// FS - mounted file systems

function fsSize(callback) {

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      let data = [];
      if (_linux || _darwin) {
        let cmd = (_darwin ? "df -lkP | grep ^/" : "df -lkPT | grep ^/");
        exec(cmd, function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            //lines.splice(0, 1);
            lines.forEach(function (line) {
              if (line !== '') {
                line = line.replace(/ +/g, " ").split(' ');
                data.push({
                  'fs': line[0],
                  'type': (_linux ? line[1] : 'HFS'),
                  'size': parseInt((_linux ? line[2] : line[1])) * 1024,
                  'used': parseInt((_linux ? line[3] : line[2])) * 1024,
                  'use': parseFloat((100.0 * (_linux ? line[3] : line[2]) / (_linux ? line[2] : line[1])).toFixed(2)),
                  'mount': line[line.length - 1]
                })
              }
            });
          }
          if (callback) {
            callback(data)
          }
          resolve(data);
        });
      }
      if (_windows) {
        exec('wmic logicaldisk get Caption,FileSystem,FreeSpace,Size', function (error, stdout) {
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
              })
            }
          });
          if (callback) {
            callback(data)
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
  return parseInt(s.substr(s.indexOf(' (') + 2, s.indexOf(' Bytes)') - 10))
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
    })
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

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      let data = [];
      if (_linux) {
        // see https://wiki.ubuntuusers.de/lsblk/
        // exec("lsblk -bo NAME,TYPE,SIZE,FSTYPE,MOUNTPOINT,UUID,ROTA,RO,TRAN,SERIAL,LABEL,MODEL,OWNER,GROUP,MODE,ALIGNMENT,MIN-IO,OPT-IO,PHY-SEC,LOG-SEC,SCHED,RQ-SIZE,RA,WSAME", function (error, stdout) {
        exec("lsblk -bPo NAME,TYPE,SIZE,FSTYPE,MOUNTPOINT,UUID,ROTA,RO,RM,TRAN,SERIAL,LABEL,MODEL,OWNER", function (error, stdout) {
          if (!error) {
            let lines = blkStdoutToObject(stdout).split('\n');
            data = parseBlk(lines);
            if (callback) {
              callback(data)
            }
            resolve(data);
          } else {
            exec("lsblk -bPo NAME,TYPE,SIZE,FSTYPE,MOUNTPOINT,UUID,ROTA,RO,RM,LABEL,MODEL,OWNER", function (error, stdout) {
              if (!error) {
                let lines = blkStdoutToObject(stdout).split('\n');
                data = parseBlk(lines);
              }
              if (callback) {
                callback(data)
              }
              resolve(data);
            });
          }
        });
      }
      if (_darwin) {
        exec("diskutil info -all", function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            // parse lines into temp array of devices
            data = parseDevices(lines);
          }
          if (callback) {
            callback(data)
          }
          resolve(data);
        });
      }
      if (_windows) {
        exec('wmic logicaldisk get Caption,Description,DeviceID,DriveType,FileSystem,FreeSpace,Name,Size,VolumeName,VolumeSerialNumber /format:csv', function (error, stdout) {
          if (!error) {
            let lines = stdout.split('\r\n').filter(line => line.trim() !== '').filter((line, idx) => idx > 0);
            lines.forEach(function (line) {
              if (line !== '') {
                line = line.replace('\r', '').split(',');
                data.push({
                  name: line[7],
                  identifier: line[1],
                  type: 'disk',
                  fstype: line[5].toLowerCase(),
                  mount: line[1],
                  size: line[8],
                  physical: line[4] === '5' ? 'CD/DVD' : 'HDD',
                  uuid: line[10],
                  label: line[9],
                  model: '',
                  serial: line[10],
                  removable: line[4] === '2',
                  protocol: ''
                });
              }
            });
          }
          if (callback) {
            callback(data)
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
          callback(NOT_SUPPORTED)
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
//  		  exec("df -k | grep /dev/", function(error, stdout) {
          exec("lsblk | grep /", function (error, stdout) {
            if (!error) {
              let lines = stdout.toString().split('\n');
              let fs_filter = [];
              lines.forEach(function (line) {
                if (line !== '') {
                  line = line.replace(/[├─│└]+/g, "").trim().split(' ');
                  if (fs_filter.indexOf(line[0]) === -1) fs_filter.push(line[0])
                }
              });

              let output = fs_filter.join('|');
              exec("cat /proc/diskstats | egrep '" + output + "'", function (error, stdout) {
                if (!error) {
                  let lines = stdout.toString().split('\n');
                  lines.forEach(function (line) {
                    line = line.trim();
                    if (line !== '') {
                      line = line.replace(/ +/g, " ").split(' ');

                      rx += parseInt(line[5]) * 512;
                      wx += parseInt(line[9]) * 512;
                    }
                  });
                  result = calcFsSpeed(rx, wx);
                }
                if (callback) {
                  callback(result)
                }
                resolve(result);
              })
            } else {
              if (callback) {
                callback(result)
              }
              resolve(result);
            }
          })
        }
        if (_darwin) {
          exec("ioreg -c IOBlockStorageDriver -k Statistics -r -w0 | sed -n '/IOBlockStorageDriver/,/Statistics/p' | grep 'Statistics' | tr -cd '01234567890,\n' | awk -F',' '{print $3, $10}'", function (error, stdout) {
            if (!error) {
              let lines = stdout.toString().split('\n');
              lines.forEach(function (line) {
                line = line.trim();
                if (line !== '') {
                  line = line.split(' ');

                  rx += parseInt(line[0]);
                  wx += parseInt(line[1]);
                }
              });
              result = calcFsSpeed(rx, wx);
            }
            if (callback) {
              callback(result)
            }
            resolve(result);
          })
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
          callback(result)
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
          callback(NOT_SUPPORTED)
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
        if (_linux) {
          // prints Block layer statistics for all mounted volumes
          // var cmd = "for mount in `lsblk | grep / | sed -r 's/│ └─//' | cut -d ' ' -f 1`; do cat /sys/block/$mount/stat | sed -r 's/ +/;/g' | sed -r 's/^;//'; done";
          // var cmd = "for mount in `lsblk | grep / | sed 's/[│└─├]//g' | awk '{$1=$1};1' | cut -d ' ' -f 1 | sort -u`; do cat /sys/block/$mount/stat | sed -r 's/ +/;/g' | sed -r 's/^;//'; done";
          let cmd = "for mount in `lsblk | grep ' disk ' | sed 's/[│└─├]//g' | awk '{$1=$1};1' | cut -d ' ' -f 1 | sort -u`; do cat /sys/block/$mount/stat | sed -r 's/ +/;/g' | sed -r 's/^;//'; done";

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
                callback(result)
              }
              resolve(result);
            } else {
              if (callback) {
                callback(result)
              }
              resolve(result);
            }
          });
        }
        if (_darwin) {
          exec("ioreg -c IOBlockStorageDriver -k Statistics -r -w0 | sed -n '/IOBlockStorageDriver/,/Statistics/p' | grep 'Statistics' | tr -cd '01234567890,\n' | awk -F',' '{print $1, $11}'", function (error, stdout) {
            if (!error) {
              let lines = stdout.toString().split('\n');
              lines.forEach(function (line) {
                line = line.trim();
                if (line !== '') {
                  line = line.split(' ');

                  rIO += parseInt(line[1]);
                  wIO += parseInt(line[0]);
                }
              });
              result = calcDiskIO(rIO, wIO);
            }
            if (callback) {
              callback(result)
            }
            resolve(result);
          })
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
          callback(result)
        }
        resolve(result);
      }
    });
  });
}

exports.disksIO = disksIO;
