'use strict';
// @ts-check;
// ==================================================================================
// battery.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2019
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
const _sunos = (_platform === 'sunos');

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
        timeremaining: -1,
        acconnected: true,
        type: '',
        model: '',
        manufacturer: '',
        serial: ''
      };

      if (_linux) {
        let battery_path = '';
        if (fs.existsSync('/sys/class/power_supply/BAT1/uevent')) {
          battery_path = '/sys/class/power_supply/BAT1/';
        } else if (fs.existsSync('/sys/class/power_supply/BAT0/uevent')) {
          battery_path = '/sys/class/power_supply/BAT0/';
        }
        if (battery_path) {
          exec('cat ' + battery_path + 'uevent', function (error, stdout) {
            if (!error) {
              let lines = stdout.toString().split('\n');

              result.ischarging = (util.getValue(lines, 'POWER_SUPPLY_STATUS', '=').toLowerCase() === 'charging');
              result.acconnected = result.ischarging;
              result.cyclecount = parseInt('0' + util.getValue(lines, 'POWER_SUPPLY_CYCLE_COUNT', '='), 10);
              result.maxcapacity = parseInt('0' + util.getValue(lines, 'POWER_SUPPLY_CHARGE_FULL', '='), 10);
              if (!result.maxcapacity) {
                result.maxcapacity = parseInt('0' + util.getValue(lines, 'POWER_SUPPLY_ENERGY_FULL', '='), 10);
              }
              result.currentcapacity = parseInt('0' + util.getValue(lines, 'POWER_SUPPLY_CHARGE_NOW', '='), 10);
              if (!result.currentcapacity) {
                result.currentcapacity = parseInt('0' + util.getValue(lines, 'POWER_SUPPLY_ENERGY_NOW', '='), 10);
              }
              const percent = util.getValue(lines, 'POWER_SUPPLY_CAPACITY', '=');
              const energy = parseInt('0' + util.getValue(lines, 'POWER_SUPPLY_ENERGY_NOW', '='), 10);
              const power = parseInt('0' + util.getValue(lines, 'POWER_SUPPLY_POWER_NOW', '='), 10);
              const current = parseInt('0' + util.getValue(lines, 'POWER_SUPPLY_CURRENT_NOW', '='), 10);

              result.percent = parseInt('0' + percent, 10);
              if (result.maxcapacity && result.currentcapacity) {
                result.hasbattery = true;
                if (!percent) {
                  result.percent = 100.0 * result.currentcapacity / result.maxcapacity;
                }
              }
              if (result.ischarging) {
                result.hasbattery = true;
              }
              if (energy && power) {
                result.timeremaining = Math.floor(energy / power * 60);
              } else if (current && result.currentcapacity) {
                result.timeremaining = Math.floor(result.currentcapacity / current * 60);
              }
              result.type = util.getValue(lines, 'POWER_SUPPLY_TECHNOLOGY', '=');
              result.model = util.getValue(lines, 'POWER_SUPPLY_MODEL_NAME', '=');
              result.manufacturer = util.getValue(lines, 'POWER_SUPPLY_MANUFACTURER', '=');
              result.serial = util.getValue(lines, 'POWER_SUPPLY_SERIAL_NUMBER', '=');
              if (callback) { callback(result); }
              resolve(result);
            }
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
        exec('ioreg -n AppleSmartBattery -r | egrep "CycleCount|IsCharging|MaxCapacity|CurrentCapacity|BatterySerialNumber|TimeRemaining"; pmset -g batt | grep %', function (error, stdout) {
          if (stdout) {
            let lines = stdout.toString().replace(/ +/g, '').replace(/"+/g, '').replace(/-/g, '').split('\n');
            result.cyclecount = parseInt('0' + util.getValue(lines, 'cyclecount', '='), 10);
            result.maxcapacity = parseInt('0' + util.getValue(lines, 'maxcapacity', '='), 10);
            result.currentcapacity = parseInt('0' + util.getValue(lines, 'currentcapacity', '='), 10);
            result.manufacturer = 'Apple';
            result.serial = util.getValue(lines, 'BatterySerialNumber', '=');
            let percent = -1;
            const line = util.getValue(lines, 'internal', 'Battery');
            let parts = line.split(';');
            if (parts && parts[0]) {
              let parts2 = parts[0].split('\t');
              if (parts2 && parts2[1]) {
                percent = parseFloat(parts2[1].trim().replace(/%/g, ''));
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
              result.type = 'Li-ion';
              result.percent = percent !== -1 ? percent : Math.round(100.0 * result.currentcapacity / result.maxcapacity);
              if (!result.ischarging) {
                result.timeremaining = parseInt('0' + util.getValue(lines, 'TimeRemaining', '='), 10);
              }
            }
          }
          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_sunos) {
        if (callback) { callback(result); }
        resolve(result);
      }
      if (_windows) {
        try {
          exec(util.getWmic() + ' Path Win32_Battery Get BatteryStatus, DesignCapacity, EstimatedChargeRemaining /value', util.execOptsWin, function (error, stdout) {
            if (stdout) {
              let lines = stdout.split('\r\n');
              let status = util.getValue(lines, 'BatteryStatus', '=').trim();
              // 1 = "Discharging"
              // 2 = "On A/C"
              // 3 = "Fully Charged"
              // 4 = "Low"
              // 5 = "Critical"
              // 6 = "Charging"
              // 7 = "Charging High"
              // 8 = "Charging Low"
              // 9 = "Charging Critical"
              // 10 = "Undefined"
              // 11 = "Partially Charged"
              if (status && status != '10') {
                const statusValue = parseInt(status);
                result.hasbattery = true;
                result.maxcapacity = parseInt(util.getValue(lines, 'DesignCapacity', '=') || 0);
                result.percent = parseInt(util.getValue(lines, 'EstimatedChargeRemaining', '=') || 0);
                result.currentcapacity = parseInt(result.maxcapacity * result.percent / 100);
                result.ischarging = (statusValue >= 6 && statusValue <= 9) || statusValue === 11 || (!(statusValue === 3) && !(statusValue === 1) && result.percent < 100);
                result.acconnected = result.ischarging;
              }
            }
            if (callback) { callback(result); }
            resolve(result);
          });
        } catch (e) {
          if (callback) { callback(result); }
          resolve(result);
        }
      }
    });
  });
};
