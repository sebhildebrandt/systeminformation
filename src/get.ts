import { nextTick } from './common';
import * as functions from './index';

// aggregate / control functions must not be callable through get()
const blocked = ['get', 'observe', 'getStaticData', 'getDynamicData', 'getAllData'];

const pickKeys = (element: any, keyList: string[]) => {
  if (keyList.length === 1 && (keyList[0] === '*' || keyList[0] === 'all')) {
    return element;
  }
  const partial: { [key: string]: any } = {};
  keyList.forEach((k) => {
    if (Object.prototype.hasOwnProperty.call(element, k)) {
      partial[k] = element[k];
    }
  });
  return partial;
};

// value grammar: "(param) key1, key2 | filterKey:filterValue" — each part optional, "*" / "all" = full result
const pickResult = (data: any, value: string) => {
  if (value === '*' || value === 'all') {
    return data;
  }
  let keys = value;
  let filterParts: string[] = [];
  if (keys.indexOf(')') >= 0) {
    keys = (keys.split(')')[1] || '').trim();
  }
  if (keys.indexOf('|') >= 0) {
    filterParts = (keys.split('|')[1] || '').trim().split(':');
    keys = (keys.split('|')[0] || '').trim();
  }
  const keyList = keys.replace(/,/g, ' ').replace(/ +/g, ' ').trim().split(' ');
  if (!data) {
    return {};
  }
  if (Array.isArray(data)) {
    const partialArray: any[] = [];
    data.forEach((element: any) => {
      const partialRes = pickKeys(element, keyList);
      if (filterParts.length === 2) {
        const filterKey = filterParts[0].trim();
        const filterValue = filterParts[1].trim();
        if (Object.prototype.hasOwnProperty.call(partialRes, filterKey)) {
          const val = partialRes[filterKey];
          if (typeof val === 'number') {
            if (val === parseFloat(filterValue)) {
              partialArray.push(partialRes);
            }
          } else if (typeof val === 'string') {
            if (val.toLowerCase() === filterValue.toLowerCase()) {
              partialArray.push(partialRes);
            }
          }
        }
      } else {
        partialArray.push(partialRes);
      }
    });
    return partialArray;
  }
  return pickKeys(data, keyList);
};

export const get = async (valueObject: { [key: string]: string }): Promise<{ [key: string]: any }> => {
  await nextTick();
  const lib = functions as unknown as { [key: string]: (...args: any[]) => any };
  const isGettable = (key: string) =>
    Object.prototype.hasOwnProperty.call(lib, key) && typeof lib[key] === 'function' && typeof (valueObject || {})[key] === 'string' && blocked.indexOf(key) < 0;

  const keys = Object.keys(valueObject || {}).filter(isGettable);
  const data = await Promise.all(
    keys.map((func) => {
      const value = valueObject[func];
      const params = value.substring(value.lastIndexOf('(') + 1, value.lastIndexOf(')'));
      return params ? lib[func](params) : lib[func]();
    })
  );

  const result: { [key: string]: any } = {};
  keys.forEach((key, i) => {
    result[key] = pickResult(data[i], valueObject[key]);
  });
  // v6 migration hint instead of silently dropping the removed key
  if (Object.prototype.hasOwnProperty.call(valueObject || {}, 'graphics')) {
    result.graphics = 'graphics() was removed in v6 - use gpu and displays instead';
  }
  return result;
};
