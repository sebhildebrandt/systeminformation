'use strict';
// @ts-check
// ==================================================================================
// utils.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2019
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 0. helper functions
// ----------------------------------------------------------------------------------

const os = require('os');
const fs = require('fs');
const spawn = require('child_process').spawn;
const exec = require('child_process').exec;
const execSync = require('child_process').execSync;

let _platform = process.platform;
const _linux = (_platform === 'linux');
const _darwin = (_platform === 'darwin');
const _windows = (_platform === 'win32');
const _freebsd = (_platform === 'freebsd');
const _openbsd = (_platform === 'openbsd');
// const _sunos = (_platform === 'sunos');

let _cores = 0;
let wmic = '';
let codepage = '';

const execOptsWin = {
  windowsHide: true,
  maxBuffer: 1024 * 2000,
  encoding: 'UTF-8'
};

function isFunction(functionToCheck) {
  let getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

function unique(obj) {
  let uniques = [];
  let stringify = {};
  for (let i = 0; i < obj.length; i++) {
    let keys = Object.keys(obj[i]);
    keys.sort(function (a, b) { return a - b; });
    let str = '';
    for (let j = 0; j < keys.length; j++) {
      str += JSON.stringify(keys[j]);
      str += JSON.stringify(obj[i][keys[j]]);
    }
    if (!stringify.hasOwnProperty(str)) {
      uniques.push(obj[i]);
      stringify[str] = true;
    }
  }
  return uniques;
}

function sortByKey(array, keys) {
  return array.sort(function (a, b) {
    let x = '';
    let y = '';
    keys.forEach(function (key) {
      x = x + a[key]; y = y + b[key];
    });
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  });
}

function cores() {
  if (_cores === 0) {
    _cores = os.cpus().length;
  }
  return _cores;
}

function getValue(lines, property, separator, trimmed) {
  separator = separator || ':';
  property = property.toLowerCase();
  trimmed = trimmed || false;
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].toLowerCase().replace(/\t/g, '');
    if (trimmed) {
      line = line.trim();
    }
    if (line.startsWith(property)) {
      const parts = lines[i].split(separator);
      if (parts.length >= 2) {
        parts.shift();
        return parts.join(separator).trim();
      } else {
        return '';
      }
    }
  }
  return '';
}

function decodeEscapeSequence(str, base) {
  base = base || 16;
  return str.replace(/\\x([0-9A-Fa-f]{2})/g, function () {
    return String.fromCharCode(parseInt(arguments[1], base));
  });
}

function parseTime(t) {
  t = t.toUpperCase();
  const parts = t.split(':');
  let isPM = (parts[1] && parts[1].indexOf('PM') > -1);
  let hour = parseInt(parts[0], 10);
  const min = parseInt(parts[1], 10);
  hour = isPM && hour < 12 ? hour + 12 : hour;
  return ('0' + hour).substr(-2) + ':' + ('0' + min).substr(-2);
}

function parseDateTime(dt) {
  const result = {
    date: '',
    time: ''
  };
  const parts = dt.split(' ');
  if (parts[0]) {
    if (parts[0].indexOf('/') >= 0) {
      // Dateformat: mm/dd/yyyy
      const dtparts = parts[0].split('/');
      if (dtparts.length === 3) {
        result.date = dtparts[2] + '-' + ('0' + dtparts[0]).substr(-2) + '-' + ('0' + dtparts[1]).substr(-2);
      }
    }
    if (parts[0].indexOf('.') >= 0) {
      // Dateformat: dd.mm.yyyy
      const dtparts = parts[0].split('.');
      if (dtparts.length === 3) {
        result.date = dtparts[2] + '-' + ('0' + dtparts[1]).substr(-2) + '-' + ('0' + dtparts[0]).substr(-2);
      }
    }
    if (parts[0].indexOf('-') >= 0) {
      // Dateformat: yyyy-mm-dd
      const dtparts = parts[0].split('-');
      if (dtparts.length === 3) {
        result.date = dtparts[0] + '-' + ('0' + dtparts[1]).substr(-2) + '-' + ('0' + dtparts[2]).substr(-2);
      }
    }
  }
  if (parts[1]) {
    let time = parts[1] + (parts[2] ? parts[2] : '');
    result.time = parseTime(time);
  }
  return result;
}

function parseHead(head, rights) {
  let space = (rights > 0);
  let count = 1;
  let from = 0;
  let to = 0;
  let result = [];
  for (let i = 0; i < head.length; i++) {
    if (count <= rights) {
      // if (head[i] === ' ' && !space) {
      if (/\s/.test(head[i]) && !space) {
        to = i - 1;
        result.push({
          from: from,
          to: to + 1,
          cap: head.substring(from, to + 1)
        });
        from = to + 2;
        count++;
      }
      space = head[i] === ' ';
    } else {
      if (!/\s/.test(head[i]) && space) {
        to = i - 1;
        if (from < to) {
          result.push({
            from: from,
            to: to,
            cap: head.substring(from, to)
          });
        }
        from = to + 1;
        count++;
      }
      space = head[i] === ' ';
    }
  }
  to = 1000;
  result.push({
    from: from,
    to: to,
    cap: head.substring(from, to)
  });
  let len = result.length;
  for (var i = 0; i < len; i++) {
    if (result[i].cap.replace(/\s/g, '').length === 0) {
      if (i + 1 < len) {
        result[i].to = result[i + 1].to;
        result[i].cap = result[i].cap + result[i + 1].cap;
        result.splice(i + 1, 1);
        len = len - 1;
      }
    }
  }
  return result;
}

