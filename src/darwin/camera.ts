import { Camera } from './../common/types';
import { plistParser } from '../common/darwin';
import { nextTick } from '../common';
import { exec } from '../common/exec';
import { manufacturedApple, usbDarwinType } from '../common/mappings';

const parseCamera = (data: any[]): Camera[] => {
  const result: Camera[] = [];
  data.forEach((element) => {
    result.push({
      name: element._name || '',
      vendor: element.manufacturer || manufacturedApple(element._name) || '',
      model: element.model || '',
      serial: element.serial || '',
      connection: 'internal'
    });
  });
  return result;
};

const parseUsb = (data: any): Camera[] => {
  const result: Camera[] = [];
  data.forEach((part: any) => {
    if (part._items) {
      part._items.forEach((usb: any) => {
        if (usbDarwinType(usb._name).toLowerCase().includes('camera')) {
          result.push({
            name: usb._name || '',
            vendor: usb.manufacturer || '',
            model: '' + usb.product_id,
            serial: usb.serial || '',
            connection: 'usb'
          });
        }
      });
    }
  });
  return result;
};

export const camera = async (): Promise<Camera[]> => {
  await nextTick();

  try {
    const { stdout } = await exec('system_profiler SPCameraDataType SPUSBDataType -xml');
    const data = plistParser(stdout, false);
    const cameraData = data.length >= 2 && data[0]._items ? data[0]._items : [];
    const usbData = data.length >= 2 && data[1]._items ? data[1]._items : [];
    let result = parseCamera(cameraData);
    result = result.concat(parseUsb(usbData));
    return result;
  } catch {
    return [];
  }
};
