import { execFile as execFileFunction, exec as execFunction, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { MAX_BUFFER_SIZE } from './const';

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
  // the timeout is handled here instead of being passed to spawn: node clears its own timer in the
  // "exit" handler, but a command that does not exist emits "error" and never "exit" - the timer
  // then keeps the event loop alive for its full duration, so a missing tool delayed process exit
  // by 5 seconds even though the call had already resolved
  const { timeout: timeoutMs, ...spawnOptions } = options || {};

  return new Promise<string>((resolve) => {
    process.nextTick(() => {
      let timer: ReturnType<typeof setTimeout> | null = null;
      const done = () => {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        resolve(result);
      };
      try {
        // stderr is never read here - leaving it as a pipe lets a chatty command block at the pipe
        // buffer and run into the timeout, losing the stdout it had already produced. Same stdio
        // shape execOptsLinux uses for the exec() path. A caller supplied stdio still wins
        const child = spawn(cmd, args, { stdio: ['pipe', 'pipe', 'ignore'], ...spawnOptions });

        if (child?.pid) {
          if (timeoutMs) {
            // SIGKILL because SIGTERM can be ignored, and done() because a process in
            // uninterruptible sleep never closes either - the call sites rely on the timeout
            // actually settling the call, not just on the kill attempt
            timer = setTimeout(() => {
              child.kill('SIGKILL');
              // a grandchild can keep the inherited stdout pipe open after the child is gone,
              // which would hold the event loop even though the call has already settled
              child.stdout?.destroy();
              child.stderr?.destroy();
              child.unref();
              done();
            }, timeoutMs);
          }
          child.stdout.on('data', (data) => {
            // the ceiling exec()/execSave() get from maxBuffer, which spawn() has no equivalent
            // for. Keep draining past it so the child can still finish instead of blocking
            if (result.length < MAX_BUFFER_SIZE) {
              result = (result + data.toString()).substring(0, MAX_BUFFER_SIZE);
            }
          });
          child.on('close', () => {
            child.kill();
            done();
          });
          child.on('error', () => {
            child.kill();
            done();
          });
        } else {
          // an unhandled "error" event would throw - the listener has to stay
          child?.on('error', () => done());
          done();
        }
      } catch {
        done();
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
