import { get } from './get';

// polls get(valueObject) every `interval` ms and calls back only when the data changed;
// returns the interval handle — stop observing with clearInterval(handle)
export const observe = (valueObject: { [key: string]: string }, interval: number, callback: (data: { [key: string]: any }) => void) => {
  let _data: { [key: string]: any } | null = null;
  return setInterval(() => {
    get(valueObject).then((data) => {
      if (JSON.stringify(_data) !== JSON.stringify(data)) {
        _data = { ...data };
        callback(data);
      }
    });
  }, interval);
};
