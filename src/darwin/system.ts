import { cloneObj, getValue, nextTick } from '../common';
import { initSystem } from '../common/defaults';
import { exec } from '../common/exec';
import { getAppleChassisType, getAppleModel } from '../common/mappings';

export const system = async () => {
  await nextTick();
  const defaults = cloneObj(initSystem);
  let stdout = '';
  try {
    ({ stdout } = await exec('ioreg -c IOPlatformExpertDevice -d 2'));
  } catch {}
  const lines = stdout.toString().replace(/[<>"]/g, '').split('\n');
  const model = getAppleModel(getValue(lines, 'model', '=', true));
  return {
    ...defaults,
    manufacturer: getValue(lines, 'manufacturer', '=', true),
    model: model.key,
    type: getAppleChassisType(model.model),
    version: model.version,
    serial: getValue(lines, 'ioplatformserialnumber', '=', true),
    uuid: getValue(lines, 'ioplatformuuid', '=', true).toLowerCase(),
    sku: getValue(lines, 'target-sub-type', '=', true)
  };
};
