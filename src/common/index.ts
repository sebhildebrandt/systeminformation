export const toInt = (value: any) => {
  const result = parseInt(value, 10);
  if (isNaN(result)) {
    return 0;
  }
  return result;
};

export const hex2bin = (hex: string) => {
  return `00000000${(parseInt(hex, 16)).toString(2)}`.slice(-8);
};

export const getValue = (lines: string[], property: string, separator = ':', trimmed = false, lineMatch = false): string => {
  property = property.toLowerCase();
  let result = '';
  lines.some((line: string) => {
    let lineLower = line.toLowerCase().replace(/\t/g, '');
    if (trimmed) {
      lineLower = lineLower.trim();
    }
    if (lineLower.startsWith(property) && (lineMatch ? lineLower.match(property + separator) || lineLower.match(`${property} ${separator}`) : true)) {
      const parts = trimmed ? line.trim().split(separator) : line.split(separator);
      if (parts.length >= 2) {
        parts.shift();
        result = parts.join(separator).trim();
        return true;
      }
    }
    return false;
  });
  return result;
};

export const countLines = (lines: string[], startingWith = '') => lines.filter((line) => line.startsWith(startingWith)).length;

export const nextTick = () =>
  new Promise<void>((resolve) => {
    process.nextTick(() => {
      resolve();
    });
  });

export const cloneObj = (obj: any) => {
  if (typeof obj === 'object' && obj !== null) {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (e) {
      return {};
    }
  } else {
    return {};
  }
};

export const unique = (obj: any[]) => {
  const uniques: any[] = [];
  const stringify: any = {};
  for (let i = 0; i < obj.length; i++) {
    const keys = Object.keys(obj[i]);
    keys.sort((a: string, b: string) => {
      return a < b ? -1 : a > b ? 1 : 0;
    });
    let str = '';
    for (let j = 0; j < keys.length; j++) {
      str += JSON.stringify(keys[j]);
      str += JSON.stringify(obj[i][keys[j]]);
    }
    if (!Object.prototype.hasOwnProperty.call(stringify, str)) {
      uniques.push(obj[i]);
      stringify[str] = true;
    }
  }
  return uniques;
};

export const sortByKey = (array: any[], keys: string[]) => {
  return array.sort((a, b) => {
    let x = '';
    let y = '';
    keys.forEach((key) => {
      x = x + a[key];
      y = y + b[key];
    });
    return x < y ? -1 : x > y ? 1 : 0;
  });
};

export const findObjectByKey = (array: any[], key: string, value: any) => {
  for (let i = 0; i < array.length; i++) {
    if (array[i][key] === value) {
      return i;
    }
  }
  return -1;
};

export const semverCompare = (v1: string, v2: string) => {
  let res = 0;
  const parts1 = v1.split('.').map((p) => Number.parseInt(p, 10) || 0);
  const parts2 = v2.split('.').map((p) => Number.parseInt(p, 10) || 0);
  if (parts1[0] < parts2[0]) {
    res = 1;
  } else if (parts1[0] > parts2[0]) {
    res = -1;
  } else if (parts1[0] === parts2[0] && parts1.length >= 2 && parts2.length >= 2) {
    if (parts1[1] < parts2[1]) {
      res = 1;
    } else if (parts1[1] > parts2[1]) {
      res = -1;
    } else if (parts1[1] === parts2[1]) {
      if (parts1.length >= 3 && parts2.length >= 3) {
        if (parts1[2] < parts2[2]) {
          res = 1;
        } else if (parts1[2] > parts2[2]) {
          res = -1;
        }
      } else if (parts2.length >= 3) {
        res = 1;
      }
    }
  }
  return res;
};

export const cleanString = (str: string) => {
  return str.replace(/To Be Filled By O.E.M./g, '');
};

export const grep = (str: string, pattern: string) => {
  const result = str
    .split('\n')
    .filter((line) => line.includes(pattern))
    .join('\n');
  return result;
};
