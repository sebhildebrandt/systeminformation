import { spawn } from 'node:child_process';
import { fileExists } from '../common/files';
import { WINDOWS } from './const';

// ----------------------------------------------------------------------------
// PowerShell Wrapper - pool of persistent PowerShell processes
// ----------------------------------------------------------------------------

const WINDIR = process.env.WINDIR || String.raw`C:\Windows`;
const JOB_TIMEOUT_MS = 60000; // a hung WMI query must not block a worker + its queue forever
let _powerShell = '';

// Windows PowerShell 5.1 only
const pickPowerShellExecutable = async () => {
  if (!WINDOWS) return '';
  if (!_powerShell) {
    const defaultPath = String.raw`${WINDIR}\system32\WindowsPowerShell\v1.0\powershell.exe`;
    if (await fileExists(defaultPath)) {
      _powerShell = defaultPath;
    } else {
      _powerShell = 'powershell.exe';
    }
  }
  return _powerShell;
};

// Minimal “split by \n but keep remainder”
function splitLines(buffered: string) {
  const lines = [];
  let start = 0;
  while (true) {
    const idx = buffered.indexOf('\n', start);
    if (idx === -1) break;
    // keep content without trailing \r
    let line = buffered.slice(start, idx);
    if (line.endsWith('\r')) line = line.slice(0, -1);
    lines.push(line);
    start = idx + 1;
  }
  return { lines, rest: buffered.slice(start) };
}

class PowerShellWorker {
  exe: string;
  env: NodeJS.ProcessEnv;
  child: any;
  pending: Map<
    string,
    {
      resolve: (value: any) => void;
      reject: (reason?: any) => void;
      endMarker: string;
      json: boolean;
      __result?: string;
      __ok?: boolean;
      __timer?: ReturnType<typeof setTimeout>;
    }
  >;
  stdoutBuf: string;
  stderrBuf: string;
  queue: Array<{
    id: string;
    script: string;
    endMarker: string;
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
    json: boolean;
    __timer?: ReturnType<typeof setTimeout>;
  }>;
  busy: boolean;
  dead: boolean;
  constructor({ exe, env }: { exe: string; env: NodeJS.ProcessEnv }) {
    this.exe = exe;
    this.env = env;
    this.child = null;

    this.pending = new Map(); // id -> { resolve, reject, endMarker }
    this.stdoutBuf = '';
    this.stderrBuf = '';

    this.queue = [];
    this.busy = false;
    this.dead = false;
  }

