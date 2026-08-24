import { readFile } from 'fs/promises';
import { execOptsLinux } from '../common/const';
import { cloneObj, nextTick } from '../common';
import { initCpuTemperature } from '../common/defaults';
import { exec } from '../common/exec';
import { fileExists } from '../common/files';

export const cpuTemperature = async () => {
  await nextTick();
  const result = cloneObj(initCpuTemperature);
  let cpuThermal = null;
  try {
    const cmd = 'cat /sys/class/thermal/thermal_zone*/type  2>/dev/null; echo "-----"; cat /sys/class/thermal/thermal_zone*/temp 2>/dev/null;';
    const { stdout } = await exec(cmd, execOptsLinux);
    const parts = stdout.split('-----\n');
    if (parts.length === 2) {
      const lines = parts[0].split('\n');
      const lines2 = parts[1].split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('acpi') && lines2[i]) {
          result.socket.push(Math.round(Number.parseInt(lines2[i], 10) / 100) / 10);
        }
        if (line.startsWith('pch') && lines2[i]) {
          result.chipset = Math.round(Number.parseInt(lines2[i], 10) / 100) / 10;
        }
        // CPU thermal zone (e.g. cpu-thermal on Raspberry Pi)
        if (cpuThermal === null && line.indexOf('cpu') !== -1 && lines2[i]) {
          cpuThermal = Math.round(parseInt(lines2[i], 10) / 100) / 10;
        }
      }
    }
  } catch {}

  const cmd = 'for mon in /sys/class/hwmon/hwmon*; do for label in "$mon"/temp*_label; do if [ -f $label ]; then value=${label%_*}_input; echo $(cat "$label")___$(cat "$value"); fi; done; done;';
  try {
    let { stdout } = await exec(cmd, execOptsLinux);
    const tdiePos = stdout.toLowerCase().indexOf('tdie');
    if (tdiePos !== -1) {
      stdout = stdout.substring(tdiePos);
    }
    let tctl = 0;
    let lines = stdout.split('\n');
    lines.forEach((line: string) => {
      const parts = line.split('___');
      const label = parts[0];
      const value = parts.length > 1 && parts[1] ? parts[1] : '0';
      if (value && label && label.toLowerCase() === 'tctl') {
        tctl = result.main = Math.round(Number.parseInt(value, 10) / 100) / 10;
      }
      if (value && (label === undefined || label?.toLowerCase().startsWith('core'))) {
        result.cores.push(Math.round(Number.parseInt(value, 10) / 100) / 10);
      } else if ((value && label && result.main === null && (label.toLowerCase().includes('package') || label.toLowerCase().includes('physical'))) || label.toLowerCase() === 'tccd1') {
        result.main = Math.round(Number.parseInt(value, 10) / 100) / 10;
      }
    });
    if (tctl && result.main === null) {
      result.main = tctl;
    }

    if (result.cores.length > 0) {
      if (result.main === null) {
        result.main = Math.round(result.cores.reduce((a: number, b: number) => a + b, 0) / result.cores.length);
      }
      const maxtmp = Math.max(...result.cores);
      result.max = maxtmp > result.main ? maxtmp : result.main;
    }
    if (result.main !== null) {
      if (result.max === null) {
        result.max = result.main;
      }
      return result;
    }
    if (cpuThermal !== null) {
      result.main = cpuThermal;
      result.max = cpuThermal;
      return result;
    }

    // test with sensors
    ({ stdout } = await exec('sensors', execOptsLinux));
    lines = stdout.split('\n');
    let tdieTemp: number | null = null;
    let cpuThermalTemp: number | null = null;
    let newSectionStarts = true;
    let section = '';
    lines.forEach((line: string) => {
      // determine section
      if (line.trim() === '') {
        newSectionStarts = true;
      } else if (newSectionStarts) {
        const s = line.trim().toLowerCase();
        if (s.startsWith('acpi')) section = 'acpi';
        else if (s.startsWith('pch')) section = 'pch';
        else if (s.startsWith('coretemp') || s.startsWith('core')) section = 'core';
        else if (s.startsWith('k10temp')) section = 'coreAMD';
        else if (s.startsWith('cpu_thermal') || s.startsWith('cpu-thermal') || s.startsWith('soc_thermal') || s.startsWith('cpu')) section = 'cpuThermal';
        else section = 'other'; // WICHTIG: unbekannte Blöcke NICHT als CPU behandeln

        newSectionStarts = false;
      }
      const regex = /[+-]([^°]*)/g;
      const tempsArray = line.match(regex);
      const temps = tempsArray?.length ? tempsArray[0] : '';
      const firstPart = line.split(':')[0].toUpperCase();
      if (section === 'acpi') {
        // socket temp
        if (firstPart.includes('TEMP') && temps) {
          result.socket.push(Number.parseFloat(temps));
        }
      } else if (section === 'pch') {
        // chipset temp
        if (firstPart.includes('TEMP') && !result.chipset && temps) {
          result.chipset = Number.parseFloat(temps);
        }
      }
      // cpu temp
      if ((firstPart.includes('PHYSICAL') || firstPart.includes('PACKAGE') || (section === 'coreAMD' && firstPart.includes('TDIE')) || firstPart.includes('TEMP')) && temps) {
        result.main = Number.parseFloat(temps);
      }
      if (firstPart.includes('CORE ') && temps) {
        result.cores.push(Number.parseFloat(temps));
      }
      if (firstPart.includes('TDIE') && tdieTemp === null && temps) {
        tdieTemp = Number.parseFloat(temps);
      }

      // generic cpuThermal
      if (section === 'cpuThermal' && firstPart.indexOf('TEMP') !== -1 && cpuThermalTemp === null && temps) {
        cpuThermalTemp = parseFloat(temps);
      }
    });
    if (result.cores.length > 0) {
      if (result.main === null) {
        result.main = Math.round(result.cores.reduce((a: number, b: number) => a + b, 0) / result.cores.length);
      }
      const maxtmp = Math.max(...result.cores);
      result.max = maxtmp > result.main ? maxtmp : result.main;
    } else {
      // Fallback order: cpu_thermal before tdie
      if (result.main === null && cpuThermalTemp !== null) {
        result.main = cpuThermalTemp;
        result.max = cpuThermalTemp;
      } else if (result.main === null && tdieTemp !== null) {
        result.main = tdieTemp;
        result.max = tdieTemp;
      }
    }
    if (result.main !== null && result.max === null) {
      result.max = result.main;
    }
    if (result.main !== null || result.max !== null) {
      return result;
    }
    if (await fileExists('/sys/class/thermal/thermal_zone0/temp')) {
      stdout = (await readFile('/sys/class/thermal/thermal_zone0/temp')).toString();
      const lines = stdout.toString().split('\n');
      if (lines.length > 0) {
        result.main = Number.parseFloat(lines[0]) / 1000;
        result.max = result.main;
      }
      return result;
    } else {
      ({ stdout } = await exec('/opt/vc/bin/vcgencmd measure_temp', execOptsLinux));
      const lines = stdout.split('\n');
      if (lines.length > 0 && lines[0].indexOf('=') !== -1) {
        result.main = Number.parseFloat(lines[0].split('=')[1]);
        result.max = result.main;
      }
      return result;
    }
  } catch {
    return result;
  }
};
