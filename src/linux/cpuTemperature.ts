'use strict';

import { nextTick } from '../common';
import { execCmd } from '../common/exec';
import { initCpuTemperature } from '../common/initials';
import { promises as fs, existsSync } from 'fs';

export const linuxCpuTemperature = async () => {
  const result = initCpuTemperature;
  try {
    const cmd = 'cat /sys/class/thermal/thermal_zone*/type  2>/dev/null; echo "-----"; cat /sys/class/thermal/thermal_zone*/temp 2>/dev/null;';
    const parts = (await execCmd(cmd)).toString().split('-----\n');
    if (parts.length === 2) {
      const lines = parts[0].split('\n');
      const lines2 = parts[1].split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('acpi') && lines2[i]) {
          result.socket.push(Math.round(parseInt(lines2[i], 10) / 100) / 10);
        }
        if (line.startsWith('pch') && lines2[i]) {
          result.chipset = Math.round(parseInt(lines2[i], 10) / 100) / 10;
        }
      }
    }
  } catch (e) {
  }

  const cmd = 'for mon in /sys/class/hwmon/hwmon*; do for label in "$mon"/temp*_label; do if [ -f $label ]; then value=$(echo $label | rev | cut -c 7- | rev)_input; if [ -f "$value" ]; then echo $(cat "$label")___$(cat "$value");  fi; fi; done; done;';
  try {
    let stdout = (await execCmd(cmd)).toString();
    const tdiePos = stdout.toLowerCase().indexOf('tdie');
    if (tdiePos !== -1) {
      stdout = stdout.substring(tdiePos);
    }
    let lines = stdout.split('\n');
    lines.forEach((line: string) => {
      const parts = line.split('___');
      const label = parts[0];
      const value = parts.length > 1 && parts[1] ? parts[1] : '0';
      if (value && (label === undefined || (label && label.toLowerCase().startsWith('core')))) {
        result.cores.push(Math.round(parseInt(value, 10) / 100) / 10);
      } else if (value && label && result.main === null) {
        result.main = Math.round(parseInt(value, 10) / 100) / 10;
      }
    });

    if (result.cores.length > 0) {
      if (result.main === null) {
        result.main = Math.round(result.cores.reduce((a, b) => a + b, 0) / result.cores.length);
      }
      const maxtmp = Math.max(...result.cores);
      result.max = (maxtmp > result.main) ? maxtmp : result.main;
    }
    if (result.main !== null) {
      if (result.max === null) {
        result.max = result.main;
      }
      return result;
      return;
    }
    stdout = (await execCmd('sensors')).toString();
    lines = stdout.split('\n');
    let tdieTemp: number | null = null;
    let newSectionStarts = true;
    let section = '';
    lines.forEach((line: string) => {
      // determine section
      if (line.trim() === '') {
        newSectionStarts = true;
      } else if (newSectionStarts) {
        if (line.trim().toLowerCase().startsWith('acpi')) { section = 'acpi'; }
        if (line.trim().toLowerCase().startsWith('pch')) { section = 'pch'; }
        if (line.trim().toLowerCase().startsWith('core')) { section = 'core'; }
        newSectionStarts = false;
      }
      const regex = /[+-]([^°]*)/g;
      const tempsArray = line.match(regex);
      const temps = tempsArray && tempsArray.length ? tempsArray[0] : '';
      const firstPart = line.split(':')[0].toUpperCase();
      if (section === 'acpi') {
        // socket temp
        if (firstPart.indexOf('TEMP') !== -1) {
          result.socket.push(parseFloat(temps));
        }
      } else if (section === 'pch') {
        // chipset temp
        if (firstPart.indexOf('TEMP') !== -1) {
          result.chipset = parseFloat(temps);
        }
      }
      // cpu temp
      if (firstPart.indexOf('PHYSICAL') !== -1 || firstPart.indexOf('PACKAGE') !== -1) {
        result.main = parseFloat(temps);
      }
      if (firstPart.indexOf('CORE ') !== -1) {
        result.cores.push(parseFloat(temps));
      }
      if (firstPart.indexOf('TDIE') !== -1 && tdieTemp === null) {
        tdieTemp = parseFloat(temps);
      }
    });
    if (result.cores.length > 0) {
      if (result.main === null) {
        result.main = Math.round(result.cores.reduce((a, b) => a + b, 0) / result.cores.length);
      }
      const maxtmp = Math.max(...result.cores);
      result.max = (maxtmp > result.main) ? maxtmp : result.main;
    } else {
      if (result.main === null && tdieTemp !== null) {
        result.main = tdieTemp;
        result.max = tdieTemp;
      }
    }
    if (result.main !== null || result.max !== null) {
      return result;
      return;
    }
    if (existsSync('/sys/class/thermal/thermal_zone0/temp')) {
      stdout = (await fs.readFile('/sys/class/thermal/thermal_zone0/temp')).toString();
      const lines = stdout.toString().split('\n');
      if (lines.length > 0) {
        result.main = parseFloat(lines[0]) / 1000.0;
        result.max = result.main;
      }
      return result;
    } else {
      stdout = (await execCmd('/opt/vc/bin/vcgencmd measure_temp')).toString();
      const lines = stdout.split('\n');
      if (lines.length > 0 && lines[0].indexOf('=')) {
        result.main = parseFloat(lines[0].split('=')[1]);
        result.max = result.main;
      }
      return result;
    }
  } catch (er) {
    return result;
  }
};

export const cpuTemperature = async () => {
  await nextTick();
  return linuxCpuTemperature();
};
