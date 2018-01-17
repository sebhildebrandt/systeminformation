'use strict';
// ==================================================================================
// internet.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2018
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 12. Internet
// ----------------------------------------------------------------------------------

const os = require('os');
const exec = require('child_process').exec;
const util = require('./util');

let _platform = os.type();

const _linux = (_platform === 'Linux');
const _darwin = (_platform === 'Darwin');
const _windows = (_platform === 'Windows_NT');

// --------------------------
// check if external site is available

function inetChecksite(url, callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {

      let result = {
        url: url,
        ok: false,
        status: 404,
        ms: -1
      };
      if (url) {
        url = url.toLowerCase();
        let t = Date.now();
        if (_linux || _darwin) {
          let args = ' -I --connect-timeout 5 -m 5 ' + url + ' 2>/dev/null | head -n 1 | cut -d " " -f2';
          let cmd = 'curl';
          exec(cmd + args, function (error, stdout) {
            let statusCode = parseInt(stdout.toString());
            result.status = statusCode || 404;
            result.ok = !error && (statusCode === 200 || statusCode === 301 || statusCode === 302 || statusCode === 304);
            result.ms = (result.ok ? Date.now() - t : -1);
            if (callback) { callback(result); }
            resolve(result);
          });
        }
        if (_windows) {   // if this is stable, this can be used for all OS types
          const http = (url.startsWith('https:') ? require('https') : require('http'));
          try {
            http.get(url, (res) => {
              const statusCode = res.statusCode;

              result.status = statusCode || 404;
              result.ok = (statusCode === 200 || statusCode === 301 || statusCode === 302 || statusCode === 304);

              if (statusCode !== 200) {
                res.resume();
                result.ms = (result.ok ? Date.now() - t : -1);
                if (callback) { callback(result); }
                resolve(result);
              } else {
                // res.on('data', (chunk) => {  });
                res.on('end', () => {
                  result.ms = (result.ok ? Date.now() - t : -1);
                  if (callback) { callback(result); }
                  resolve(result);
                });
              }
            }).on('error', err => {
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

  return new Promise((resolve) => {
    process.nextTick(() => {
      let cmd;
      if (_linux || _darwin) {
        if (_linux) {
          cmd = 'ping -c 2 -w 3 ' + host + ' | grep rtt';
        }
        if (_darwin) {
          cmd = 'ping -c 2 -t 3 ' + host + ' | grep avg';
        }

        exec(cmd, function (error, stdout) {
          let result = -1;
          if (!error) {
            const line = stdout.toString().split('=');
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
      if (_windows) {
        exec('ping ' + host + ' -n 1', function (error, stdout) {
          let result = -1;
          if (!error) {
            let lines = stdout.toString().split('\r\n');
            lines.shift();
            lines.forEach(function (line) {
              if (line.toLowerCase().startsWith('    min')) {
                let l = line.replace(/ +/g, ' ').split(' ');
                if (l.length > 8) {
                  result = parseFloat(l[9]);
                }
              }
            });
          }
          if (callback) { callback(result); }
          resolve(result);
        });
      }
    });
  });
}

exports.inetLatency = inetLatency;
