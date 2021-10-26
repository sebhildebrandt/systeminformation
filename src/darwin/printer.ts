'use strict';

import { noop } from '../common';
import { execCmd } from '../common/exec';
import { PrinterData } from '../common/types';

const parsePrinters = (printerObject: any, id: number): PrinterData => {
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

export const darwinPrinter = async () => {
  const result: PrinterData[] = [];
  const stdout = await execCmd('system_profiler SPPrintersDataType -json');
  try {
    const outObj = JSON.parse(stdout.toString());
    if (outObj.SPPrintersDataType && outObj.SPPrintersDataType.length) {
      for (let i = 0; i < outObj.SPPrintersDataType.length; i++) {
        const printer = parsePrinters(outObj.SPPrintersDataType[i], i);
        result.push(printer);
      }
    }
  } catch (e) {
    noop();
  }
  return (result);
};

export const printer = () => {
  return new Promise<PrinterData[] | null>(resolve => {
    process.nextTick(() => {
      return resolve(darwinPrinter());
    });
  });
};
