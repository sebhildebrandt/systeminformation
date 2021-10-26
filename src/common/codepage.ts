import { DARWIN, execOptsWin, FREEBSD, LINUX, NETBSD, WINDOWS } from './const';
import { execSync } from 'child_process';
let _codepage = '';

export const getCodepage = (): string => {
  if (WINDOWS) {
    if (!_codepage) {
      try {
        const stdout = execSync('chcp', execOptsWin);
        const lines = stdout.toString().split('\r\n');
        const parts = lines[0].split(':');
        _codepage = parts.length > 1 ? parts[1].replace('.', '') : '';
      } catch (err) {
        _codepage = '437';
      }
    }
    return _codepage;
  }
  if (LINUX || DARWIN || FREEBSD || NETBSD) {
    if (!_codepage) {
      try {
        const stdout = execSync('echo $LANG');
        const lines = stdout.toString().split('\r\n');
        const parts = lines[0].split('.');
        _codepage = parts.length > 1 ? parts[1].trim() : '';
        if (!_codepage) {
          _codepage = 'UTF-8';
        }
      } catch (err) {
        _codepage = 'UTF-8';
      }
    }
    return _codepage;
  } else {
    return _codepage;
  }
};