  start() {
    if (this.child) return;

    // Keep it alive and read commands from stdin.
    // -Command - tells PowerShell to read commands from stdin.
    // -NoLogo/-NoProfile speed up.
    // -NonInteractive reduces prompts.
    const args = ['-NoLogo', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', '-'];

    this.child = spawn(this.exe, args, {
      stdio: 'pipe',
      windowsHide: true,
      env: { ...process.env, ...this.env }
    });

    this.child.stdout.setEncoding('utf8');
    this.child.stderr.setEncoding('utf8');

    this.child.stdout.on('data', (chunk: string) => this._onStdout(chunk));
    this.child.stderr.on('data', (chunk: string) => this._onStderr(chunk));

    this.child.stdin.on('error', () => {});

    this.child.on('error', (err: Error) => this._fail(err));
    this.child.on('close', (code: number | null, signal: NodeJS.Signals | null) => {
      this._fail(new Error(`PowerShell exited (code=${code}, signal=${signal})`));
    });

    // Initialize
    this._writeRaw('[Console]::OutputEncoding = [System.Text.Encoding]::UTF8\n' + '$OutputEncoding = [System.Text.Encoding]::UTF8\n');

    this.child.unref();
    this.child.stdin.unref();
    this.child.stdout.unref();
    this.child.stderr.unref();
  }

  _fail(err: Error) {
    this.dead = true;
    for (const job of this.pending.values()) {
      if (job.__timer) clearTimeout(job.__timer);
      job.reject(err);
    }
    this.pending.clear();
    for (const job of this.queue) job.reject(err);
    this.queue = [];
  }

  stop() {
    if (!this.child) return;
    try {
      this._writeRaw('exit\n');
      this.child.stdin.end();
    } catch {
      // ignore
    } finally {
      try {
        this.child.kill();
      } catch {}
      this.child = null;
    }
  }

  exec(script: string): Promise<any> {
    const json = script.toLowerCase().includes('convertto-json');
    if (this.dead) return Promise.reject(new Error('Worker is dead'));
    this.start();

    const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    const endMarker = `__PS_END__${id}__`;

    return new Promise((resolve, reject) => {
      this.queue.push({ id, script, endMarker, resolve, reject, json });
      this._pump();
    });
  }

  _json(result: string) {
    const trimmed = result.replace(/\r\n/g, '').trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        return JSON.parse(trimmed);
      } catch {
        return null;
      }
    }
    return null;
  }

  _pump() {
    if (this.busy || this.dead) return;
    const job = this.queue.shift();
    if (!job) return;

    this.busy = true;
    this.pending.set(job.id, job);

    const scriptB64 = Buffer.from(job.script, 'utf8').toString('base64');

    const wrapper = `
$__id = '${job.id}';
$__end = '${job.endMarker}';
$__b64 = '${scriptB64}';
$__script = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($__b64));

$ErrorActionPreference = 'Continue';
try {
  # Evaluate script in a scriptblock; capture all streams.
  # 'Continue' (v5 semantics): non-terminating errors become inline text and
  # partial output of multi-statement scripts survives; only hard failures
  # reach the catch block.
  $__out = & ([ScriptBlock]::Create($__script)) *>&1 | Out-String;
  $__ok = $true;
} catch {
  $__out = ($_ | Out-String);
  $__ok = $false;
}

$__payload = @{ id = $__id; ok = $__ok; out = $__out } | ConvertTo-Json -Compress;
[Console]::WriteLine($__payload);
[Console]::WriteLine($__end);
`;

    try {
      this._writeRaw(`${wrapper.replace(/\r?\n/g, '\n')}\n`);
    } catch (err) {
      this._fail(err instanceof Error ? err : new Error(String(err)));
      return;
    }
    this.child?.stdout?.ref();

    job.__timer = setTimeout(() => {
      if (this.pending.has(job.id)) {
        this._fail(new Error(`PowerShell command timed out after ${JOB_TIMEOUT_MS} ms`));
        try {
          this.child?.kill();
        } catch {}
      }
    }, JOB_TIMEOUT_MS);
    job.__timer.unref?.();
  }

  _writeRaw(text: string) {
    if (!this.child?.stdin?.writable) {
      throw new Error('PowerShell stdin not writable');
    }
    this.child.stdin.write(text, 'utf8');
  }

  _onStdout(chunk: string) {
    this.stdoutBuf += chunk;
    const { lines, rest } = splitLines(this.stdoutBuf);
    this.stdoutBuf = rest;

    for (const line of lines) {
      if (line.startsWith('__PS_END__') && line.endsWith('__')) {
        const id = line.slice('__PS_END__'.length, -'__'.length);
        const job = this.pending.get(id);
        if (job) {
          if (job.__timer) clearTimeout(job.__timer);
          this.pending.delete(id);
          this.busy = false;
          if (job.__result != null) {
            if (job.json) job.resolve(job.__ok === false ? null : this._json(job.__result));
            else job.resolve(job.__result);
          } else job.resolve(job.json ? null : '');
          this._pump();
          if (!this.busy) this.child?.stdout?.unref();
        }
        continue;
      }

      if (line?.startsWith('{') && line.endsWith('}')) {
        try {
          const msg = JSON.parse(line);
          const job = this.pending.get(msg.id);
          if (job) {
            job.__result = String(msg.out ?? '');
            job.__ok = msg.ok !== false;
          }
        } catch {}
      }
    }
  }

  _onStderr(chunk: string) {
    this.stderrBuf = (this.stderrBuf + chunk).slice(-8192);
  }
}

class PowerShellPool {
  size: number;
  exe: string;
  env: NodeJS.ProcessEnv;
  workers: PowerShellWorker[];
  _rr: number;
  _started: Promise<void> | null;

  constructor({ size = 2, env = { LANG: 'en_US.UTF-8' } }: { size?: number; env?: NodeJS.ProcessEnv } = {}) {
    this.size = Math.max(1, Math.trunc(size));
    this.env = env;
    this.workers = [];
    this._rr = 0;
    this.exe = '';
    this._started = null;
  }

  start(): Promise<void> {
    if (!this._started) {
      this._started = (async () => {
        this.exe = await pickPowerShellExecutable();
        for (let i = 0; i < this.size; i++) {
          const w = new PowerShellWorker({ exe: this.exe, env: this.env });
          w.start();
          this.workers.push(w);
        }
      })().catch((err) => {
        this._started = null;
        throw err;
      });
    }
    return this._started;
  }

  async exec(script: string) {
    await this.start();
    const idx = this._rr++ % this.workers.length;
    let w = this.workers[idx];
    if (w.dead) {
      w = new PowerShellWorker({ exe: this.exe, env: this.env });
      w.start();
      this.workers[idx] = w;
    }
    return w.exec(script);
  }

  async stop() {
    for (const w of this.workers) w.stop();
    this.workers = [];
    this._started = null;
  }
}

export const psArray = (value: any): any[] => (Array.isArray(value) ? value : value == null || value === '' ? [] : [value]);

export const ps = new PowerShellPool({ size: 4 });

if (WINDOWS) {
  process.on('exit', () => ps.stop());
}
