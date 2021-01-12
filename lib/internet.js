'use strict';
// @ts-check
// ==================================================================================
// internet.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2021
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 12. Internet
// ----------------------------------------------------------------------------------

const exec = require('child_process').exec;
const execFile = require('child_process').execFile;
const util = require('./util');

let _platform = process.platform;

const _linux = (_platform === 'linux');
const _darwin = (_platform === 'darwin');
const _windows = (_platform === 'win32');
const _freebsd = (_platform === 'freebsd');
const _openbsd = (_platform === 'openbsd');
const _netbsd = (_platform === 'netbsd');
const _sunos = (_platform === 'sunos');

// --------------------------
// check if external site is available

function inetChecksite(url, callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      let urlSanitized = '';
      const s = util.sanitizeShellString(url);
      for (let i = 0; i <= 2000; i++) {
        if (!(s[i] === undefined ||
          s[i] === ' ' ||
          s[i] === '{' ||
          s[i] === '}')) {
          s[i].__proto__.toLowerCase = util.stringToLower;
          const sl = s[i].toLowerCase();
          if (sl && sl[0] && !sl[1]) {
            urlSanitized = urlSanitized + sl[0];
          }
        }
      }
      let result = {
        url: urlSanitized,
        ok: false,
        status: 404,
        ms: null
      };
      try {
        if (urlSanitized && !util.isPrototypePolluted()) {
          let t = Date.now();
          if (_linux || _freebsd || _openbsd || _netbsd || _darwin || _sunos) {
            let args = ' -I --connect-timeout 5 -m 5 ' + urlSanitized + ' 2>/dev/null | head -n 1 | cut -d " " -f2';
            let cmd = 'curl';
            exec(cmd + args, function (error, stdout) {
              let statusCode = parseInt(stdout.toString());
              result.status = statusCode || 404;
              result.ok = !error && (statusCode === 200 || statusCode === 301 || statusCode === 302 || statusCode === 304);
              result.ms = (result.ok ? Date.now() - t : null);
              if (callback) { callback(result); }
              resolve(result);
            });
          }
          if (_windows) {   // if this is stable, this can be used for all OS types
            const http = (urlSanitized.startsWith('https:') ? require('https') : require('http'));
            try {
              http.get(urlSanitized, (res) => {
                const statusCode = res.statusCode;

                result.status = statusCode || 404;
                result.ok = (statusCode === 200 || statusCode === 301 || statusCode === 302 || statusCode === 304);

                if (statusCode !== 200) {
                  res.resume();
                  result.ms = (result.ok ? Date.now() - t : null);
                  if (callback) { callback(result); }
                  resolve(result);
                } else {
                  res.on('data', () => { });
                  res.on('end', () => {
                    result.ms = (result.ok ? Date.now() - t : null);
                    if (callback) { callback(result); }
                    resolve(result);
                  });
                }
              }).on('error', () => {
                if (callback) { callback(result); }
                resolve(result);
              });
            } catch (err) {
              if (callback) { callback(result); }
              resolve(result);
            }
          }
        } else {
          if (callback) { callback(result); }
          resolve(result);
        }
      } catch (err) {
        if (callback) { callback(result); }
        resolve(result);
      }
    });
  });
}

exports.inetChecksite = inetChecksite;

// --------------------------
// check inet latency

function inetLatency(host, callback) {

  // fallback - if only callback is given
  if (util.isFunction(host) && !callback) {
    callback = host;
    host = '';
  }

  host = host || '8.8.8.8';
  const hostSanitized = (util.isPrototypePolluted() ? '8.8.8.8' : util.sanitizeShellString(host)).trim();

  return new Promise((resolve) => {
    process.nextTick(() => {
      let params;
      let filt;
      if (_linux || _freebsd || _openbsd || _netbsd || _darwin) {
        if (_linux) {
          params = '-c 2 -w 3 ' + hostSanitized;
          filt = 'rtt';
        }
        if (_freebsd || _openbsd || _netbsd) {
          params = '-c 2 -t 3 ' + hostSanitized;
          filt = 'round-trip';
        }
        if (_darwin) {
          params = '-c2 -t3 ' + hostSanitized;
          filt = 'avg';
        }
        execFile('ping', params.split(' '), function (error, stdout) {
          let result = null;
          if (!error) {
            const lines = stdout.toString().split('\n').filter(line => line.indexOf(filt) >= 0).join('\n');

            const line = lines.split('=');
            if (line.length > 1) {
              const parts = line[1].split('/');
              if (parts.length > 1) {
                result = parseFloat(parts[1]);
              }
            }
          }
          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_sunos) {
        const params = '-s -a ' + hostSanitized + ' 56 2';
        const filt = 'avg';
        execFile('ping', params.split(' '), { timeout: 3000 }, function (error, stdout) {
          let result = null;
          if (!error) {
            const lines = stdout.toString().split('\n').filter(line => line.indexOf(filt) >= 0).join('\n');
            const line = lines.split('=');
            if (line.length > 1) {
              const parts = line[1].split('/');
              if (parts.length > 1) {
                result = parseFloat(parts[1].replace(',', '.'));
              }
            }
          }
          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_windows) {
        let result = null;
        try {
          const params = hostSanitized + ' -n 1';
          execFile('ping', params.split(' '), util.execOptsWin, function (error, stdout) {
            if (!error) {
              let lines = stdout.toString().split('\r\n');
              lines.shift();
              lines.forEach(function (line) {
                if ((line.toLowerCase().match(/ms/g) || []).length === 3) {
                  let l = line.replace(/ +/g, ' ').split(' ');
                  if (l.length > 6) {
                    result = parseFloat(l[l.length - 1]);
                  }
                }
              });
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
}

exports.inetLatency = inetLatency;
