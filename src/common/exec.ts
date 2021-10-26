'use strict';

import * as os from 'os';
import { exec, spawn, ExecException } from 'child_process';

export const execCmd = (cmd: string) => {
  return new Promise<string>((resolve) => {
    exec(cmd, (error: ExecException | null, stdout: string, stderr: string) => {
      if (error) {
        resolve('');
      }
      resolve(stdout ? stdout : stderr);
    });
  });
};

export const powerShell = (cmd: string) => {

  let result = '';
  const toUTF8 = '$OutputEncoding = [System.Console]::OutputEncoding = [System.Console]::InputEncoding = [System.Text.Encoding]::UTF8 ; ';

  return new Promise<string>((resolve) => {
    process.nextTick(() => {
      try {
        const child = spawn('powershell.exe', ['-NoLogo', '-InputFormat', 'Text', '-NoExit', '-ExecutionPolicy', 'Unrestricted', '-Command', '-'], {
          stdio: 'pipe',
          windowsHide: true,
          env: Object.assign({}, process.env, { LANG: 'en_US.UTF-8' })
        });

        if (child && !child.pid) {
          child.on('error', function () {
            resolve(result);
          });
        }
        if (child && child.pid) {
          child.stdout.on('data', function (data) {
            result = result + data.toString('utf8');
          });
          child.stderr.on('data', function () {
            child.kill();
            resolve(result);
          });
          child.on('close', function () {
            child.kill();
            resolve(result);
          });
          child.on('error', function () {
            child.kill();
            resolve(result);
          });
          try {
            child.stdin.write(toUTF8 + cmd + os.EOL);
            child.stdin.write('exit' + os.EOL);
            child.stdin.end();
          } catch (e) {
            child.kill();
            resolve(result);
          }
        } else {
          resolve(result);
        }
      } catch (e) {
        resolve(result);
      }
    });
  });
};

export const execSafe = (cmd: string, args: any, options?: any) => {
  let result = '';
  options = options || {};

  return new Promise<string>((resolve) => {
    process.nextTick(() => {
      try {
        const child = spawn(cmd, args, options);

        if (child && !child.pid) {
          child.on('error', function () {
            resolve(result);
          });
        }
        if (child && child.pid) {
          child.stdout.on('data', function (data) {
            result += data.toString();
          });
          child.on('close', function () {
            child.kill();
            resolve(result);
          });
          child.on('error', function () {
            child.kill();
            resolve(result);
          });
        } else {
          resolve(result);
        }
      } catch (e) {
        resolve(result);
      }
    });
  });
};
