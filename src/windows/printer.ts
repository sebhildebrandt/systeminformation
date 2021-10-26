import { getValue, nextTick } from '../common';
import { powerShell } from '../common/exec';
import { PrinterData } from '../common/types';
import { winPrinterStatus } from '../common/mappings';

const parsePrinters = (lines: string[], id: number): PrinterData => {
  const status = parseInt(
    getValue(lines, 'PrinterStatus', ':'), 10);
  return {
    id: id,
    name: getValue(lines, 'name', ':'),
    model: getValue(lines, 'DriverName', ':'),
    uri: null,
    uuid: null,
    status: winPrinterStatus[status] ? winPrinterStatus[status] : null,
    local: getValue(lines, 'Local', ':').toUpperCase() === 'TRUE',
    default: getValue(lines, 'Default', ':').toUpperCase() === 'TRUE',
    shared: getValue(lines, 'Shared', ':').toUpperCase() === 'TRUE',
    engine: null,
    engineVersion: null
  };
};

export const windowsPrinter = async () => {
  const result: PrinterData[] = [];
  const stdout = await powerShell('Get-WmiObject Win32_Printer | fl *');
  const parts = stdout.toString().split(/\n\s*\n/);
  for (let i = 0; i < parts.length; i++) {
    const printer = parsePrinters(parts[i].split('\n'), i);
    if (printer.name || printer.model) {
      result.push(parsePrinters(parts[i].split('\n'), i));
    }
  }
  return (result);
};

export const printer = async () => {
  await nextTick();
  return windowsPrinter();
};
