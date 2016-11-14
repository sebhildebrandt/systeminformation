'use strict';
// ==================================================================================
// index.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2016
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

const _linux = (_platform == 'Linux');
const _darwin = (_platform == 'Darwin');
const _windows = (_platform == 'Windows_NT');
const NOT_SUPPORTED = 'not supported';

let _fs_speed = {};
let _disk_io = {};

// --------------------------
// FS - mounted file systems

function fsSize(callback) {

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) { callback(NOT_SUPPORTED) }
        reject(error);
      }

      exec("df -lkPT | grep ^/", function (error, stdout) {
        let data = [];
        if (!error) {
          let lines = stdout.toString().split('\n');
          //lines.splice(0, 1);
          lines.forEach(function (line) {
            if (line != '') {
              line = line.replace(/ +/g, " ").split(' ');
              data.push({
                'fs': line[0],
                'type': line[1],
                'size': parseInt(line[2]) * 1024,
                'used': parseInt(line[3]) * 1024,
                'use': parseFloat((100.0 * line[3] / line[2]).toFixed(2)),
                'mount': line[line.length - 1]
              })
            }
          });
        }
        if (callback) { callback(data) }
        resolve(data);
      });
    });
  });
}

exports.fsSize = fsSize;

// --------------------------
// disks

function blockDevices(callback) {

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) { callback(NOT_SUPPORTED) }
        reject(error);
      }

      if (_linux) {
        exec("lsblk -bo NAME,TYPE,SIZE,FSTYPE,MOUNTPOINT,UUID,ROTA,OWNER,GROUP,MODE,LABEL,ALIGNMENT,MIN-IO,OPT-IO,PHY-SEC,LOG-SEC,SCHED,RQ-SIZE,RA,WSAME", function (error, stdout) {
          let data = [];
          if (!error) {
            let lines = stdout.toString().split('\n');
            let header = lines[0];
            lines.splice(0, 1);
            lines.forEach(function (line) {
              if (line != '') {
                if (line.substr(header.indexOf('FSTYPE'), 1) == ' ') { line = line.substr(0, header.indexOf('FSTYPE')) + '-' + line.substr(header.indexOf('FSTYPE') + 1, 1000)}
                if (line.substr(header.indexOf('MOUNTPOINT'), 1) == ' ') { line = line.substr(0, header.indexOf('MOUNTPOINT')) + '-' + line.substr(header.indexOf('MOUNTPOINT') + 1, 1000)}
                if (line.substr(header.indexOf('UUID'), 1) == ' ') { line = line.substr(0, header.indexOf('UUID')) + '-' + line.substr(header.indexOf('UUID') + 1, 1000)}
                line = line.replace(/[├─│└]+/g, "");
                line = line.replace(/ +/g, " ").trim().split(' ');
                data.push({
                  'name': line[0],
                  'type': line[1],
                  'fstype': (line[3] == '-' ? '' : line[3]),
                  'mount': (line[4] == '-' ? '' : line[4]),
                  'size': parseInt(line[2]),
                  'physical': (line[1] == 'disk' ? (line[6] == '0' ? 'SSD' : 'HDD') : (line[1] == 'rom' ? 'CD/DVD' : '')),
                  'uuid': (line[5] == '-' ? '' : line[5])
                })
              }
            });
            data = util.unique(data);
            data = util.sortByKey(data, ['type', 'name']);
          }
          if (callback) {
            callback(data)
          }
          resolve(data);
        });
      }
      if (_darwin) {
        // last minute decision to remove code ... not stable
        let data = [];
        if (callback) {
          callback(data)
        }
        resolve(data);
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
        if (callback) { callback(NOT_SUPPORTED) }
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
                if (line != '') {
                  line = line.replace(/[├─│└]+/g, "").trim().split(' ');
                  if (fs_filter.indexOf(line[0]) == -1) fs_filter.push(line[0])
                }
              });

              let output = fs_filter.join('|');
              exec("cat /proc/diskstats | egrep '" + output + "'", function (error, stdout) {
                if (!error) {
                  let lines = stdout.toString().split('\n');
                  lines.forEach(function (line) {
                    line = line.trim();
                    if (line != '') {
                      line = line.replace(/ +/g, " ").split(' ');

                      rx += parseInt(line[5]) * 512;
                      wx += parseInt(line[9]) * 512;
                    }
                  });
                  result = calcFsSpeed(rx, wx);
                }
                if (callback) { callback(result) }
                resolve(result);
              })
            } else {
              if (callback) { callback(result) }
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
                if (line != '') {
                  line = line.split(' ');

                  rx += parseInt(line[0]);
                  wx += parseInt(line[1]);
                }
              });
              result = calcFsSpeed(rx, wx);
            }
            if (callback) { callback(result) }
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
        if (callback) { callback(result) }
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
        if (callback) { callback(NOT_SUPPORTED) }
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

              if (callback) { callback(result) }
              resolve(result);
            } else {
              if (callback) { callback(result) }
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
                if (line != '') {
                  line = line.split(' ');

                  rIO += parseInt(line[1]);
                  wIO += parseInt(line[0]);
                }
              });
              result = calcDiskIO(rIO, wIO);
            }
            if (callback) { callback(result) }
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
        if (callback) { callback(result) }
        resolve(result);
      }
    });
  });
}

exports.disksIO = disksIO;
