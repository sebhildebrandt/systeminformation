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

function unique(obj) {
  let uniques = [];
  let stringify = {};
  for (let i = 0; i < obj.length; i++) {
    let keys = Object.keys(obj[i]);
    keys.sort(function(a, b) {
      return a - b;
    });
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
  return array.sort(function(a, b) {
    let x = '';
    let y = '';
    keys.forEach(function(key) {
      x = x + a[key];
      y = y + b[key];
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



// function dmidecodeToObject
// added by Christopher Harrison originally developed for the node dmidecode module
// Copyright (c) 2017-2018 Christopher Harrison
// License MIT

function dmidecodeToObject(data) {
  var obj = {};
  var header = 1;
  let lines = data.toString().split('\n');
  var handle;
  var secondaryKey;
  var objArray = {};
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].match(/Table at/g) && header) {
      header = 0;
      i = i + 2; // move to the next available line for injust
    }
    if (header) {
      continue; // we are not at the data yet, skipping
    }
    var tabs = lines[i].split('\t'); // the file is tab delimited based on element, split according
    lines[i].trimmed;
    if (tabs[1] == undefined && tabs[2] == undefined && tabs[0] != undefined) {
      // we are first order, add to root object
      if (lines[i].startsWith('Handle 0x0') || lines[i] == '') {
        continue;
      }
      if (lines[i].startsWith('End Of Table')) {
        if (handle == undefined) {
          continue; // unlikely
        }
      }
      // Do I have any data to build my object?
      if (Object.keys(objArray).length != 0) {
        //console.log(objArray);
        if (obj[handle] == undefined) {
          obj[handle] = objArray;
        } else {
          if (Array.isArray(obj[handle])) {
            obj[handle].push(objArray);
          } else {
            if (Object.keys(obj[handle]).length != 0) {
              // we already have elements at this location, convert to an array
              var tmp = obj[handle];
              obj[handle] = [];
              obj[handle].push(tmp);
              obj[handle].push(objArray);
            } else {
              // unlikely
              obj[handle] = objArray;
            }
          }
        }
      }

      objArray = {};
      handle = lines[i];
    }
    // we must be second or third order if third order we should add to our prior second order
    if (tabs[2] == undefined && tabs[0] == '' && tabs[1] != undefined) {
      tabs[1].trimmed;
      // test for second order
      // we are second order now do something
      let keyval = tabs[1].split(':');
      //console.log('key: '+keyval[0]+'->value: '+keyval[1]);
      if (keyval[0] != '') {
        keyval[0].trimmed;
        //  console.log('here keyval: '+keyval);
        if (keyval[1] == '' || keyval[1] == undefined) {
          // we have an array coming so we need to set a placeholder
          secondaryKey = keyval[0];
        } else {
          keyval[1].trimmed;
          if (isNaN(keyval[1])) { // let's check if our we have a numberic
            objArray[keyval[0]] = keyval[1].trim();
          } else {
            objArray[keyval[0]] = Number(keyval[1]);
          }
        }
      } // we have garbage here, lets' log it just incase
      //console.log('logging garbage'+lines[i]);
    }
    //second order
    if (tabs[0] == '' && tabs[1] == '' && tabs[2] != undefined) {
      // we are in third order here
      //console.log('we get '+handle+' here2: '+secondaryKey+' results in: '+tabs[2]);
      if (objArray[secondaryKey] == undefined) {
        objArray[secondaryKey] = [];
      }
      //obj[handle][secondaryKey]=[];
      objArray[secondaryKey].push(tabs[2]);
    }
  }
  //console.log(JSON.stringify(obj, true, 4));
  return obj;
}


exports.isFunction = isFunction;
exports.unique = unique;
exports.sortByKey = sortByKey;
exports.cores = cores;
exports.getValue = getValue;
exports.decodeEscapeSequence = decodeEscapeSequence;
exports.parseDateTime = parseDateTime;
exports.getWmic = getWmic;
exports.dmidecodeToObject = dmidecodeToObject;