function findObjectByKey(array, key, value) {
  for (let i = 0; i < array.length; i++) {
    if (array[i][key] === value) {
      return i;
    }
  }
  return -1;
}

function getWmic() {
  if (os.type() === 'Windows_NT' && !wmic) {
    if (fs.existsSync(process.env.WINDIR + '\\system32\\wbem\\wmic.exe')) {
      wmic = process.env.WINDIR + '\\system32\\wbem\\wmic.exe';
    } else wmic = 'wmic';
  }
  return wmic;
}

function powerShell(cmd) {

  let result = '';

  return new Promise((resolve) => {
    process.nextTick(() => {
      try {
        const child = spawn('powershell.exe', ['-NoLogo', '-InputFormat', 'Text', '-NoExit', '-ExecutionPolicy', 'Unrestricted', '-Command', '-'], {
          stdio: 'pipe'
        });

        if (child && child.pid) {
          child.stdout.on('data', function (data) {
            result = result + data.toString('utf8');
          });
          child.stderr.on('data', function () {
            child.kill();
            resolve(result);
          });
          child.on('close', function () {
            child.kill();
            resolve(result);
          });
          child.on('error', function () {
            child.kill();
            resolve(result);
          });
          try {
            child.stdin.write(cmd + os.EOL);
            child.stdin.write('exit' + os.EOL);
            child.stdin.end();
          } catch (e) {
            child.kill();
            resolve(result);
          }
        } else {
          resolve(result);
        }
      } catch (e) {
        resolve(result);
      }
    });
  });
}

function getCodepage() {
  if (_windows) {
    if (!codepage) {
      try {
        const stdout = execSync('chcp');
        const lines = stdout.toString().split('\r\n');
        const parts = lines[0].split(':');
        codepage = parts.length > 1 ? parts[1].replace('.', '') : '';
      } catch (err) {
        codepage = '437';
      }
    }
    return codepage;
  }
  if (_linux || _darwin || _freebsd || _openbsd) {
    if (!codepage) {
      try {
        const stdout = execSync('echo $LANG');
        const lines = stdout.toString().split('\r\n');
        const parts = lines[0].split('.');
        codepage = parts.length > 1 ? parts[1].trim() : '';
        if (!codepage) {
          codepage = 'UTF-8';
        }
      } catch (err) {
        codepage = 'UTF-8';
      }
    }
    return codepage;
  }
}

function isRaspberry() {
  const PI_MODEL_NO = [
    'BCM2708',
    'BCM2709',
    'BCM2710',
    'BCM2835',
    'BCM2837B0'
  ];
  let cpuinfo = [];
  try {
    cpuinfo = fs.readFileSync('/proc/cpuinfo', { encoding: 'utf8' }).split('\n');
  } catch (e) {
    return false;
  }
  const hardware = getValue(cpuinfo, 'hardware');
  return (hardware && PI_MODEL_NO.indexOf(hardware) > -1);
}

function isRaspbian() {
  let osrelease = [];
  try {
    osrelease = fs.readFileSync('/etc/os-release', { encoding: 'utf8' }).split('\n');
  } catch (e) {
    return false;
  }
  const id = getValue(osrelease, 'id');
  return (id && id.indexOf('raspbian') > -1);
}

function execWin(cmd, opts, callback) {
  if (!callback) {
    callback = opts;
    opts = execOptsWin;
  }
  let newCmd = 'chcp 65001 > nul && cmd /C ' + cmd + ' && chcp ' + codepage + ' > nul';
  exec(newCmd, opts, function (error, stdout) {
    callback(error, stdout);
  });
}

function nanoSeconds() {
  const time = process.hrtime();
  if (!Array.isArray(time) || time.length !== 2) {
    return 0;
  }
  return +time[0] * 1e9 + +time[1];
}

function countUniqueLines(lines, startingWith) {
  startingWith = startingWith || '';
  const uniqueLines = [];
  lines.forEach(line => {
    if (line.indexOf(startingWith) === 0) {
      if (uniqueLines.indexOf(line) === -1) {
        uniqueLines.push(line);
      }
    }
  });
  return uniqueLines.length;
}
function noop() { }

exports.execOptsWin = execOptsWin;
exports.getCodepage = getCodepage;
exports.execWin = execWin;
exports.isFunction = isFunction;
exports.unique = unique;
exports.sortByKey = sortByKey;
exports.cores = cores;
exports.getValue = getValue;
exports.decodeEscapeSequence = decodeEscapeSequence;
exports.parseDateTime = parseDateTime;
exports.parseHead = parseHead;
exports.findObjectByKey = findObjectByKey;
exports.getWmic = getWmic;
exports.powerShell = powerShell;
exports.nanoSeconds = nanoSeconds;
exports.countUniqueLines = countUniqueLines;
exports.noop = noop;
exports.isRaspberry = isRaspberry;
exports.isRaspbian = isRaspbian;
