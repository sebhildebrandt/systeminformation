'use strict';

import { getValue, nextTick } from '../common';
import { LINUX } from '../common/const';
import { execCmd } from '../common/exec';
import { PrinterData } from '../common/types';

const parseLinuxCupsHeader = (lines: string) => {
  const result: any = {};
  if (lines && lines.length) {
    if (lines[0].indexOf(' CUPS v') > 0) {
      const parts = lines[0].split(' CUPS v');
      result.cupsVersion = parts[1];
    }
  }
  return result;
};

const parseLinuxCupsPrinter = (lines: string[]): PrinterData => {
  const printerId = getValue(lines, 'PrinterId', ' ');
  return {
    id: printerId ? parseInt(printerId, 10) : null,
    name: getValue(lines, 'Info', ' '),
    model: lines.length > 0 && lines[0] ? lines[0].split(' ')[0] : '',
    uri: getValue(lines, 'DeviceURI', ' '),
    uuid: getValue(lines, 'UUID', ' '),
    status: getValue(lines, 'State', ' '),
    local: getValue(lines, 'Location', ' ').toLowerCase().startsWith('local'),
    default: null,
    shared: getValue(lines, 'Shared', ' ').toLowerCase().startsWith('yes'),
    engine: null,
    engineVersion: null
  };
};

const parseLinuxLpstatPrinter = (lines: string[], id: number): PrinterData => {
  return {
    id: id,
    name: getValue(lines, 'Description', ':', true),
    model: lines.length > 0 && lines[0] ? lines[0].split(' ')[0] : '',
    uri: null,
    uuid: null,
    status: lines.length > 0 && lines[0] ? (lines[0].indexOf(' idle') > 0 ? 'idle' : (lines[0].indexOf(' printing') > 0 ? 'printing' : 'unknown')) : null,
    local: getValue(lines, 'Location', ':', true).toLowerCase().startsWith('local'),
    default: null,
    shared: getValue(lines, 'Shared', ' ').toLowerCase().startsWith('yes'),
    engine: null,
    engineVersion: null
  };
};

export const nixPrinter = async () => {
  const result: PrinterData[] = [];
  let cmd = 'cat /etc/cups/printers.conf 2>/dev/null';
  let stdout = await execCmd(cmd);
  // printers.conf
  const parts = stdout.toString().split('<Printer ');
  const printerHeader = parseLinuxCupsHeader(parts[0]);
  for (let i = 1; i < parts.length; i++) {
    const printers = parseLinuxCupsPrinter(parts[i].split('\n'));
    if (printers.name) {
      printers.engine = 'CUPS';
      printers.engineVersion = printerHeader.cupsVersion;
      result.push(printers);
    }
  }
  if (result.length === 0) {
    if (LINUX) {
      cmd = 'export LC_ALL=C; lpstat -lp 2>/dev/null; unset LC_ALL';
      // lpstat
      stdout = await execCmd(cmd);
      const parts = ('\n' + stdout.toString()).split('\nprinter ');
      for (let i = 1; i < parts.length; i++) {
        const printers = parseLinuxLpstatPrinter(parts[i].split('\n'), i);
        result.push(printers);
      }
      return (result);
    } else {
      return (result);
    }
  } else {
    return (result);
  }
};

export const printer = async () => {
  await nextTick();
  return nixPrinter();
};
