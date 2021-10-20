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

const { exec } = require('child_process');
const util = require('./util');
const { _linux, _freebsd, _openbsd, _netbsd, _darwin, _windows, _sunos } = require('./common/consts');

function getLinuxUsbType(type, name) {
  const nameType = (name + ' ' + type).toLowerCase();
  switch (true) {
    case nameType.indexOf('camera') >= 0:
      return 'Camera';
    case nameType.indexOf('hub') >= 0:
      return 'Hub';
    case nameType.indexOf('keybrd') >= 0:
      return 'Keyboard';
    case nameType.indexOf('keyboard') >= 0:
      return 'Keyboard';
    case nameType.indexOf('mouse') >= 0:
      return 'Mouse';
    case nameType.indexOf('mic') >= 0:
      return 'Microphone';
    case nameType.indexOf('headset') >= 0:
      return 'Audio';
    case nameType.indexOf('audio') >= 0:
      return 'Audio';
    default:
      return type;
  }
}

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
  const idVendor = util.getValue(lines, 'idVendor', ' ', true).trim();
  let vendorParts = idVendor.split(' ');
  vendorParts.shift();
  const vendor = vendorParts.join(' ');

  const idProduct = util.getValue(lines, 'idProduct', ' ', true).trim();
  let productParts = idProduct.split(' ');
  productParts.shift();
  const product = productParts.join(' ');

  const interfaceClass = util.getValue(lines, 'bInterfaceClass', ' ', true).trim();
  let interfaceClassParts = interfaceClass.split(' ');
  interfaceClassParts.shift();
  const usbType = interfaceClassParts.join(' ');

  const iManufacturer = util.getValue(lines, 'iManufacturer', ' ', true).trim();
  let iManufacturerParts = iManufacturer.split(' ');
  iManufacturerParts.shift();
  const manufacturer = iManufacturerParts.join(' ');

  result.id = (idVendor.startsWith('0x') ? idVendor.split(' ')[0].substr(2, 10) : '') + ':' + (idProduct.startsWith('0x') ? idProduct.split(' ')[0].substr(2, 10) : '');
  result.name = product;
  result.type = getLinuxUsbType(usbType, product);
  result.removable = null;
  result.vendor = vendor;
  result.manufacturer = manufacturer;
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
  const usbDeviceName = name.toLowerCase();
  switch (true) {
    case usbDeviceName.indexOf('camera') >= 0:
      return 'Camera';
    case usbDeviceName.indexOf('touch bar') >= 0:
      return 'Touch Bar';
    case usbDeviceName.indexOf('controller') >= 0:
      return 'Controller';
    case usbDeviceName.indexOf('headset') >= 0:
      return 'Audio';
    case usbDeviceName.indexOf('keyboard') >= 0:
      return 'Keyboard';
    case usbDeviceName.indexOf('trackpad') >= 0:
      return 'Trackpad';
    case usbDeviceName.indexOf('sensor') >= 0:
      return 'Sensor';
    case usbDeviceName.indexOf('bthusb') >= 0:
      return 'Bluetooth';
    case usbDeviceName.indexOf('bth') >= 0:
      return 'Bluetooth';
    case usbDeviceName.indexOf('rfcomm') >= 0:
      return 'Bluetooth';
    case usbDeviceName.indexOf('usbhub') >= 0:
      return 'Hub';
    case usbDeviceName.indexOf(' hub') >= 0:
      return 'Hub';
    case usbDeviceName.indexOf('mouse') >= 0:
      return 'Mouse';
    case usbDeviceName.indexOf('mic') >= 0:
      return 'Microphone';
    case usbDeviceName.indexOf('removable') >= 0:
      return 'Storage';
    default:
      return '';
  }
}


function parseDarwinUsb(usb, id) {
  const result = {};
  result.id = id;

  usb = usb.replace(/ \|/g, '');
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
      lines[i] = lines[i].replace(': Yes,', ': "Yes",');
      lines[i] = lines[i].replace(': No,', ': "No",');
    }
    const usbObj = JSON.parse(lines.join('\n'));
    const removableDrive = usbObj['Built-In'].toLowerCase() !== 'yes' && usbObj['non-removable'].toLowerCase() === 'no';

    result.bus = null;
    result.deviceId = null;
    result.id = usbObj['USB Address'] || null;
    result.name = usbObj['kUSBProductString'] || usbObj['USB Product Name'] || null;
    result.type = getDarwinUsbType((usbObj['kUSBProductString'] || usbObj['USB Product Name'] || '').toLowerCase() + (removableDrive ? ' removable' : ''));
    result.removable = usbObj['non-removable'].toLowerCase() === 'no';
    result.vendor = usbObj['kUSBVendorString'] || usbObj['USB Vendor Name'] || null;
    result.manufacturer = usbObj['kUSBVendorString'] || usbObj['USB Vendor Name'] || null;
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

