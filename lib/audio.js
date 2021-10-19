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

function parseAudioType(type, input, output) {
  const speaker = 'Speaker';
  const microphone = 'Microphone';
  switch (true) {
    case type.indexOf('speak') >= 0:
      return speaker;
    case type.indexOf('laut') >= 0:
      return speaker;
    case type.indexOf('loud') >= 0:
      return speaker;
    case type.indexOf('head') >= 0:
      return 'Headset';
    case type.indexOf('mic') >= 0:
      return microphone;
    case type.indexOf('mikr') >= 0:
      return microphone;
    case type.indexOf('controll') >= 0:
      return 'Controller';
    case type.indexOf('line o') >= 0:
      return 'Line Out';
    case type.indexOf('digital o') >= 0:
      return 'Digital Out';
    case output:
      return speaker;
    case input:
      return microphone;
    default:
      return '';
  }
}


function getLinuxAudioPci() {
  let cmd = 'lspci -v 2>/dev/null';
  let result = [];
  try {
    const parts = execSync(cmd).toString().split('\n\n');
    for (let i = 0; i < parts.length; i++) {
      const lines = parts[i].split('\n');
      if (lines && lines.length && lines[0].toLowerCase().indexOf('audio') >= 0) {
        const audio = {};
        audio.slotId = lines[0].split(' ')[0];
        audio.driver = util.getValue(lines, 'Kernel driver in use', ':', true) || util.getValue(lines, 'Kernel modules', ':', true);
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

  const pciMatch = audioPCI.filter(function (item) { return item.slotId === slotId; });

  result.id = slotId;
  result.name = util.getValue(lines, 'SDevice');
  // result.type = util.getValue(lines, 'Class');
  result.manufacturer = util.getValue(lines, 'SVendor');
  result.revision = util.getValue(lines, 'Rev');
  result.driver = pciMatch && pciMatch.length === 1 && pciMatch[0].driver ? pciMatch[0].driver : '';
  result.default = null;
  result.channel = 'PCIe';
  result.type = parseAudioType(result.name, null, null);
  result.in = null;
  result.out = null;
  result.status = 'online';

  return result;
}

function parseDarwinChannel(channel) {
  const darwinChannel = channel.toLowerCase();
  switch (true) {
    case darwinChannel.indexOf('builtin') >= 0:
      return 'Built-In';
    case darwinChannel.indexOf('extern') >= 0:
      return 'Audio-Jack';
    case darwinChannel.indexOf('hdmi') >= 0:
      return 'HDMI';
    case darwinChannel.indexOf('displayport') >= 0:
      return 'Display-Port';
    case darwinChannel.indexOf('usb') >= 0:
      return 'USB';
    case darwinChannel.indexOf('pci') >= 0:
      return 'PCIe';
    default:
      return '';
  }
}

function parseDarwinAudio(audioObject, id) {
  const result = {};
  const channelStr = ((audioObject.coreaudio_device_transport || '') + ' ' + (audioObject._name || '')).toLowerCase();

  result.id = id;
  result.name = audioObject._name;
  result.manufacturer = audioObject.coreaudio_device_manufacturer;
  result.revision = null;
  result.driver = null;
  result.default = !!(audioObject.coreaudio_default_audio_input_device || '') || !!(audioObject.coreaudio_default_audio_output_device || '');
  result.channel = parseDarwinChannel(channelStr);
  result.type = parseAudioType(result.name, !!(audioObject.coreaudio_device_input || ''), !!(audioObject.coreaudio_device_output || ''));
  result.in = !!(audioObject.coreaudio_device_input || '');
  result.out = !!(audioObject.coreaudio_device_output || '');
  result.status = 'online';

  return result;
}

function parseWindowsAudio(lines) {
  const result = {};
  const status = util.getValue(lines, 'StatusInfo', ':');
  // const description = util.getValue(lines, 'Description', ':');

  result.id = util.getValue(lines, 'DeviceID', ':'); // PNPDeviceID??
  result.name = util.getValue(lines, 'name', ':');
  result.manufacturer = util.getValue(lines, 'manufacturer', ':');
  result.revision = null;
  result.driver = null;
  result.default = null;
  result.channel = null;
  result.type = parseAudioType(result.name, null, null);
  result.in = null;
  result.out = null;
  result.status = status;

  return result;
}

function audio(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = [];
      if (_linux || _freebsd || _openbsd || _netbsd) {
        let cmd = 'lspci -vmm 2>/dev/null';
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
        let cmd = 'system_profiler SPAudioDataType -json';
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
        util.powerShell('Get-WmiObject Win32_SoundDevice | fl *').then((stdout, error) => {
          if (!error) {
            const parts = stdout.toString().split(/\n\s*\n/);
            for (let i = 0; i < parts.length; i++) {
              if (util.getValue(parts[i].split('\n'), 'name', ':')) {
                result.push(parseWindowsAudio(parts[i].split('\n')));
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

exports.audio = audio;
