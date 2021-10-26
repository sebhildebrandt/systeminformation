// ==================================================================================
// printers.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2021
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 15. printers
// ----------------------------------------------------------------------------------

import { execCmd, powerShell } from './common/exec';
import { PrinterData } from './common/types';
import { winPrinterStatus } from './common/mappings';

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
  const printerId = util.getValue(lines, 'PrinterId', ' ');
  return {
    id: printerId ? parseInt(printerId, 10) : null,
    name: util.getValue(lines, 'Info', ' '),
    model: lines.length > 0 && lines[0] ? lines[0].split(' ')[0] : '',
    uri: util.getValue(lines, 'DeviceURI', ' '),
    uuid: util.getValue(lines, 'UUID', ' '),
    status: util.getValue(lines, 'State', ' '),
    local: util.getValue(lines, 'Location', ' ').toLowerCase().startsWith('local'),
    default: null,
    shared: util.getValue(lines, 'Shared', ' ').toLowerCase().startsWith('yes'),
    engine: null,
    engineVersion: null
  };
};

const parseLinuxLpstatPrinter = (lines: string[], id: number): PrinterData => {
  return {
    id: id,
    name: util.getValue(lines, 'Description', ':', true),
    model: lines.length > 0 && lines[0] ? lines[0].split(' ')[0] : '',
    uri: null,
    uuid: null,
    status: lines.length > 0 && lines[0] ? (lines[0].indexOf(' idle') > 0 ? 'idle' : (lines[0].indexOf(' printing') > 0 ? 'printing' : 'unknown')) : null,
    local: util.getValue(lines, 'Location', ':', true).toLowerCase().startsWith('local'),
    default: null,
    shared: util.getValue(lines, 'Shared', ' ').toLowerCase().startsWith('yes'),
    engine: null,
    engineVersion: null
  };
};

const parseDarwinPrinters = (printerObject: any, id: number): PrinterData => {
  const uriParts = printerObject.uri.split('/');
  return {
    id: id,
    name: printerObject._name,
    model: uriParts.length ? uriParts[uriParts.length - 1] : '',
    uri: printerObject.uri,
    uuid: null,
    status: printerObject.status,
    local: printerObject.printserver === 'local',
    default: printerObject.default === 'yes',
    shared: printerObject.shared === 'yes',
    engine: null,
    engineVersion: null

  };
};

const parseWindowsPrinters = (lines: string[], id: number): PrinterData => {
  const status = parseInt(util.getValue(lines, 'PrinterStatus', ':'), 10);
  return {
    id: id,
    name: util.getValue(lines, 'name', ':'),
    model: util.getValue(lines, 'DriverName', ':'),
    uri: null,
    uuid: null,
    status: winPrinterStatus[status] ? winPrinterStatus[status] : null,
    local: util.getValue(lines, 'Local', ':').toUpperCase() === 'TRUE',
    default: util.getValue(lines, 'Default', ':').toUpperCase() === 'TRUE',
    shared: util.getValue(lines, 'Shared', ':').toUpperCase() === 'TRUE',
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
    if (_linux) {
      cmd = 'export LC_ALL=C; lpstat -lp 2>/dev/null; unset LC_ALL';
      // lpstat
      stdout = await exec(cmd);
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

export const darwinPrinter = async () => {
  const result: PrinterData[] = [];
  let cmd = 'system_profiler SPPrintersDataType -json';
  const stdout = await execCmd(cmd);
  try {
    const outObj = JSON.parse(stdout.toString());
    if (outObj.SPPrintersDataType && outObj.SPPrintersDataType.length) {
      for (let i = 0; i < outObj.SPPrintersDataType.length; i++) {
        const printer = parseDarwinPrinters(outObj.SPPrintersDataType[i], i);
        result.push(printer);
      }
    }
  } catch (e) {
    util.noop();
  }
  return (result);
};

export const windowsPrinter = async () => {
  const result: PrinterData[] = [];
  powerShell('Get-WmiObject Win32_Printer | fl *').then((stdout) => {
    const parts = stdout.toString().split(/\n\s*\n/);
    for (let i = 0; i < parts.length; i++) {
      const printer = parseWindowsPrinters(parts[i].split('\n'), i);
      if (printer.name || printer.model) {
        result.push(parseWindowsPrinters(parts[i].split('\n'), i));
      }
    }
    return (result);
  });
};

export const printer = new Promise<PrinterData | null>(resolve => {
  process.nextTick(() => {
    return resolve(windowsPrinter());
  });
});
