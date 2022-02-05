'use strict';
// @ts-check
// ==================================================================================
// audio.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2022
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 17. bluetooth
// ----------------------------------------------------------------------------------

const exec = require('child_process').exec;
const execSync = require('child_process').execSync;
const path = require('path');
const util = require('./util');
const fs = require('fs');

let _platform = process.platform;

const _linux = (_platform === 'linux' || _platform === 'android');
const _darwin = (_platform === 'darwin');
const _windows = (_platform === 'win32');
const _freebsd = (_platform === 'freebsd');
const _openbsd = (_platform === 'openbsd');
const _netbsd = (_platform === 'netbsd');
const _sunos = (_platform === 'sunos');

function parseBluetoothType(str) {
  let result = '';

  if (str.indexOf('keyboard') >= 0) { result = 'Keyboard'; }
  if (str.indexOf('mouse') >= 0) { result = 'Mouse'; }
  if (str.indexOf('speaker') >= 0) { result = 'Speaker'; }
  if (str.indexOf('headset') >= 0) { result = 'Headset'; }
  if (str.indexOf('phone') >= 0) { result = 'Phone'; }
  // to be continued ...

  return result;
}

function parseLinuxBluetoothInfo(lines, macAddr1, macAddr2) {
  const result = {};

  result.device = null;
  result.name = util.getValue(lines, 'name', '=');
  result.manufacturer = null;
  result.macDevice = macAddr1;
  result.macHost = macAddr2;
  result.batteryPercent = null;
  result.type = parseBluetoothType(result.name.toLowerCase());
  result.connected = false;

  return result;
}

function parseDarwinBluetoothDevices(bluetoothObject, macAddr2) {
  const result = {};
  const typeStr = ((bluetoothObject.device_minorClassOfDevice_string || bluetoothObject.device_majorClassOfDevice_string || '') + (bluetoothObject.device_name || '')).toLowerCase();

  result.device = bluetoothObject.device_services || '';
  result.name = bluetoothObject.device_name || '';
  result.manufacturer = bluetoothObject.device_manufacturer || '';
  result.macDevice = (bluetoothObject.device_addr || '').toLowerCase().replace(/-/g, ':');
  result.macHost = macAddr2;
  result.batteryPercent = bluetoothObject.device_batteryPercent || null;
  result.type = parseBluetoothType(typeStr);
  result.connected = bluetoothObject.device_isconnected === 'attrib_Yes' || false;

  return result;
}

function parseWindowsBluetooth(lines) {
  const result = {};

  result.device = null;
  result.name = util.getValue(lines, 'name', ':');
  result.manufacturer = util.getValue(lines, 'manufacturer', ':');
  result.macDevice = null;
  result.macHost = null;
  result.batteryPercent = null;
  result.type = parseBluetoothType(result.name.toLowerCase());
  result.connected = null;

  return result;
}

function bluetoothDevices(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = [];
      if (_linux) {
        // get files in /var/lib/bluetooth/ recursive
        const btFiles = util.getFilesInPath('/var/lib/bluetooth/');
        for (let i = 0; i < btFiles.length; i++) {
          const filename = path.basename(btFiles[i]);
          const pathParts = btFiles[i].split('/');
          const macAddr1 = pathParts.length >= 6 ? pathParts[pathParts.length - 2] : null;
          const macAddr2 = pathParts.length >= 7 ? pathParts[pathParts.length - 3] : null;
          if (filename === 'info') {
            const infoFile = fs.readFileSync(btFiles[i], { encoding: 'utf8' }).split('\n');
            result.push(parseLinuxBluetoothInfo(infoFile, macAddr1, macAddr2));
          }
        }
        // determine "connected" with hcitool con
        try {
          const hdicon = execSync('hcitool con').toString().toLowerCase();
          for (let i = 0; i < result.length; i++) {
            if (result[i].macDevice && result[i].macDevice.length > 10 && hdicon.indexOf(result[i].macDevice.toLowerCase()) >= 0) {
              result[i].connected = true;
            }
          }
        } catch (e) {
          util.noop();
        }

        if (callback) {
          callback(result);
        }
        resolve(result);
      }
      if (_darwin) {
        let cmd = 'system_profiler SPBluetoothDataType -json';
        exec(cmd, function (error, stdout) {
          if (!error) {
            try {
              const outObj = JSON.parse(stdout.toString());
              if (outObj.SPBluetoothDataType && outObj.SPBluetoothDataType.length && outObj.SPBluetoothDataType[0] && outObj.SPBluetoothDataType[0]['device_title'] && outObj.SPBluetoothDataType[0]['device_title'].length) {
                // missing: host BT Adapter macAddr ()
                let macAddr2 = null;
                if (outObj.SPBluetoothDataType[0]['local_device_title'] && outObj.SPBluetoothDataType[0].local_device_title.general_address) {
                  macAddr2 = outObj.SPBluetoothDataType[0].local_device_title.general_address.toLowerCase().replace(/-/g, ':');
                }

                for (let i = 0; i < outObj.SPBluetoothDataType[0]['device_title'].length; i++) {
                  const obj = outObj.SPBluetoothDataType[0]['device_title'][i];
                  const objKey = Object.keys(obj);
                  if (objKey && objKey.length === 1) {
                    const innerObject = obj[objKey[0]];
                    innerObject.device_name = objKey[0];
                    const bluetoothDevice = parseDarwinBluetoothDevices(innerObject, macAddr2);
                    result.push(bluetoothDevice);
                  }
                }
              }
            } catch (e) {
              util.noop();
            }
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_windows) {
        util.powerShell('Get-WmiObject Win32_PNPEntity | select PNPClass, Name, Manufacturer | fl').then((stdout, error) => {
          if (!error) {
            const parts = stdout.toString().split(/\n\s*\n/);
            for (let i = 0; i < parts.length; i++) {
              if (util.getValue(parts[i].split('\n'), 'PNPClass', ':') === 'Bluetooth') {
                result.push(parseWindowsBluetooth(parts[i].split('\n')));
              }
            }
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_freebsd || _netbsd || _openbsd || _sunos) {
        resolve(null);
      }
    });
  });
}

exports.bluetoothDevices = bluetoothDevices;
