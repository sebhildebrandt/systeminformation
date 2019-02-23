'use strict';
// @ts-check
// ==================================================================================
// graphics.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2019
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 7. Graphics (controller, display)
// ----------------------------------------------------------------------------------

const exec = require('child_process').exec;
const execSync = require('child_process').execSync;
const util = require('./util');

let _platform = process.platform;

const _linux = (_platform === 'linux');
const _darwin = (_platform === 'darwin');
const _windows = (_platform === 'win32');
const _freebsd = (_platform === 'freebsd');
const _openbsd = (_platform === 'openbsd');
const _sunos = (_platform === 'sunos');

let _resolutionx = 0;
let _resolutiony = 0;
let _pixeldepth = 0;

function toInt(value) {
  let result = parseInt(value, 10);
  if (isNaN(result)) {
    result = 0;
  }
  return result;
}

function graphics(callback) {

  function parseLinesDarwin(lines) {
    let starts = [];
    let level = -1;
    let lastlevel = -1;
    let controllers = [];
    let displays = [];
    let currentController = {
      vendor: '',
      model: '',
      bus: '',
      vram: -1,
      vramDynamic: false
    };
    let currentDisplay = {
      model: '',
      main: false,
      builtin: false,
      connection: '',
      sizex: -1,
      sizey: -1,
      pixeldepth: -1,
      resolutionx: -1,
      resolutiony: -1
    };
    for (let i = 0; i < lines.length; i++) {
      if ('' !== lines[i].trim()) {
        let start = lines[i].search(/\S|$/);
        if (-1 === starts.indexOf(start)) {
          starts.push(start);
        }
        level = starts.indexOf(start);
        if (level < lastlevel) {
          if (Object.keys(currentController).length > 0) {// just changed to Displays
            controllers.push(currentController);
            currentController = {
              vendor: '',
              model: '',
              bus: '',
              vram: -1,
              vramDynamic: false
            };
          }
          if (Object.keys(currentDisplay).length > 0) {// just changed to Displays
            displays.push(currentDisplay);
            currentDisplay = {
              model: '',
              main: false,
              builtin: false,
              connection: '',
              sizex: -1,
              sizey: -1,
              pixeldepth: -1,
              resolutionx: -1,
              resolutiony: -1
            };
          }
        }
        lastlevel = level;
        let parts = lines[i].split(':');
        if (2 === level) {       // grafics controller level
          if (parts.length > 1 && parts[0].replace(/ +/g, '').toLowerCase().indexOf('chipsetmodel') !== -1) currentController.model = parts[1].trim();
          if (parts.length > 1 && parts[0].replace(/ +/g, '').toLowerCase().indexOf('bus') !== -1) currentController.bus = parts[1].trim();
          if (parts.length > 1 && parts[0].replace(/ +/g, '').toLowerCase().indexOf('vendor') !== -1) currentController.vendor = parts[1].split('(')[0].trim();
          if (parts.length > 1 && parts[0].replace(/ +/g, '').toLowerCase().indexOf('vram(total)') !== -1) {
            currentController.vram = parseInt(parts[1]);    // in MB
            currentController.vramDynamic = false;
          }
          if (parts.length > 1 && parts[0].replace(/ +/g, '').toLowerCase().indexOf('vram(dynamic,max)') !== -1) {
            currentController.vram = parseInt(parts[1]);    // in MB
            currentController.vramDynamic = true;
          }
        }
        if (3 === level) {       // display controller level
          if (parts.length > 1 && '' === parts[1]) {
            currentDisplay.model = parts[0].trim();
            currentDisplay.main = false;
            currentDisplay.builtin = false;
            currentDisplay.connection = '';
            currentDisplay.sizex = -1;
            currentDisplay.sizey = -1;
            currentDisplay.pixeldepth = -1;
          }
        }
        if (4 === level) {       // display controller details level
          if (parts.length > 1 && parts[0].replace(/ +/g, '').toLowerCase().indexOf('resolution') !== -1) {
            let resolution = parts[1].split('x');
            currentDisplay.resolutionx = (resolution.length > 1 ? parseInt(resolution[0]) : 0);
            currentDisplay.resolutiony = (resolution.length > 1 ? parseInt(resolution[1]) : 0);
          }
          if (parts.length > 1 && parts[0].replace(/ +/g, '').toLowerCase().indexOf('pixeldepth') !== -1) currentDisplay.pixeldepth = parseInt(parts[1]); // in BIT
          if (parts.length > 1 && parts[0].replace(/ +/g, '').toLowerCase().indexOf('framebufferdepth') !== -1) currentDisplay.pixeldepth = parseInt(parts[1]); // in BIT
          if (parts.length > 1 && parts[0].replace(/ +/g, '').toLowerCase().indexOf('maindisplay') !== -1 && parts[1].replace(/ +/g, '').toLowerCase() === 'yes') currentDisplay.main = true;
          if (parts.length > 1 && parts[0].replace(/ +/g, '').toLowerCase().indexOf('built-in') !== -1 && parts[1].replace(/ +/g, '').toLowerCase() === 'yes') {
            currentDisplay.builtin = true;
            currentDisplay.connection = '';
          }
          if (parts.length > 1 && parts[0].replace(/ +/g, '').toLowerCase().indexOf('connectiontype') !== -1) {
            currentDisplay.builtin = false;
            currentDisplay.connection = parts[1].trim();
          }
        }
      }
    }
    if (Object.keys(currentController).length > 0) {// just changed to Displays
      controllers.push(currentController);
    }
    if (Object.keys(currentDisplay).length > 0) {// just changed to Displays
      displays.push(currentDisplay);
    }
    return ({
      controllers: controllers,
      displays: displays
    });
  }

  function parseLinesLinuxControllers(lines) {
    let controllers = [];
    let currentController = {
      vendor: '',
      model: '',
      bus: '',
      vram: -1,
      vramDynamic: false
    };
    let isGraphicsController = false;
    // PCI bus IDs
    let pciIDs = [];
    try {
      pciIDs = execSync('export LC_ALL=C; dmidecode -t 9 2>/dev/null; unset LC_ALL | grep "Bus Address: "').toString().split('\n');
      for (let i = 0; i < pciIDs.length; i++) {
        pciIDs[i] = pciIDs[i].replace('Bus Address:', '').replace('0000:', '').trim();
      }
      pciIDs = pciIDs.filter(function (el) {
        return el != null && el;
      });
    } catch (e) {
      util.noop();
    }
    for (let i = 0; i < lines.length; i++) {
      if ('' !== lines[i].trim()) {
        if (' ' !== lines[i][0] && '\t' !== lines[i][0]) {        // first line of new entry
          let isExternal = (pciIDs.indexOf(lines[i].split(' ')[0]) >= 0);
          let vgapos = lines[i].toLowerCase().indexOf(' vga ');
          let _3dcontrollerpos = lines[i].toLowerCase().indexOf('3d controller');
          if (vgapos !== -1 || _3dcontrollerpos !== -1) {         // VGA
            if (_3dcontrollerpos !== -1 && vgapos === -1) {
              vgapos = _3dcontrollerpos;
            }
            if (currentController.vendor || currentController.model || currentController.bus || currentController.vram !== -1 || currentController.vramDynamic) { // already a controller found
              controllers.push(currentController);
              currentController = {
                vendor: '',
                model: '',
                bus: '',
                vram: -1,
                vramDynamic: false
              };
            }
            isGraphicsController = true;
            let endpos = lines[i].search(/\[[0-9a-f]{4}:[0-9a-f]{4}]|$/);
            let parts = lines[i].substr(vgapos, endpos - vgapos).split(':');
            if (parts.length > 1) {
              parts[1] = parts[1].trim();
              if (parts[1].toLowerCase().indexOf('corporation') >= 0) {
                currentController.vendor = parts[1].substr(0, parts[1].toLowerCase().indexOf('corporation') + 11).trim();
                currentController.model = parts[1].substr(parts[1].toLowerCase().indexOf('corporation') + 11, 200).trim().split('(')[0];
                currentController.bus = (pciIDs.length > 0 && isExternal) ? 'PCIe' : 'Onboard';
                currentController.vram = -1;
                currentController.vramDynamic = false;
              } else if (parts[1].toLowerCase().indexOf(' inc.') >= 0) {
                if ((parts[1].match(new RegExp(']', 'g')) || []).length > 1) {
                  currentController.vendor = parts[1].substr(0, parts[1].toLowerCase().indexOf(']') + 1).trim();
                  currentController.model = parts[1].substr(parts[1].toLowerCase().indexOf(']') + 1, 200).trim().split('(')[0].trim();
                } else {
                  currentController.vendor = parts[1].substr(0, parts[1].toLowerCase().indexOf(' inc.') + 5).trim();
                  currentController.model = parts[1].substr(parts[1].toLowerCase().indexOf(' inc.') + 5, 200).trim().split('(')[0].trim();
                }
                currentController.bus = (pciIDs.length > 0 && isExternal) ? 'PCIe' : 'Onboard';
                currentController.vram = -1;
                currentController.vramDynamic = false;
              } else if (parts[1].toLowerCase().indexOf(' ltd.') >= 0) {
                if ((parts[1].match(new RegExp(']', 'g')) || []).length > 1) {
                  currentController.vendor = parts[1].substr(0, parts[1].toLowerCase().indexOf(']') + 1).trim();
                  currentController.model = parts[1].substr(parts[1].toLowerCase().indexOf(']') + 1, 200).trim().split('(')[0].trim();
                } else {
                  currentController.vendor = parts[1].substr(0, parts[1].toLowerCase().indexOf(' ltd.') + 5).trim();
                  currentController.model = parts[1].substr(parts[1].toLowerCase().indexOf(' ltd.') + 5, 200).trim().split('(')[0].trim();
                }
              }
            }

          } else {
            isGraphicsController = false;
          }
        }
        if (isGraphicsController) { // within VGA details
          let parts = lines[i].split(':');
          if (parts.length > 1 && parts[0].replace(/ +/g, '').toLowerCase().indexOf('devicename') !== -1 && parts[1].toLowerCase().indexOf('onboard') !== -1) currentController.bus = 'Onboard';
          if (parts.length > 1 && parts[0].replace(/ +/g, '').toLowerCase().indexOf('region') !== -1 && parts[1].toLowerCase().indexOf('memory') !== -1) {
            let memparts = parts[1].split('=');
            if (memparts.length > 1) {
              currentController.vram = parseInt(memparts[1]);
            }
          }
        }
      }
    }
    if (currentController.vendor || currentController.model || currentController.bus || currentController.vram !== -1 || currentController.vramDynamic) { // already a controller found
      controllers.push(currentController);
    }
    return (controllers);
  }

  function parseLinesLinuxEdid(edid) {
    // parsen EDID
    // --> model
    // --> resolutionx
    // --> resolutiony
    // --> builtin = false
    // --> pixeldepth (?)
    // --> sizex
    // --> sizey
    let result = {
      model: '',
      main: false,
      builtin: false,
      connection: '',
      sizex: -1,
      sizey: -1,
      pixeldepth: -1,
      resolutionx: -1,
      resolutiony: -1
    };
    // find first "Detailed Timing Description"
    let start = 108;
    if (edid.substr(start, 6) === '000000') {
      start += 36;
    }
    if (edid.substr(start, 6) === '000000') {
      start += 36;
    }
    if (edid.substr(start, 6) === '000000') {
      start += 36;
    }
    if (edid.substr(start, 6) === '000000') {
      start += 36;
    }
    result.resolutionx = parseInt('0x0' + edid.substr(start + 8, 1) + edid.substr(start + 4, 2));
    result.resolutiony = parseInt('0x0' + edid.substr(start + 14, 1) + edid.substr(start + 10, 2));
    result.sizex = parseInt('0x0' + edid.substr(start + 28, 1) + edid.substr(start + 24, 2));
    result.sizey = parseInt('0x0' + edid.substr(start + 29, 1) + edid.substr(start + 26, 2));
    // monitor name
    start = edid.indexOf('000000fc00'); // find first "Monitor Description Data"
    if (start >= 0) {
      let model_raw = edid.substr(start + 10, 26);
      if (model_raw.indexOf('0a') !== -1) {
        model_raw = model_raw.substr(0, model_raw.indexOf('0a'));
      }
      result.model = model_raw.match(/.{1,2}/g).map(function (v) {
        return String.fromCharCode(parseInt(v, 16));
      }).join('');
    } else {
      result.model = '';
    }
    return result;
  }

  function parseLinesLinuxDisplays(lines, depth) {
    let displays = [];
    let currentDisplay = {
      model: '',
      main: false,
      builtin: false,
      connection: '',
      sizex: -1,
      sizey: -1,
      pixeldepth: -1,
      resolutionx: -1,
      resolutiony: -1
    };
    let is_edid = false;
    let edid_raw = '';
    let start = 0;
    for (let i = 1; i < lines.length; i++) {        // start with second line
      if ('' !== lines[i].trim()) {
        if (' ' !== lines[i][0] && '\t' !== lines[i][0] && lines[i].toLowerCase().indexOf(' connected ') !== -1) {        // first line of new entry
          if (currentDisplay.model || currentDisplay.main || currentDisplay.builtin || currentDisplay.connection || currentDisplay.sizex !== -1 || currentDisplay.pixeldepth !== -1 || currentDisplay.resolutionx !== -1) {         // push last display to array
            displays.push(currentDisplay);
            currentDisplay = {
              model: '',
              main: false,
              builtin: false,
              connection: '',
              sizex: -1,
              sizey: -1,
              pixeldepth: -1,
              resolutionx: -1,
              resolutiony: -1
            };
          }
          let parts = lines[i].split(' ');
          currentDisplay.connection = parts[0];
          currentDisplay.main = (parts[2] === 'primary');
          currentDisplay.builtin = (parts[0].toLowerCase().indexOf('edp') >= 0);
        }

        // try to read EDID information
        if (is_edid) {
          if (lines[i].search(/\S|$/) > start) {
            edid_raw += lines[i].toLowerCase().trim();
          } else {
            // parsen EDID
            let edid_decoded = parseLinesLinuxEdid(edid_raw);
            currentDisplay.model = edid_decoded.model;
            currentDisplay.resolutionx = edid_decoded.resolutionx;
            currentDisplay.resolutiony = edid_decoded.resolutiony;
            currentDisplay.sizex = edid_decoded.sizex;
            currentDisplay.sizey = edid_decoded.sizey;
            currentDisplay.pixeldepth = depth;
            is_edid = false;
          }
        }
        if (lines[i].toLowerCase().indexOf('edid:') !== -1) {
          is_edid = true;
          start = lines[i].search(/\S|$/);
        }
      }
    }

    // pushen displays
    if (currentDisplay.model || currentDisplay.main || currentDisplay.builtin || currentDisplay.connection || currentDisplay.sizex !== -1 || currentDisplay.pixeldepth !== -1 || currentDisplay.resolutionx !== -1) {  // still information there
      displays.push(currentDisplay);
    }
    return displays;
  }

  // function starts here
  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = {
        controllers: [],
        displays: []
      };
      if (_darwin) {
        let cmd = 'system_profiler SPDisplaysDataType';
        exec(cmd, function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            result = parseLinesDarwin(lines);
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_linux) {
        // Raspberry: https://elinux.org/RPI_vcgencmd_usage
        if (util.isRaspberry() && util.isRaspbian()) {
          let cmd = 'fbset -s | grep \'mode "\'; vcgencmd get_mem gpu; tvservice -s; tvservice -n;';
          exec(cmd, function (error, stdout) {
            let lines = stdout.toString().split('\n');
            if (lines.length > 3 && lines[0].indexOf('mode "') >= -1 && lines[2].indexOf('0x12000a') > -1) {
              const parts = lines[0].replace('mode', '').replace(/"/g, '').trim().split('x');
              if (parts.length === 2) {
                result.displays.push({
                  model: util.getValue(lines, 'device_name', '='),
                  main: true,
                  builtin: false,
                  connection: 'HDMI',
                  sizex: -1,
                  sizey: -1,
                  pixeldepth: -1,
                  resolutionx: parseInt(parts[0], 10),
                  resolutiony: parseInt(parts[1], 10)
                });
              }
            }
            if (lines.length > 1 && lines[1].indexOf('gpu=') >= -1) {
              result.controllers.push({
                vendor: 'Broadcom',
                model: 'VideoCore IV',
                bus: '',
                vram: lines[1].replace('gpu=', ''),
                vramDynamic: true
              });
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        } else {
          let cmd = 'lspci -vvv  2>/dev/null';
          exec(cmd, function (error, stdout) {
            if (!error) {
              let lines = stdout.toString().split('\n');
              result.controllers = parseLinesLinuxControllers(lines);
            }
            let cmd = 'xdpyinfo 2>/dev/null | grep \'depth of root window\' | awk \'{ print $5 }\'';
            exec(cmd, function (error, stdout) {
              let depth = 0;
              if (!error) {
                let lines = stdout.toString().split('\n');
                depth = parseInt(lines[0]) || 0;
              }
              let cmd = 'xrandr --verbose 2>/dev/null';
              exec(cmd, function (error, stdout) {
                if (!error) {
                  let lines = stdout.toString().split('\n');
                  result.displays = parseLinesLinuxDisplays(lines, depth);
                }
                if (callback) {
                  callback(result);
                }
                resolve(result);
              });
            });
          });
        }
      }
      if (_freebsd || _openbsd) {
        if (callback) { callback(result); }
        resolve(result);
      }
      if (_sunos) {
        if (callback) { callback(result); }
        resolve(result);
      }
      if (_windows) {
        // https://blogs.technet.microsoft.com/heyscriptingguy/2013/10/03/use-powershell-to-discover-multi-monitor-information/
        try {
          util.execWin(util.getWmic() + ' path win32_VideoController get AdapterCompatibility, AdapterDACType, name, PNPDeviceID, CurrentVerticalResolution, CurrentHorizontalResolution, CurrentNumberOfColors, AdapterRAM, CurrentBitsPerPixel, CurrentRefreshRate, MinRefreshRate, MaxRefreshRate, VideoMemoryType /value', util.execOptsWin, function (error, stdout) {
            if (!error) {
              let csections = stdout.split(/\n\s*\n/);
              result.controllers = parseLinesWindowsControllers(csections);
              util.execWin(util.getWmic() + ' path win32_desktopmonitor get Caption, MonitorManufacturer, MonitorType, ScreenWidth, ScreenHeight /value', util.execOptsWin, function (error, stdout) {
                let dsections = stdout.split(/\n\s*\n/);
                if (!error) {
                  result.displays = parseLinesWindowsDisplays(dsections);
                  if (result.controllers.length === 1 && result.displays.length === 1) {
                    if (_resolutionx && !result.displays[0].resolutionx) {
                      result.displays[0].resolutionx = _resolutionx;
                    }
                    if (_resolutiony && !result.displays[0].resolutiony) {
                      result.displays[0].resolutiony = _resolutiony;
                    }
                    if (_pixeldepth) {
                      result.displays[0].pixeldepth = _pixeldepth;
                    }
                  }
                }
                if (callback) {
                  callback(result);
                }
                resolve(result);
              });
            }
          });
        } catch (e) {
          if (callback) { callback(result); }
          resolve(result);
        }
      }
    });
  });

  function parseLinesWindowsControllers(sections) {
    let controllers = [];
    for (let i in sections) {
      if (sections.hasOwnProperty(i)) {
        if (sections[i].trim() !== '') {

          let lines = sections[i].trim().split('\r\n');
          controllers.push({
            model: util.getValue(lines, 'name', '='),
            vendor: util.getValue(lines, 'AdapterCompatibility', '='),
            bus: util.getValue(lines, 'PNPDeviceID', '=').startsWith('PCI') ? 'PCI' : '',
            vram: parseInt(util.getValue(lines, 'AdapterRAM', '='), 10) / 1024 / 1024,
            vramDynamic: (util.getValue(lines, 'VideoMemoryType', '=') === '2')
          });
          _resolutionx = toInt(util.getValue(lines, 'CurrentHorizontalResolution', '='));
          _resolutiony = toInt(util.getValue(lines, 'CurrentVerticalResolution', '='));
          _pixeldepth = toInt(util.getValue(lines, 'CurrentBitsPerPixel', '='));
        }
      }
    }
    return controllers;
  }

  function parseLinesWindowsDisplays(sections) {
    let displays = [];
    for (let i in sections) {
      if (sections.hasOwnProperty(i)) {
        if (sections[i].trim() !== '') {
          let lines = sections[i].trim().split('\r\n');
          displays.push({
            model: util.getValue(lines, 'MonitorManufacturer', '='),
            main: false,
            builtin: false,
            connection: '',
            resolutionx: toInt(util.getValue(lines, 'ScreenWidth', '=')),
            resolutiony: toInt(util.getValue(lines, 'ScreenHeight', '=')),
            sizex: -1,
            sizey: -1
          });
        }
      }
    }
    return displays;
  }
}

exports.graphics = graphics;
