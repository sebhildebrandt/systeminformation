import { execFile as execFileFunction, exec as execFunction, spawn } from 'node:child_process';
import { promisify } from 'node:util';

export const exec = promisify(execFunction);
export const execFile = promisify(execFileFunction);

// share the result of concurrent identical calls (e.g. gpu() and displays() both
// query the same expensive base command when run in parallel via getStaticData)
const _inflight = new Map<string, Promise<any>>();
export const shareInflight = <T>(key: string, fn: () => Promise<T>): Promise<T> => {
  if (!_inflight.has(key)) {
    _inflight.set(
      key,
      fn().finally(() => {
        _inflight.delete(key);
      })
    );
  }
  return _inflight.get(key) as Promise<T>;
};

export const execSecure = (cmd: string, args: any, options?: any) => {
  let result = '';
  options = options || {};

  return new Promise<string>((resolve) => {
    process.nextTick(() => {
      try {
        const child = spawn(cmd, args, options);

        if (child && !child.pid) {
          child.on('error', () => {
            resolve(result);
          });
        }
        if (child?.pid) {
          child.stdout.on('data', (data) => {
            result += data.toString();
          });
          child.on('close', () => {
            child.kill();
            resolve(result);
          });
          child.on('error', () => {
            child.kill();
            resolve(result);
          });
        } else {
          resolve(result);
        }
      } catch {
        resolve(result);
      }
    });
  });
};

export const timeout = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const execSave = async (cmd: string, options: any = {}): Promise<{ stdout: string; stderr: string }> => {
  // includes try catch ... to avoid needing it for every exec call
  let stdout: Buffer;
  let stderr: Buffer;
  try {
    ({ stdout, stderr } = await exec(cmd, options));
    return { stdout: stdout.toString(), stderr: stderr.toString() };
  } catch (e: any) {
    return { stdout: String(e.stdout ?? ''), stderr: String(e.stderr ?? '') };
  }
};
