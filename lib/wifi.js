'use strict';
// @ts-check
// ==================================================================================
// wifi.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2019
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 9. wifi
// ----------------------------------------------------------------------------------

const os = require('os');
const exec = require('child_process').exec;
const execSync = require('child_process').execSync;
const fs = require('fs');
const util = require('./util');

let _platform = process.platform;

const _linux = (_platform === 'linux');
const _darwin = (_platform === 'darwin');
const _windows = (_platform === 'win32');
const _freebsd = (_platform === 'freebsd');
const _openbsd = (_platform === 'openbsd');
const _netbsd = (_platform === 'netbsd');
const _sunos = (_platform === 'sunos');

function wifiDBFromQuality(quality) {
  return (parseFloat(quality) / 2 - 100);
}

function wifiQualityFromDB(db) {
  return 2 * (parseFloat(db) + 100);
}

function wifi(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = [];
      if (_linux) {
        let cmd = 'nmcli --terse --fields active,ssid,bssid,mode,chan,freq,signal,security,wpa-flags,rsn-flags device wifi list';
        exec(cmd, { maxBuffer: 1024 * 2000 }, function (error, stdout) {

          const parts = stdout.toString().split('ACTIVE:');
          parts.shift();
          parts.forEach(part => {
            part = 'ACTIVE:' + part;
            const lines = part.split(os.EOL);
            const channel = util.getValue(lines, 'CHAN');
            const frequency = util.getValue(lines, 'FREQ').toLowerCase().replace('mhz', '').trim()
            const security = util.getValue(lines, 'SECURITY').replace('(', '').replace(')', '')
            const wpaFlags = util.getValue(lines, 'WPA-FLAGS').replace('(', '').replace(')', '')
            const rsnFlags = util.getValue(lines, 'RSN-FLAGS').replace('(', '').replace(')', '')
            result.push({
              ssid: util.getValue(lines, 'SSID'),
              bssid: util.getValue(lines, 'BSSID'),
              mode: util.getValue(lines, 'MODE'),
              channel: channel ? parseInt(channel, 10) : -1,
              frequency: frequency ? parseInt(frequency, 10) : -1,
              signalLevel: wifiDBFromQuality(util.getValue(lines, 'SIGNAL')),
              quality: parseFloat(util.getValue(lines, 'SIGNAL')),
              security: security && security !== 'none' ? security.split(' ') : [],
              wpaFlags: wpaFlags && wpaFlags !== 'none' ? wpaFlags.split(' ') : [],
              rsnFlags: rsnFlags && rsnFlags !== 'none' ? rsnFlags.split(' ') : []
            })
          })

          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      } else if (_darwinx) {
        let cmd = '';
        exec(cmd, { maxBuffer: 1024 * 2000 }, function (error, stdout) {
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
  });
}

exports.wifi = wifi;
