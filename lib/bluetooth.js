'use strict';
// @ts-check
// ==================================================================================
// audio.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2021
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 17. bluetooth
// ----------------------------------------------------------------------------------

const exec = require('child_process').exec;
const execSync = require('child_process').execSync;
const util = require('./util');
// const fs = require('fs');

let _platform = process.platform;

const _linux = (_platform === 'linux');
const _darwin = (_platform === 'darwin');
const _windows = (_platform === 'win32');
const _freebsd = (_platform === 'freebsd');
const _openbsd = (_platform === 'openbsd');
const _netbsd = (_platform === 'netbsd');
const _sunos = (_platform === 'sunos');

function getLinuxAudioPci() {
  let cmd = 'lspci -v 2>/dev/null'
  let result = [];
  try {
    const parts = execSync(cmd).toString().split('\n\n');
    for (let i = 0; i < parts.length; i++) {
      const lines = parts[i].split('\n');
      if (lines && lines.length && lines[0].toLowerCase().indexOf('audio') >= 0) {
        const audio = {};
        audio.slotId = lines[0].split(' ')[0];
        audio.driver = util.getValue(lines, 'Kernel driver in use', ':', true) || util.getValue(lines, 'Kernel modules', ':', true)
        result.push(audio);
      }
    }
    return result;
  } catch (e) {
    return result;
  }
}

// device("device_services")
// name-- > Key
// address-- > "device_addr"
// batteryPercent-- > "device_batteryPercent"
// manufacturer-- > "device_manufacturer"
// type(keyboard, ...)-- > ("device_majorClassOfDevice_string"), "device_minorClassOfDevice_string"
// connected



function parseLinuxAudioPciMM(lines, audioPCI) {
  const result = {};
  const slotId = util.getValue(lines, 'Slot');

  const pciMatch = audioPCI.filter(function (item) { return item.slotId === slotId })

  result.id = slotId;
  result.name = util.getValue(lines, 'SDevice');
  // result.type = util.getValue(lines, 'Class');
  result.manufacturer = util.getValue(lines, 'SVendor');
  result.revision = util.getValue(lines, 'Rev');
  result.driver = pciMatch && pciMatch.length === 1 && pciMatch[0].driver ? pciMatch[0].driver : '';
  result.default = null;
  result.channel = 'PCIe';
  result.in = null;
  result.out = null;
  result.status = 'online';

  return result;
}

function parseDarwinBluetoothTyoe(str) {
  let result = '';

  if (str.indexOf('keyboard') >= 0) { result = 'Keyboard'; }
  if (str.indexOf('mouse') >= 0) { result = 'Mouse'; }
  if (str.indexOf('speaker') >= 0) { result = 'Speaker'; }
  if (str.indexOf('headset') >= 0) { result = 'Headset'; }
  // to be continued ...

  return result;
}

function parseDarwinBluetoothDevices(bluetoothObject) {
  const result = {};
  const typeStr = ((bluetoothObject.device_minorClassOfDevice_string || bluetoothObject.device_majorClassOfDevice_string || '') + (bluetoothObject.device_name || '')).toLowerCase();

  result.device = bluetoothObject.device_services || '';
  result.name = bluetoothObject.device_name || '';
  result.manufacturer = bluetoothObject.device_manufacturer || '';
  result.address = bluetoothObject.device_addr || '';
  result.batteryPercent = bluetoothObject.device_batteryPercent || null;
  result.tyoe = parseDarwinBluetoothTyoe(typeStr);
  result.connected = bluetoothObject.device_isconnected === 'attrib_Yes' || false;

  return result;
}

function parseWindowsBluetooth(lines) {
  const result = {};
  const status = util.getValue(lines, 'StatusInfo', '=');
  // const description = util.getValue(lines, 'Description', '=');

  result.device = null;
  result.name = util.getValue(lines, 'name', '=');
  result.manufacturer = util.getValue(lines, 'manufacturer', '=');
  result.address = null;
  result.batteryPercent = null
  result.default = null
  result.in = null
  result.out = null
  result.interfaceType = null
  result.status = status

  return result;
}

function bluetoothDevices(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = [];
      if (_linux || _freebsd || _openbsd || _netbsd) {
        let cmd = 'lspci -vmm 2>/dev/null'
        exec(cmd, function (error, stdout) {
          // PCI
          if (!error) {
            const audioPCI = getLinuxAudioPci();
            const parts = stdout.toString().split('\n\n');
            for (let i = 0; i < parts.length; i++) {
              const lines = parts[i].split('\n');
              if (util.getValue(lines, 'class', ':', true).toLowerCase().indexOf('audio') >= 0) {
                const audio = parseLinuxAudioPciMM(lines, audioPCI);
                result.push(audio);
              }
            }
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_darwin) {
        let cmd = 'system_profiler SPBluetoothDataType -json'
        exec(cmd, function (error, stdout) {
          if (!error) {
            try {
              const outObj = JSON.parse(stdout.toString());
              if (outObj.SPBluetoothDataType && outObj.SPBluetoothDataType.length && outObj.SPBluetoothDataType[0] && outObj.SPBluetoothDataType[0]['device_title'] && outObj.SPBluetoothDataType[0]['device_title'].length) {
                for (let i = 0; i < outObj.SPBluetoothDataType[0]['device_title'].length; i++) {
                  const obj = outObj.SPBluetoothDataType[0]['device_title'][i];
                  const objKey = Object.keys(obj);
                  if (objKey && objKey.length === 1) {
                    const innerObject = obj[objKey[0]];
                    innerObject.device_name = objKey[0];
                    const bluetoothDevice = parseDarwinBluetoothDevices(innerObject);
                    result.push(bluetoothDevice);

                  }

                }
              }
            } catch (e) {
              util.noop()
            }
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_windows) {
        util.wmic('path Win32_PNPEntity get /value', function (error, stdout) {
          if (!error) {
            const parts = stdout.toString().split(/\n\s*\n/);
            for (let i = 0; i < parts.length; i++) {
              if (util.getValue(parts[i].split('\n'), 'PNPClass', '=') === 'Bluetooth') {
                result.push(parseWindowsBluetooth(parts[i].split('\n'), i))
              }
            }
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_sunos) {
        resolve(null);
      }
    });
  });
}

exports.bluetoothDevices = bluetoothDevices;
