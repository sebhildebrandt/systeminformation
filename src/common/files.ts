import { constants } from 'fs';
import { access, lstat, readdir, readFile } from 'fs/promises';
import { join } from 'path';

export const getFilesInPath = async (source: string) => {
  const fetchedFiles = [];
  try {
    const files = await readdir(source);

    for (const file of files) {
      try {
        const filepath = join(source, file);
        const stats = await lstat(filepath);
        if (stats.isFile()) {
          fetchedFiles.push(filepath);
        }
        if (stats.isDirectory()) {
          const childFiles = await readdir(filepath);
          files.push(...childFiles.map((f) => join(file, f)));
        }
      } catch {}
    }
  } catch {}
  return fetchedFiles;
};

export const fileExists = async (file: string) => {
  try {
    await access(file, constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

export const readSysfs = async (file: string) => {
  try {
    return (await readFile(file, 'utf8')).trim();
  } catch {
    return '';
  }
};
