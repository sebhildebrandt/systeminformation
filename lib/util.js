'use strict';
// ==================================================================================
// utils.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2018
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 0. helper functions
// ----------------------------------------------------------------------------------

const os = require('os');
const fs = require('fs');

let _cores = 0;
let wmic = '';

function isFunction(functionToCheck) {
  let getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

function unique(obj){
  let uniques=[];
  let stringify={};
  for(let i=0;i<obj.length;i++){
    let keys=Object.keys(obj[i]);
    keys.sort(function(a,b) { return a-b; });
    let str='';
    for(let j=0;j<keys.length;j++){
      str+= JSON.stringify(keys[j]);
      str+= JSON.stringify(obj[i][keys[j]]);
    }
    if(!stringify.hasOwnProperty(str)){
      uniques.push(obj[i]);
      stringify[str]=true;
    }
  }
  return uniques;
}

function sortByKey(array, keys) {
  return array.sort(function(a, b) {
    let x ='';
    let y ='';
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
    let line = lines[i].toLowerCase();
    if (trimmed) {
      line = line.trim();
    }
    if (line.toLowerCase().startsWith(property)) {
      const parts = lines[i].split(separator);
      if (parts.length >= 2) {
        parts.shift();
        return parts.join(':').trim();
      } else {
        return '';
      }
    }
  }
  return '';
}

function decodeEscapeSequence(str, base) {
  base = base || 16;
  return str.replace(/\\x([0-9A-Fa-f]{2})/g, function() {
    return String.fromCharCode(parseInt(arguments[1], base));
  });
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
    result.time = parts[1];
  }
  return result;
}

function getWmic() {
  if (os.type() === 'Windows_NT' && !wmic) {
    if (fs.existsSync(process.env.WINDIR + '\\system32\\wbem\\wmic.exe')) {
      wmic = process.env.WINDIR + '\\system32\\wbem\\wmic.exe';
    } else wmic = 'wmic'
  }
  return wmic;
}

exports.isFunction = isFunction;
exports.unique = unique;
exports.sortByKey= sortByKey;
exports.cores = cores;
exports.getValue = getValue;
exports.decodeEscapeSequence = decodeEscapeSequence;
exports.parseDateTime = parseDateTime;
exports.getWmic = getWmic;
