'use strict';

export const toInt = (value: any) => {
  const result = parseInt(value, 10);
  if (isNaN(result)) { return 0; }
  return result;
};

export const hex2bin = (hex: string) => {
  return ('00000000' + (parseInt(hex, 16)).toString(2)).substr(-8);
};


export const getValue = (lines: string[], property: string, separator = ':', trimmed = false, lineMatch = false): string => {
  property = property.toLowerCase();
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].toLowerCase().replace(/\t/g, '');
    if (trimmed) {
      line = line.trim();
    }
    if (line.startsWith(property) && (lineMatch ? (line.match(property + separator)) : true)) {
      const parts = trimmed ? lines[i].trim().split(separator) : lines[i].split(separator);
      if (parts.length >= 2) {
        parts.shift();
        return parts.join(separator).trim();
      } else {
        return '';
      }
    }
  }
  return '';
};

export const promiseAll = (promises: Promise<any>[]) => {
  const resolvingPromises = promises.map(function (promise) {
    return new Promise(function (resolve) {
      const payload = new Array(2);
      promise.then(function (result) {
        payload[0] = result;
      })
        .catch(function (error) {
          payload[1] = error;
        })
        .then(function () {
          // The wrapped Promise returns an array: 0 = result, 1 = error ... we resolve all
          resolve(payload);
        });
    });
  });
  const errors: any[] = [];
  const results: any[] = [];

  // Execute all wrapped Promises
  return Promise.all(resolvingPromises)
    .then(function (items) {
      items.forEach(function (payload: any) {
        if (payload[1]) {
          errors.push(payload[1]);
          results.push(null);
        } else {
          errors.push(null);
          results.push(payload[0]);
        }
      });

      return {
        errors: errors,
        results: results
      };
    });
};

export const countLines = (lines: string[], startingWith = '') => {
  startingWith = startingWith || '';
  const uniqueLines = [];
  lines.forEach(line => {
    if (line.startsWith(startingWith)) {
      uniqueLines.push(line);
    }
  });
  return uniqueLines.length;
};

export const nextTick = () => new Promise<void>(resolve => {
  process.nextTick(() => {
    resolve();
  });
});