// function getWindowsUsbType(service) {
//   let result = ''
//   if (service.indexOf('usbhub3') >= 0) { result = 'Hub'; }
//   else if (service.indexOf('usbstor') >= 0) { result = 'Storage'; }
//   else if (service.indexOf('hidusb') >= 0) { result = 'Input'; }
//   else if (service.indexOf('usbccgp') >= 0) { result = 'Controller'; }
//   else if (service.indexOf('usbxhci') >= 0) { result = 'Controller'; }
//   else if (service.indexOf('usbehci') >= 0) { result = 'Controller'; }
//   else if (service.indexOf('kbdhid') >= 0) { result = 'Keyboard'; }
//   else if (service.indexOf('keyboard') >= 0) { result = 'Keyboard'; }
//   else if (service.indexOf('pointing') >= 0) { result = 'Mouse'; }
//   else if (service.indexOf('disk') >= 0) { result = 'Storage'; }
//   else if (service.indexOf('usbhub') >= 0) { result = 'Hub'; }
//   else if (service.indexOf('bthusb') >= 0) { result = ''; }
//   else if (service.indexOf('bth') >= 0) { result = ''; }
//   else if (service.indexOf('rfcomm') >= 0) { result = ''; }
//   return result;
// }

function getWindowsUsbTypeCreation(creationclass, name) {
  let result = '';
  if (name.indexOf('storage') >= 0) { result = 'Storage'; }
  else if (name.indexOf('speicher') >= 0) { result = 'Storage'; }
  else if (creationclass.indexOf('usbhub') >= 0) { result = 'Hub'; }
  else if (creationclass.indexOf('storage') >= 0) { result = 'Storage'; }
  else if (creationclass.indexOf('usbcontroller') >= 0) { result = 'Controller'; }
  else if (creationclass.indexOf('keyboard') >= 0) { result = 'Keyboard'; }
  else if (creationclass.indexOf('pointing') >= 0) { result = 'Mouse'; }
  else if (creationclass.indexOf('disk') >= 0) { result = 'Storage'; }
  return result;
}

function parseWindowsUsb(lines, id) {
  const usbType = getWindowsUsbTypeCreation(util.getValue(lines, 'CreationClassName', ':').toLowerCase(), util.getValue(lines, 'name', ':').toLowerCase());

  if (usbType) {
    const result = {};
    result.bus = null;
    result.deviceId = util.getValue(lines, 'deviceid', ':');
    result.id = id;
    result.name = util.getValue(lines, 'name', ':');
    result.type = usbType;
    result.removable = null;
    result.vendor = null;
    result.manufacturer = util.getValue(lines, 'Manufacturer', ':');
    result.maxPower = null;
    result.serialNumber = null;

    return result;
  } else {
    return null;
  }

}

function usb(callback) {

  return new Promise((resolve) => {
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
        let cmd = 'ioreg -p IOUSB -c AppleUSBRootHubDevice -w0 -l';
        exec(cmd, { maxBuffer: 1024 * 1024 * 128 }, function (error, stdout) {
          if (!error) {
            const parts = (stdout.toString()).split(' +-o ');
            for (let i = 1; i < parts.length; i++) {
              const usb = parseDarwinUsb(parts[i]);
              if (usb) {
                result.push(usb);
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
        util.powerShell('Get-WmiObject CIM_LogicalDevice | where { $_.Description -match "^USB"}').then((stdout, error) => {
          if (!error) {
            const parts = stdout.toString().split(/\n\s*\n/);
            for (let i = 0; i < parts.length; i++) {
              const usb = parseWindowsUsb(parts[i].split('\n'), i);
              if (usb) {
                result.push(usb);
              }
            }
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });

        // util.powerShell("gwmi Win32_USBControllerDevice |\%{[wmi]($_.Dependent)}").then(data => {

        //   const parts = data.toString().split(/\n\s*\n/);
        //   for (let i = 0; i < parts.length; i++) {
        //     const usb = parseWindowsUsb(parts[i].split('\n'), i)
        //     if (usb) {
        //       result.push(usb)
        //     }
        //   }
        //   if (callback) {
        //     callback(result);
        //   }
        //   resolve(result);
        // });
      }
      if (_sunos || _freebsd || _openbsd || _netbsd) {
        resolve(null);
      }
    });
  });
}

exports.usb = usb;

