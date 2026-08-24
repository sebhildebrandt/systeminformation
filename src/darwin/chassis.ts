import { cloneObj, getValue, nextTick } from '../common';
import { initChassis } from '../common/defaults';
import { exec } from '../common/exec';
import { getAppleChassisType, getAppleModel } from '../common/mappings';
import { ChassisData } from './../common/types';

const parseChassisObject = (data: string): ChassisData => {
  const defaults = cloneObj(initChassis);
  const lines = data.toString().replace(/[<>"]/g, '').split('\n');

  const model = getAppleModel(getValue(lines, 'model', '=', true));
  // const modelParts = util.splitByNumber(model);
  // const version = util.getValue(lines, 'version', '=', true);

  return {
    ...defaults,
    manufacturer: getValue(lines, 'manufacturer', '=', true),
    model: model.key,
    type: getAppleChassisType(model.model),
    version: model.version,
    serial: getValue(lines, 'ioplatformserialnumber', '=', true),
    assetTag: getValue(lines, 'board-id', '=', true) || getValue(lines, 'target-type', '=', true),
    sku: getValue(lines, 'target-sub-type', '=', true)
  };
};
export const chassis = async () => {
  await nextTick();
  let stdout = '';
  try {
    ({ stdout } = await exec('ioreg -c IOPlatformExpertDevice -d 2'));
  } catch {}
  return parseChassisObject(stdout);
};
