import { lstatSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const isDirectory = (source: string) => lstatSync(source).isDirectory();
const isFile = (source: string) => lstatSync(source).isFile();
const getDirectories = (source: string) => readdirSync(source).map((name) => join(source, name)).filter(isDirectory);
const getFiles = (source: string) => readdirSync(source).map((name) => join(source, name)).filter(isFile);
const getFilesRecursively = (source: string): string[] => {
  try {
    const dirs = getDirectories(source);
    const files = dirs
      .map(dir => getFilesRecursively(dir))
      .reduce((a, b) => a.concat(b), []);
    return files.concat(getFiles(source));
  } catch {
    return [];
  }
};

export const getFilesInPath = (source: string) => {
  if (!existsSync(source)) { return []; }
  return getFilesRecursively(source);
};
