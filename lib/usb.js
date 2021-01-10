'use strict';
// @ts-check
// ==================================================================================
// usb.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2021
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 16. usb
// ----------------------------------------------------------------------------------

const exec = require('child_process').exec;
// const execSync = require('child_process').execSync;
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

const NOT_SUPPORTED = 'not supported';

function parseLinuxUsb(usb) {
  const result = {};
  const lines = usb.split('\n');
  if (lines && lines.length && lines[0].indexOf('Device') >= 0) {
    const parts = lines[0].split(' ');
    result.bus = parseInt(parts[0], 10);
    if (parts[2]) {
      result.deviceId = parseInt(parts[2], 10);
    } else {
      result.deviceId = null;
    }
  } else {
    result.bus = null;
    result.deviceId = null;
  }
  const idVendor = util.getValue(lines, 'idVendor', ' ', true);
  let vendorParts = idVendor.split(' ');
  vendorParts.shift();
  const vendor = vendorParts.join(' ');

  const idProduct = util.getValue(lines, 'idProduct', ' ', true);
  let productParts = idProduct.split(' ');
  productParts.shift();
  const product = productParts.join(' ');

  const interfaceClass = util.getValue(lines, 'bInterfaceClass', ' ', true);
  let interfaceClassParts = interfaceClass.split(' ');
  interfaceClassParts.shift();
  const usbType = interfaceClassParts.join(' ');

  const iManufacturer = util.getValue(lines, 'iManufacturer', ' ', true);
  let iManufacturerParts = iManufacturer.split(' ');
  iManufacturerParts.shift();
  const manufacturer = iManufacturerParts.join(' ');

  result.id = idVendor.startWith('0x') ? idVendor.split(' ').substr(2, 10) : '' + ':' + idProduct.startWith('0x') ? idProduct.split(' ').substr(2, 10) : '';
  result.name = product
  result.type = usbType;
  result.removable = null;
  result.vendor = vendor;
  result.manufacturer = manufacturer
  result.maxPower = util.getValue(lines, 'MaxPower', ' ', true);
  result.serialNumber = null;

  return result;
}

// bus
// deviceId
// id
// name(product)
// type(bInterfaceClass)
// removable / hotplug
// vendor
// manufacturer
// maxpower(linux)

function getDarwinUsbType(name) {
  let result = ''
  if (name.indexOf('camera') >= 0) { result = 'Camera'; }
  else if (name.indexOf('touch bar') >= 0) { result = 'Touch Bar'; }
  else if (name.indexOf('controller') >= 0) { result = 'Controller'; }
  else if (name.indexOf('headset') >= 0) { result = 'Audio'; }
  else if (name.indexOf('keyboard') >= 0) { result = 'Keyboard'; }
  else if (name.indexOf('trackpad') >= 0) { result = 'Trackpad'; }
  else if (name.indexOf('sensor') >= 0) { result = 'Sensor'; }
  else if (name.indexOf('bthusb') >= 0) { result = 'Bluetooth'; }
  else if (name.indexOf('bth') >= 0) { result = 'Bluetooth'; }
  else if (name.indexOf('rfcomm') >= 0) { result = 'Bluetooth'; }
  else if (name.indexOf('usbhub') >= 0) { result = 'Hub'; }
  return result;
}


