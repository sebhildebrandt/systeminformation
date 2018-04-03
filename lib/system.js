'use strict';
// ==================================================================================
// system.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2018
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 2. System (Hardware, BIOS, Base Board)
// ----------------------------------------------------------------------------------

const exec = require('child_process').exec;
const fs = require('fs');
const util = require('./util');

let _platform = process.platform;

const _linux = (_platform === 'linux');
const _darwin = (_platform === 'darwin');
const _windows = (_platform === 'win32');
const _freebsd = (_platform === 'freebsd');
const _openbsd = (_platform === 'openbsd');

const opts = {
  windowsHide: true
};

function system(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {

      let result = {
        manufacturer: '',
        model: 'Computer',
        version: '',
        serial: '-',
        uuid: '-',
        sku: '-',
      };

      if (_linux || _freebsd || _openbsd) {
        exec('dmidecode -t system', function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            result.manufacturer = util.getValue(lines, 'manufacturer');
            result.model = util.getValue(lines, 'product name');
            result.version = util.getValue(lines, 'version');
            result.serial = util.getValue(lines, 'serial number');
            result.uuid = util.getValue(lines, 'uuid');
            result.sku = util.getValue(lines, 'sku number');
            if (result.serial.toLowerCase().indexOf('o.e.m.') !== -1) result.serial = '-';
            if (result.manufacturer.toLowerCase().indexOf('o.e.m.') !== -1) result.manufacturer = '';
            if (result.model.toLowerCase().indexOf('o.e.m.') !== -1) result.model = 'Computer';
            if (result.version.toLowerCase().indexOf('o.e.m.') !== -1) result.version = '-';
            if (result.sku.toLowerCase().indexOf('o.e.m.') !== -1) result.sku = '-';
            
            if (result.manufacturer === '' && result.model === 'Computer' && result.version === '-') {
              // Check Raspberry Pi
              exec('grep Hardware /proc/cpuinfo; grep Serial /proc/cpuinfo; grep Revision /proc/cpuinfo', function (error, stdout) {
                if (!error) {
                  let lines = stdout.toString().split('\n');
                  lines.forEach(function (line) {
                    if (line.indexOf(':') !== -1) {
                      if (line.toLowerCase().indexOf('hardware') !== -1) result.model = line.split(':')[1].trim();
                      if (line.toLowerCase().indexOf('revision') !== -1) result.version = line.split(':')[1].trim();
                      if (line.toLowerCase().indexOf('serial') !== -1) result.serial = line.split(':')[1].trim();
                    }
                  });                  
                  if (result.model === 'BCM2835') {                     // Pi 3
                    result.manufacturer = 'Raspberry Pi Foundation';
                    result.model = result.model + ' - Pi 3 Model B';
                    if (['a02082', 'a22082', 'a32082'].indexOf(result.version) >= 0) {
                      result.version = result.version + ' - Rev. 1.2';
                    }
                  }
                  if (result.model === 'BCM2709') {                     // Pi 2
                    result.manufacturer = 'Raspberry Pi Foundation';
                    result.model = result.model + ' - Pi 2 Model B';
                    if (['a01041', 'a21041'].indexOf(result.version) >= 0) {
                      result.version = result.version + ' - Rev. 1.1';
                    }
                  }
                  if (result.model === 'BCM2708') {                     // Pi, Pi Zero
                    result.manufacturer = 'Raspberry Pi Foundation';
                    if (['0002', '0003'].indexOf(result.version) >= 0) {
                      result.model = result.model + ' - Pi Model B';
                      result.version = result.version + ' - Rev 1.0';
                    }
                    if (['900092'].indexOf(result.version) >= 0) {
                      result.model = result.model + ' - Pi Zero';
                      result.version = result.version + ' - Rev 1.2';
                    }
                    if (['900092', '900093', '920093'].indexOf(result.version) >= 0) {
                      result.model = result.model + ' - Pi Zero';
                      result.version = result.version + ' - Rev 1.3';
                    }
                    if (['0007', '0008', '0009'].indexOf(result.version) >= 0) {
                      result.model = result.model + ' - Pi Model A';
                      result.version = result.version + ' - Rev 2.0';
                    }
                    if (['0004', '0005', '0006', '000d', '000e', '000f'].indexOf(result.version) >= 0) {
                      result.model = result.model + ' - Pi Model B';
                      result.version = result.version + ' - Rev 2.0';
                    }
                    if (['0010'].indexOf(result.version) >= 0) {
                      result.model = result.model + ' - Pi Model B+';
                      result.version = result.version + ' - Rev 1.0';
                    }
                    if (['0012'].indexOf(result.version) >= 0) {
                      result.model = result.model + ' - Pi Model A+';
                      result.version = result.version + ' - Rev 1.0';
                    }
                    if (['0013'].indexOf(result.version) >= 0) {
                      result.model = result.model + ' - Pi Model B+';
                      result.version = result.version + ' - Rev 1.2';
                    }
                    if (['0015'].indexOf(result.version) >= 0) {
                      result.model = result.model + ' - Pi Model A+';
                      result.version = result.version + ' - Rev 1.1';
                    }
                  }
                }

                if (callback) { callback(result); }
                resolve(result);
              });
            } else {
              if (callback) { callback(result); }
              resolve(result);
            }
          } else {
            exec('dmesg | grep -i virtual | grep -iE "vmware|qemu|kvm|xen"', function (error, stdout) {
              if (!error) {
                let lines = stdout.toString().split('\n');
                if (lines.length > 0) result.model = 'Virtual machine';
              }
              if (fs.existsSync('/.dockerenv') || fs.existsSync('/.dockerinit')) {
                result.model = 'Docker Container';
              }
              if (callback) { callback(result); }
              resolve(result);
            });
          }
        });
      }
      if (_darwin) {
        exec('ioreg -c IOPlatformExpertDevice -d 2', function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().replace(/[<>"]/g, '').split('\n');
            result.manufacturer = util.getValue(lines, 'manufacturer', '=', true);
            result.model = util.getValue(lines, 'model', '=', true);
            result.version = util.getValue(lines, 'version', '=', true);
            result.serial = util.getValue(lines, 'ioplatformserialnumber', '=', true);
            result.uuid = util.getValue(lines, 'ioplatformuuid', '=', true);
            result.sku = util.getValue(lines, 'board-id', '=', true);
          }
          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_windows) {
        // exec('wmic csproduct get', function (error, stdout) {
        // TODO: refactor /value
        exec(util.getWmic() + ' csproduct get /value', opts, function (error, stdout) {
          if (!error) {
            // let lines = stdout.split('\r\n').filter(line => line.trim() !== '').filter((line, idx) => idx > 0)[0].trim().split(/\s\s+/);
            let lines = stdout.split('\r\n');
            result.manufacturer = util.getValue(lines, 'vendor', '=');
            result.model = util.getValue(lines, 'name', '=');
            result.version = util.getValue(lines, 'version', '=');
            result.serial = util.getValue(lines, 'identifyingnumber', '=');
            result.uuid = util.getValue(lines, 'uuid', '=');
            result.sku = util.getValue(lines, 'skunumber', '=');
          }
          if (callback) { callback(result); }
          resolve(result);
        });
      }
    });
  });
}

