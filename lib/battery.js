'use strict';
// ==================================================================================
// battery.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2018
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 6. Battery
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

module.exports = function (callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = {
        hasbattery: false,
        cyclecount: 0,
        ischarging: false,
        maxcapacity: 0,
        currentcapacity: 0,
        percent: 0,
        acconnected: true
      };

      if (_linux) {
        let battery_path = '';
        if (fs.existsSync('/sys/class/power_supply/BAT1/status')) {
          battery_path = '/sys/class/power_supply/BAT1/';
        } else if (fs.existsSync('/sys/class/power_supply/BAT0/status')) {
          battery_path = '/sys/class/power_supply/BAT0/';
        }
        if (battery_path) {
          exec('cat ' + battery_path + 'status', function (error, stdout) {
            if (!error) {
              let lines = stdout.toString().split('\n');
              if (lines.length > 0 && lines[0]) result.ischarging = (lines[0].trim().toLowerCase() === 'charging');
              result.acconnected = result.ischarging;
            }
            exec('cat ' + battery_path + 'cyclec_ount', function (error, stdout) {
              if (!error) {
                let lines = stdout.toString().split('\n');
                if (lines.length > 0 && lines[0]) result.cyclecount = parseFloat(lines[0].trim());
              }
              exec('cat ' + battery_path + 'charge_full', function (error, stdout) {
                if (!error) {
                  let lines = stdout.toString().split('\n');
                  if (lines.length > 0 && lines[0]) result.maxcapacity = parseFloat(lines[0].trim());
                }
                exec('cat ' + battery_path + 'charge_now', function (error, stdout) {
                  if (!error) {
                    let lines = stdout.toString().split('\n');
                    if (lines.length > 0 && lines[0]) result.currentcapacity = parseFloat(lines[0].trim());
                  }
                  if (result.maxcapacity && result.currentcapacity) {
                    result.hasbattery = true;
                    result.percent = 100.0 * result.currentcapacity / result.maxcapacity;
                  }
                  if (callback) { callback(result); }
                  resolve(result);
                });
              });
            });
          });
        } else {
          if (callback) { callback(result); }
          resolve(result);
        }
      }
      if (_freebsd || _openbsd) {
        exec('sysctl hw.acpi.battery hw.acpi.acline', function (error, stdout) {
          let lines = stdout.toString().split('\n');
          const batteries = parseInt('0' + util.getValue(lines, 'hw.acpi.battery.units'), 10);
          const percent = parseInt('0' + util.getValue(lines, 'hw.acpi.battery.life'), 10);
          result.hasbattery = (batteries > 0);
          result.cyclecount = -1;
          result.ischarging = util.getValue(lines, 'hw.acpi.acline') !== '1';
          result.acconnected = result.ischarging;
          result.maxcapacity = -1;
          result.currentcapacity = -1;
          result.percent = batteries ? percent : -1;
          if (callback) { callback(result); }
          resolve(result);
        });
      }

      if (_darwin) {
        exec('ioreg -n AppleSmartBattery -r | egrep "CycleCount|IsCharging|MaxCapacity|CurrentCapacity"; pmset -g batt | grep %', function (error, stdout) {
          if (stdout) {
            let lines = stdout.toString().replace(/ +/g, '').replace(/"+/g, '').replace(/-/g, '').split('\n');
            result.cyclecount = parseInt('0' + util.getValue(lines, 'cyclecount', '='), 10);
            result.maxcapacity = parseInt('0' + util.getValue(lines, 'maxcapacity', '='), 10);
            result.currentcapacity = parseInt('0' + util.getValue(lines, 'currentcapacity', '='), 10);
            let percent = -1;
            const line = util.getValue(lines, 'internal', 'Battery');
            let parts = line.split(';');
            if (parts && parts[0]) {
              let parts2 = parts[0].split('\t');
              if (parts2 && parts2[1]) {
                percent = parseFloat(parts2[1].trim().replace('%', ''));
              }
            }
            if (parts && parts[1]) {
              result.ischarging = (parts[1].trim() === 'charging');
              result.acconnected = (parts[1].trim() !== 'discharging');
            } else {
              result.ischarging = util.getValue(lines, 'ischarging', '=').toLowerCase() === 'yes';
              result.acconnected = result.ischarging;
            }
            if (result.maxcapacity && result.currentcapacity) {
              result.hasbattery = true;
              result.percent = percent !== -1 ? percent : Math.round(100.0 * result.currentcapacity / result.maxcapacity);
            }
          }
          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_windows) {
        exec(util.getWmic() + ' Path Win32_Battery Get BatteryStatus, DesignCapacity, EstimatedChargeRemaining /value', opts, function (error, stdout) {
          if (stdout) {
            let lines = stdout.split('\r\n');
            let status = util.getValue(lines, 'BatteryStatus', '=').trim();
            if (status) {
              status = parseInt(status || '2');
              result.hasbattery = true;
              result.maxcapacity = parseInt(util.getValue(lines, 'DesignCapacity', '=') || 0);
              result.percent = parseInt(util.getValue(lines, 'EstimatedChargeRemaining', '=') || 0);
              result.currentcapacity = parseInt(result.maxcapacity * result.percent / 100);
              result.ischarging = (status >= 6 && status <= 9) || (!(status === 3) && !(status === 1) && result.percent < 100);
              result.acconnected = result.ischarging;
            }
          }
          if (callback) { callback(result); }
          resolve(result);
        });
      }
    });
  });
};
