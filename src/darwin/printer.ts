import { plistParser } from './../common/darwin';
import { nextTick } from '../common';
import { exec } from '../common/exec';
import { PrinterData } from '../common/types';

const parsePrinterObject = (printerObject: any, id: number): PrinterData => {
  const uriParts = printerObject.uri ? printerObject.uri.split('/') : [];
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

const parsePrinter = (data: string) => {
  const result: PrinterData[] = [];
  const outObj = plistParser(data);
  if (outObj.length) {
    for (let i = 0; i < outObj.length; i++) {
      const printer = parsePrinterObject(outObj[i], i);
      if (printer.status !== 'no_info_found') {
        result.push(printer);
      }
    }
  }
  return result;
};

export const printer = async () => {
  await nextTick();
  let stdout = '';
  try {
    ({ stdout } = await exec('system_profiler SPPrintersDataType -xml'));
  } catch {}
  return parsePrinter(stdout);
};
