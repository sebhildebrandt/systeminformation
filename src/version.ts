import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let _version = '';

export const version = async (): Promise<string> => {
  if (!_version) {
    try {
      // dist/version.js → package.json one level up; never resolve against process.cwd()
      _version = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8')).version || '';
    } catch {}
  }
  return _version;
};
