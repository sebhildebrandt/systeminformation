import { getValue, nextTick, toInt } from '../common';
import { execOptsLinux } from '../common/const';
import { initDisplay } from '../common/defaults';
import { exec, execSave } from '../common/exec';
import { cloneObj } from '../common/index';
import { isRaspberry } from '../common/raspberry';
import { DisplayData } from '../common/types';

const parseLinesLinuxEdid = (edid: string) => {
  // parsen EDID
  // --> model
  // --> resolutionx
  // --> resolutiony
  // --> builtin = false
  // --> pixeldepth (?)
  // --> sizex
  // --> sizey
  const result = cloneObj(initDisplay);
  // find first "Detailed Timing Description"
  let start = 108;
  if (edid.substring(start, start + 6) === '000000') {
    start += 36;
  }
  if (edid.substring(start, start + 6) === '000000') {
    start += 36;
  }
  if (edid.substring(start, start + 6) === '000000') {
    start += 36;
  }
  if (edid.substring(start, start + 6) === '000000') {
    start += 36;
  }
  result.resolutionX = parseInt('0x0' + edid.substring(start + 8, start + 9) + edid.substring(start + 4, start + 6));
  result.resolutionY = parseInt('0x0' + edid.substring(start + 14, start + 15) + edid.substring(start + 10, start + 12));
  result.sizeX = parseInt('0x0' + edid.substring(start + 28, start + 29) + edid.substring(start + 24, start + 26));
  result.sizeY = parseInt('0x0' + edid.substring(start + 29, start + 30) + edid.substring(start + 26, start + 28));
  // monitor name
  start = edid.indexOf('000000fc00'); // find first "Monitor Description Data"
  if (start >= 0) {
    let model_raw = edid.substring(start + 10, start + 36);
    if (model_raw.indexOf('0a') !== -1) {
      model_raw = model_raw.substring(0, model_raw.indexOf('0a'));
    }
    try {
      if (model_raw.length > 2) {
        result.model = (model_raw.match(/.{1,2}/g) || [])
          .map((v) => {
            return String.fromCharCode(parseInt(v, 16));
          })
          .join('');
      }
    } catch {}
  } else {
    result.model = '';
  }
  return result;
};