function parseDarwinUsb(usb, id) {
  const result = {};
  result.id = id;

  usb = usb.replace(/ \|/g, '')
  usb = usb.trim();
  let lines = usb.split('\n');
  lines.shift();
  try {
    for (let i = 0; i < lines.length; i++) {
      lines[i] = lines[i].trim();
      lines[i] = lines[i].replace(/=/g, ':');
      if (lines[i] !== '{' && lines[i] !== '}' && lines[i + 1] && lines[i + 1].trim() !== '}') {
        lines[i] = lines[i] + ',';
      }
      lines[i] = lines[i].replace(' Yes,', '"Yes",');
    }
    const usbObj = JSON.parse(lines.join('\n'));

    result.bus = null;
    result.deviceId = null;
    result.id = usbObj['USB Address'];
    result.name = usbObj['kUSBProductString'];
    result.type = getDarwinUsbType(usbObj['kUSBProductString'].toLowerCase());
    result.removable = usbObj['Built-In'].toLowerCase() !== 'yes';
    result.vendor = usbObj['kUSBVendorString'];
    result.manufacturer = usbObj['kUSBVendorString'];
    result.maxPower = null;
    result.serialNumber = usbObj['kUSBSerialNumberString'] || null;

    if (result.name) {
      return result;
    } else {
      return null;
    }
  } catch (e) {
    return null;
  }
}

function getWindowsUsbType(service) {
  let result = ''
  if (service.indexOf('usbhub3') >= 0) { result = 'Hub'; }
  else if (service.indexOf('usbstor') >= 0) { result = 'Storage'; }
  else if (service.indexOf('hidUsb') >= 0) { result = 'Input'; }
  else if (service.indexOf('mouhid') >= 0) { result = 'Mouse'; }
  else if (service.indexOf('usbccgp') >= 0) { result = 'Controller'; }
  else if (service.indexOf('kbdhid') >= 0) { result = 'Keyboard'; }
  else if (service.indexOf('disk') >= 0) { result = 'Storage'; }
  else if (service.indexOf('bthusb') >= 0) { result = 'Bluetooth'; }
  else if (service.indexOf('bth') >= 0) { result = 'Bluetooth'; }
  else if (service.indexOf('rfcomm') >= 0) { result = 'Bluetooth'; }
  else if (service.indexOf('usbhub') >= 0) { result = 'Hub'; }
  return result;
}

function parseWindowsUsb(lines, id) {
  const usbType = getWindowsUsbType(util.getValue(lines, 'Service', '=').toLowerCase());

  if (usbType) {
    const result = {};
    result.bus = null;
    result.deviceId = null;
    result.id = id;
    result.name = util.getValue(lines, 'name', '=');
    result.type = usbType;
    result.removable = null;
    result.vendor = null;
    result.manufacturer = util.getValue(lines, 'Manufacturer', '=');
    result.maxPower = null;
    result.serialNumber = null;

    return result;
  } else {
    return null
  }

}

function usb(callback) {

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      let result = [];
      if (_linux) {
        const cmd = 'export LC_ALL=C; lsusb -v 2>/dev/null; unset LC_ALL';
        exec(cmd, { maxBuffer: 1024 * 1024 * 128 }, function (error, stdout) {
          if (!error) {
            const parts = ('\n\n' + stdout.toString()).split('\n\nBus ');
            for (let i = 1; i < parts.length; i++) {
              const usb = parseLinuxUsb(parts[i]);
              result.push(usb);
            }
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_darwin) {
        let cmd = 'ioreg -p IOUSB -c AppleUSBRootHubDevice -w0 -l'
        exec(cmd, {maxBuffer: 1024 * 1024 * 128}, function (error, stdout) {
          if (!error) {
            const parts = (stdout.toString()).split(' +-o ');
            for (let i = 2; i < parts.length; i++) {
              const usb = parseDarwinUsb(parts[i]);
              if (usb) {
                result.push(usb)
              }
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_windows) {
        util.powerShell('gwmi Win32_USBControllerDevice |%{[wmi]($_.Dependent)}', function (error, stdout) {
          if (!error) {
            const parts = stdout.toString().split(/\n\s*\n/);
            for (let i = 0; i < parts.length; i++) {
              const usb = parseWindowsUsb(parts[i].split('\n'), i)
              if (usb) {
                result.push(usb)
              }
            }
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_sunos || _freebsd || _openbsd || _netbsd) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) {
          callback(NOT_SUPPORTED);
        }
        reject(error);
      }
    });
  });
}

exports.usb = usb;