exports.system = system;

function bios(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {

      let result = {
        vendor: '',
        version: '',
        releaseDate: '',
        revision: '',
      };
      let cmd = '';
      if (_linux || _freebsd || _openbsd) {
        if (process.arch === 'arm') {
          cmd = 'cat /proc/cpuinfo | grep Serial';

        } else {
          cmd = 'dmidecode --type 0';
        }
        exec(cmd, function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            result.vendor = util.getValue(lines, 'Vendor');
            result.version = util.getValue(lines, 'Version');
            const datetime = util.getValue(lines, 'Release Date');
            result.releaseDate = util.parseDateTime(datetime).date;
            result.revision = util.getValue(lines, 'BIOS Revision');
          }

          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_darwin) {
        result.vendor = 'Apple Inc.';
        if (callback) { callback(result); }
        resolve(result);
      }
      if (_windows) {
        // TODO: check BIOS windows
        exec(util.getWmic() + ' bios get /value', opts, function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\r\n');
            const description = util.getValue(lines, 'description', '=');
            if (description.indexOf(' Version ') !== -1) {
              // ... Phoenix ROM BIOS PLUS Version 1.10 A04
              result.vendor = description.split(' Version ')[0].trim();
              result.version = description.split(' Version ')[1].trim();
            } else if (description.indexOf(' Ver: ') !== -1) {
              // ... BIOS Date: 06/27/16 17:50:16 Ver: 1.4.5
              result.vendor = util.getValue(lines, 'manufacturer', '=');
              result.version = description.split(' Ver: ')[1].trim();
            } else {
              result.vendor = util.getValue(lines, 'manufacturer', '=');
              result.version = util.getValue(lines, 'version', '=');  
            }
            result.releaseDate = util.getValue(lines, 'releasedate', '=');
            if (result.releaseDate.length >= 10) {
              result.releaseDate = result.releaseDate.substr(0,4) + '-' + result.releaseDate.substr(4,2) + '-' + result.releaseDate.substr(6,2);
            }
            result.revision = util.getValue(lines, 'buildnumber', '=');
          }

          if (callback) { callback(result); }
          resolve(result);
        });
      }
    });
  });
}

