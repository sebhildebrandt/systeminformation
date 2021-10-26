'use strict';

import * as fs from 'fs';
import * as path from 'path';

export const getFilesInPath = (source: string) => {
  const lstatSync = fs.lstatSync;
  const readdirSync = fs.readdirSync;
  const join = path.join;

  const isDirectory = (source: string) => {
    return lstatSync(source).isDirectory();
  };
  const isFile = (source: string) => { return lstatSync(source).isFile(); };

  const getDirectories = (source: string) => {
    return readdirSync(source).map((name) => { return join(source, name); }).filter(isDirectory);
  };
  const getFiles = (source: string) => {
    return readdirSync(source).map((name) => { return join(source, name); }).filter(isFile);
  };

  const getFilesRecursively = (source: string): string[] => {
    try {
      const dirs = getDirectories(source);
      const files = dirs
        .map(function (dir) { return getFilesRecursively(dir); })
        .reduce(function (a, b) { return a.concat(b); }, []);
      return files.concat(getFiles(source));
    } catch (e) {
      return [];
    }
  };

  if (fs.existsSync(source)) {
    return getFilesRecursively(source);
  } else {
    return [];
  }
};
