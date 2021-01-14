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
// 16. audio
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

const winPrinterStatus = {
  1: 'Other',
  2: 'Unknown',
  3: 'Idle',
  4: 'Printing',
  5: 'Warmup',
  6: 'Stopped Printing',
  7: 'Offline',
}

function getLinuxAudioPci() {
  let cmd = 'lspci -v 2>/dev/null'
  let result = [];
  try {
    const parts = execSync(cmd).toString().split('\n\n');
    for (let i = 0; i < parts.length; i++) {
      const lines = parts[i].split('\n');
      if (lines && lines.length && lines[0].toLowerCass().indexOf('audio') >= 0) {
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

function parseLinuxAudioPciMM(lines, audioPCI) {
  const result = {};
  const slotId = util.getValue(lines, 'Slot');

  const pciMatch = audioPCI.filter(function (item) { return item.slotId === slotId })

  result.id = slotId;
  result.name = util.getValue(lines, 'SDevice');
  result.type = util.getValue(lines, 'Class');
  result.manufacturer = util.getValue(lines, 'SVendor');
  result.builtIn = null;
  result.default = null;
  result.revision = util.getValue(lines, 'Revision');
  result.driver = pciMatch && pciMatch.length === 1 && pciMatch[0].driver ? pciMatch[0].driver : '';
  result.channel = null;
  result.in = null;
  result.out = null;
  result.status = 'online';

  return result;
}

function parseLinuxLpstatPrinter(lines, id) {
  const result = {};
  result.id = id
  result.name = util.getValue(lines, 'Description', ':', true);
  result.model = lines.length > 0 && lines[0] ? lines[0].split(' ')[0] : '';
  result.uri = null;
  result.uuid = null
  result.status = lines.length > 0 && lines[0] ? (lines[0].indexOf(' idle') > 0 ? 'idle' : (lines[0].indexOf(' printing') > 0 ? 'printing' : 'unknown')) : null
  result.local = util.getValue(lines, 'Location', ':', true).toLowerCase().startsWith('local');
  result.default = null;
  result.shared = util.getValue(lines, 'Shared', ' ').toLowerCase().startsWith('yes');

  return result;
}

// id
// name
// type
// manufacturer
// builtIn
// default
// revision
// driver
// (onboard)
// #channels
//   in
//   out
// interfaceType HDMI, Display - Port, Build -in, USB, PCIe(darwin: coreaudio_device_transport)
// status

function parseDarwinChannel(str) {
  let result = '';

  if (str.indexOf('builtin') >= 0) { result = 'Built-In'; }
  if (str.indexOf('hdmi') >= 0) { result = 'HDMI'; }
  if (str.indexOf('displayport') >= 0) { result = 'Display-Port'; }
  if (str.indexOf('usb') >= 0) { result = 'USB'; }
  if (str.indexOf('pci') >= 0) { result = 'PCIe'; }

  return result;
}

function parseDarwinAudio(audioObject, id) {
  const result = {};
  const channelStr = (audioObject.coreaudio_device_transport || '');

  result.id = id;
  result.name = audioObject._name
  result.manufacturer = audioObject.coreaudio_device_manufacturer;
  result.default = !!(audioObject.coreaudio_default_audio_input_device || '') || !!(audioObject.coreaudio_default_audio_output_device || '');
  result.revision = null;
  result.driver = null;
  result.channel = parseDarwinChannel(channelStr);
  result.in = !!(audioObject.coreaudio_device_input || '')
  result.out = !!(audioObject.coreaudio_device_output || '')
  result.status = 'online';

  return result;
}

function parseWindowsAudio(lines, id) {
  const result = {};
  const status = parseInt(util.getValue(lines, 'PrinterStatus', '='), 10);

  result.id = id;
  result.name = util.getValue(lines, 'name', '=');
  result.model = util.getValue(lines, 'DriverName', '=');
  result.uri = null;
  result.uuid = null
  result.status = winPrinterStatus[status] ? winPrinterStatus[status] : null;
  result.local = util.getValue(lines, 'Local', '=') === 'TRUE';
  result.default = util.getValue(lines, 'Default', '=') === 'TRUE';
  result.shared = util.getValue(lines, 'Shared', '=') === 'TRUE';

  return result;
}

function audio(callback) {

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
          if (result.length === 0) {
            if (_linux) {
              cmd = 'export LC_ALL=C; lpstat -lp 2>/dev/null; unset LC_ALL';
              // lpstat
              exec(cmd, function (error, stdout) {
                const parts = ('\n' + stdout.toString()).split('\nprinter ');
                for (let i = 1; i < parts.length; i++) {
                  const printers = parseLinuxLpstatPrinter(parts[i].split('\n'), i);
                  result.push(printers);
                }
              });
              if (callback) {
                callback(result);
              }
              resolve(result);
            } else {
              if (callback) {
                callback(result);
              }
              resolve(result);
            }
          } else {
            if (callback) {
              callback(result);
            }
            resolve(result);
          }
        });
      }
      if (_darwin) {
        let cmd = 'system_profiler SPAudioDataType -json'
        exec(cmd, function (error, stdout) {
          if (!error) {
            try {
              const outObj = JSON.parse(stdout.toString());
              if (outObj.SPAudioDataType && outObj.SPAudioDataType.length && outObj.SPAudioDataType[0] && outObj.SPAudioDataType[0]['_items'] && outObj.SPAudioDataType[0]['_items'].length) {
                for (let i = 0; i < outObj.SPAudioDataType[0]['_items'].length; i++) {
                  const audio = parseDarwinAudio(outObj.SPAudioDataType[0]['_items'][i], i);
                  result.push(audio);
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
        util.wmic('printer get /value', function (error, stdout) {
          if (!error) {
            const parts = stdout.toString().split(/\n\s*\n/);
            for (let i = 0; i < parts.length; i++) {
              result.push(parseWindowsAudio(parts[i].split('\n'), i))
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

exports.audio = audio;