exports.bios = bios;

function baseboard(callback) {
  
  return new Promise((resolve) => {
    process.nextTick(() => {

      let result = {
        manufacturer: '',
        model: '',
        version: '',
        serial: '-',
        assetTag: '-',
      };
      let cmd = '';
      if (_linux || _freebsd || _openbsd) {
        if (process.arch === 'arm') {
          cmd = 'cat /proc/cpuinfo | grep Serial';
          // 'BCM2709', 'BCM2835', 'BCM2708' -->
        } else {
          cmd = 'dmidecode -t 2';
        }
        exec(cmd, function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            result.manufacturer = util.getValue(lines, 'Manufacturer');
            result.model = util.getValue(lines, 'Product Name');
            result.version = util.getValue(lines, 'Version');
            result.serial = util.getValue(lines, 'Serial Number');
            result.assetTag = util.getValue(lines, 'Asset Tag');
            if (result.serial.toLowerCase().indexOf('o.e.m.') !== -1) result.serial = '-';
            if (result.assetTag.toLowerCase().indexOf('o.e.m.') !== -1) result.assetTag = '-';
          }

          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_darwin) {
        exec('ioreg -c IOPlatformExpertDevice -d 2', function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().replace(/[<>"]/g, '').split('\n');
            result.manufacturer = util.getValue(lines, 'manufacturer', '=', true);
            result.model = util.getValue(lines, 'model', '=', true);
            result.version = util.getValue(lines, 'version', '=', true);
            result.serial = util.getValue(lines, 'ioplatformserialnumber', '=', true);
            result.assetTag = util.getValue(lines, 'board-id', '=', true);
          }

          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_windows) {
        // TODO: check BIOS windows
        exec(util.getWmic() + ' baseboard get /value', opts, function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\r\n');

            result.manufacturer = util.getValue(lines, 'manufacturer', '=');
            result.model = util.getValue(lines, 'model', '=');
            if (!result.model) {
              result.model = util.getValue(lines, 'product', '=');
            } 
            result.version = util.getValue(lines, 'version', '=');  
            result.serial = util.getValue(lines, 'serialnumber', '=');
            result.assetTag = util.getValue(lines, 'partnumber', '=');
            if (!result.assetTag) {
              result.assetTag = util.getValue(lines, 'sku', '=');
            } 
          }

          if (callback) { callback(result); }
          resolve(result);
        });
      }
    });
  });
}

exports.baseboard = baseboard;