const parseLinesLinuxDisplays = (lines: string[], depth: number) => {
  const displays: DisplayData[] = [];
  let currentDisplay = cloneObj(initDisplay);
  let is_edid = false;
  let is_current = false;
  let edid_raw = '';
  let start = 0;
  const applyEdid = () => {
    const edid_decoded = parseLinesLinuxEdid(edid_raw);
    currentDisplay.vendor = edid_decoded.vendor;
    currentDisplay.model = edid_decoded.model;
    currentDisplay.resolutionX = edid_decoded.resolutionX;
    currentDisplay.resolutionY = edid_decoded.resolutionY;
    currentDisplay.sizeX = edid_decoded.sizeX;
    currentDisplay.sizeY = edid_decoded.sizeY;
    currentDisplay.pixelDepth = depth;
    is_edid = false;
  };
  for (let i = 1; i < lines.length; i++) {
    // start with second line
    if ('' !== lines[i].trim()) {
      if (' ' !== lines[i][0] && '\t' !== lines[i][0] && lines[i].toLowerCase().indexOf(' connected ') !== -1) {
        // first line of new entry
        if (is_edid && edid_raw) {
          // pending EDID belongs to the previous display
          applyEdid();
        }
        if (
          currentDisplay.model ||
          currentDisplay.main ||
          currentDisplay.builtin ||
          currentDisplay.connection ||
          currentDisplay.sizeX !== null ||
          currentDisplay.pixelDepth !== null ||
          currentDisplay.resolutionX !== null
        ) {
          // push last display to array
          displays.push(currentDisplay);
          currentDisplay = cloneObj(initDisplay);
        }
        const parts = lines[i].split(' ');
        currentDisplay.connection = parts[0];
        currentDisplay.main = lines[i].toLowerCase().indexOf(' primary ') >= 0;
        currentDisplay.builtin = parts[0].toLowerCase().indexOf('edp') >= 0;
        const geometry = lines[i].match(/\d+x\d+\+(-?\d+)\+(-?\d+)/);
        if (geometry) {
          currentDisplay.positionX = toInt(geometry[1]);
          currentDisplay.positionY = toInt(geometry[2]);
        }
      }

      // try to read EDID information
      if (is_edid) {
        if (lines[i].search(/\S|$/) > start) {
          edid_raw += lines[i].toLowerCase().trim();
        } else {
          // parsen EDID
          applyEdid();
        }
      }
      if (lines[i].toLowerCase().indexOf('edid:') >= 0) {
        is_edid = true;
        edid_raw = '';
        start = lines[i].search(/\S|$/);
      }
      if (lines[i].toLowerCase().indexOf('*current') >= 0) {
        const parts1 = lines[i].split('(');
        if (parts1 && parts1.length > 1 && parts1[0].indexOf('x') >= 0) {
          const resParts = parts1[0].trim().split('x');
          currentDisplay.currentResX = toInt(resParts[0]);
          currentDisplay.currentResY = toInt(resParts[1]);
        }
        is_current = true;
      }
      if (is_current && lines[i].toLowerCase().indexOf('clock') >= 0 && lines[i].toLowerCase().indexOf('hz') >= 0 && lines[i].toLowerCase().indexOf('v: height') >= 0) {
        const parts1 = lines[i].split('clock');
        if (parts1 && parts1.length > 1 && parts1[1].toLowerCase().indexOf('hz') >= 0) {
          currentDisplay.currentRefreshRate = toInt(parts1[1]);
        }
        is_current = false;
      }
    }
  }

  // pushen displays
  if (is_edid && edid_raw) {
    // EDID was the last block in the output
    applyEdid();
  }
  if (
    currentDisplay.model ||
    currentDisplay.main ||
    currentDisplay.builtin ||
    currentDisplay.connection ||
    currentDisplay.sizeX !== null ||
    currentDisplay.pixelDepth !== null ||
    currentDisplay.resolutionX !== null
  ) {
    // still information there
    displays.push(currentDisplay);
  }
  // mirrored outputs share position and resolution (issue #930)
  displays.forEach((display, i) => {
    display.mirror = displays.some(
      (other, j) =>
        j !== i && other.positionX === display.positionX && other.positionY === display.positionY && other.currentResX === display.currentResX && other.currentResY === display.currentResY
    );
  });
  return displays;
};

export const displays = async () => {
  await nextTick();
  const result: DisplayData[] = [];

  try {
    // Raspberry: https://elinux.org/RPI_vcgencmd_usage
    if (await isRaspberry()) {
      const { stdout } = await exec("fbset -s 2> /dev/null | grep 'mode \"' ; tvservice -s 2> /dev/null; tvservice -n 2> /dev/null;", execOptsLinux);
      const lines = stdout.split('\n');
      if (lines.length > 2 && lines[0].indexOf('mode "') >= 0 && lines[1].indexOf('0x12000a') > -1) {
        const parts = lines[0].replace('mode', '').replace(/"/g, '').trim().split('x');
        if (parts.length === 2) {
          result.push({
            vendor: '',
            vendorId: null,
            model: getValue(lines, 'device_name', '='),
            productionYear: null,
            serial: null,
            deviceName: '',
            displayId: null,
            main: true,
            mirror: false,
            builtin: false,
            connection: 'HDMI',
            sizeX: null,
            sizeY: null,
            pixelDepth: null,
            resolutionX: toInt(parts[0]),
            resolutionY: toInt(parts[1]),
            currentResX: null,
            currentResY: null,
            positionX: 0,
            positionY: 0,
            currentRefreshRate: null
          });
        }
      }
    }

    let stdout = '';
    try {
      ({ stdout } = await execSave("xdpyinfo 2>/dev/null | grep 'depth of root window' | awk '{ print $5 }'"));
      let depth = 0;
      const lines = stdout.split('\n');
      depth = parseInt(lines[0]) || 0;
      try {
        ({ stdout } = await exec('xrandr --verbose 2>/dev/null', execOptsLinux));
        const lines = stdout.toString().split('\n');
        // xrandr result replaces the raspberry fbset/tvservice fallback (v5 behavior)
        return parseLinesLinuxDisplays(lines, depth);
      } catch {}
    } catch {}
  } catch {}
  return result;
};
