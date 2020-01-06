'use strict';
// @ts-check
// ==================================================================================
// wifi.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2020
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 9. wifi
// ----------------------------------------------------------------------------------

const os = require('os');
const exec = require('child_process').exec;
const util = require('./util');

let _platform = process.platform;

const _linux = (_platform === 'linux');
const _darwin = (_platform === 'darwin');
const _windows = (_platform === 'win32');

function wifiDBFromQuality(quality) {
  return (parseFloat(quality) / 2 - 100);
}

function wifiQualityFromDB(db) {
  const result = 2 * (parseFloat(db) + 100);
  return result <= 100 ? result : 100;
}

function wifiFrequencyFromChannel(channel) {
  const frequencies = {
    1: 2412,
    2: 2417,
    3: 2422,
    4: 2427,
    5: 2432,
    6: 2437,
    7: 2442,
    8: 2447,
    9: 2452,
    10: 2457,
    11: 2462,
    12: 2467,
    13: 2472,
    14: 2484,
    32: 5160,
    34: 5170,
    36: 5180,
    38: 5190,
    40: 5200,
    42: 5210,
    44: 5220,
    46: 5230,
    48: 5240,
    50: 5250,
    52: 5260,
    54: 5270,
    56: 5280,
    58: 5290,
    60: 5300,
    62: 5310,
    64: 5320,
    68: 5340,
    96: 5480,
    100: 5500,
    102: 5510,
    104: 5520,
    106: 5530,
    108: 5540,
    110: 5550,
    112: 5560,
    114: 5570,
    116: 5580,
    118: 5590,
    120: 5600,
    122: 5610,
    124: 5620,
    126: 5630,
    128: 5640,
    132: 5660,
    134: 5670,
    136: 5680,
    138: 5690,
    140: 5700,
    142: 5710,
    144: 5720,
    149: 5745,
    151: 5755,
    153: 5765,
    155: 5775,
    157: 5785,
    159: 5795,
    161: 5805,
    165: 5825,
    169: 5845,
    173: 5865,
    183: 4915,
    184: 4920,
    185: 4925,
    187: 4935,
    188: 4940,
    189: 4945,
    192: 4960,
    196: 4980
  };
  return {}.hasOwnProperty.call(frequencies, channel) ? frequencies[channel] : -1;
}

function wifiNetworks(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = [];
      if (_linux) {
        let cmd = 'nmcli --terse --fields active,ssid,bssid,mode,chan,freq,signal,security,wpa-flags,rsn-flags device wifi list 2>/dev/null';
        exec(cmd, { maxBuffer: 1024 * 20000 }, function (error, stdout) {

          const parts = stdout.toString().split('ACTIVE:');
          parts.shift();
          parts.forEach(part => {
            part = 'ACTIVE:' + part;
            const lines = part.split(os.EOL);
            const channel = util.getValue(lines, 'CHAN');
            const frequency = util.getValue(lines, 'FREQ').toLowerCase().replace('mhz', '').trim();
            const security = util.getValue(lines, 'SECURITY').replace('(', '').replace(')', '');
            const wpaFlags = util.getValue(lines, 'WPA-FLAGS').replace('(', '').replace(')', '');
            const rsnFlags = util.getValue(lines, 'RSN-FLAGS').replace('(', '').replace(')', '');
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
            });
          });

          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      } else if (_darwin) {
        let cmd = '/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -s';
        exec(cmd, { maxBuffer: 1024 * 20000 }, function (error, stdout) {
          const lines = stdout.toString().split(os.EOL);
          if (lines && lines.length > 1) {
            const parsedhead = util.parseHead(lines[0], 1);
            if (parsedhead.length >= 7) {
              lines.shift();
              lines.forEach(line => {
                if (line.trim()) {
                  const channelStr = line.substring(parsedhead[3].from, parsedhead[3].to).trim();
                  const channel = channelStr ? parseInt(channelStr, 10) : -1;
                  const signalLevel = line.substring(parsedhead[2].from, parsedhead[2].to).trim();
                  const securityAll = line.substring(parsedhead[6].from, 1000).trim().split(' ');
                  let security = [];
                  let wpaFlags = [];
                  securityAll.forEach(securitySingle => {
                    if (securitySingle.indexOf('(') > 0) {
                      const parts = securitySingle.split('(');
                      security.push(parts[0]);
                      wpaFlags = wpaFlags.concat(parts[1].replace(')', '').split(','));
                    }
                  });
                  wpaFlags = Array.from(new Set(wpaFlags));
                  result.push({
                    ssid: line.substring(parsedhead[0].from, parsedhead[0].to).trim(),
                    bssid: line.substring(parsedhead[1].from, parsedhead[1].to).trim(),
                    mode: '',
                    channel,
                    frequency: wifiFrequencyFromChannel(channel),
                    signalLevel: signalLevel ? parseInt(signalLevel, 10) : -1,
                    quality: wifiQualityFromDB(signalLevel),
                    security,
                    wpaFlags,
                    rsnFlags: []
                  });
                }
              });
            }
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      } else if (_windows) {
        let cmd = 'chcp 65001 && netsh wlan show networks mode=Bssid';
        exec(cmd, util.execOptsWin, function (error, stdout) {

          const parts = stdout.toString('utf8').split(os.EOL + os.EOL + 'SSID ');
          parts.shift();

          parts.forEach(part => {
            const lines = part.split(os.EOL);
            if (lines && lines.length >= 8 && lines[0].indexOf(':') >= 0) {
              let bssid = lines[4].split(':');
              bssid.shift();
              bssid = bssid.join(':').trim();
              const channel = lines[7].split(':').pop().trim();
              const quality = lines[5].split(':').pop().trim();
              result.push({
                ssid: lines[0].split(':').pop().trim(),
                bssid,
                mode: '',
                channel: channel ? parseInt(channel, 10) : -1,
                frequency: wifiFrequencyFromChannel(channel),
                signalLevel: wifiDBFromQuality(quality),
                quality: quality ? parseInt(quality, 10) : -1,
                security: [lines[2].split(':').pop().trim()],
                wpaFlags: [lines[3].split(':').pop().trim()],
                rsnFlags: []
              });
            }
          });

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

exports.wifiNetworks = wifiNetworks;
