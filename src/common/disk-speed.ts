import { randomBytes } from 'node:crypto';
import { constants, mkdtemp, open, realpath, rm, stat, statfs } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { WINDOWS } from './const';
import { execFile } from './exec';
import type { DiskSpeedData } from './types';

const MB = 1024 * 1024;
export const DISK_SPEED = {
  defaultMB: 1024,
  minMB: 16,
  maxMB: 4096,
  // per phase - slow media test less than requested instead of minutes
  budgetMs: 10000,
  reserveBytes: 1024 * MB,
  block: 4 * MB,
  queue: 4
};

export type DiskSpeedIO = { bytes: number; ms: number };

export type DiskSpeedPlatform = {
  // false = the uncached read is not possible
  prepareWrite?: (fd: number) => boolean;
  readUncached: (file: string, bytes: number) => Promise<DiskSpeedIO | null>;
};

// synchronous writes, otherwise the page cache absorbs them and the final flush escapes the time budget.
// Windows: libuv maps UV_FS_O_DSYNC (not exported in fs.constants there) to FILE_FLAG_WRITE_THROUGH
const O_DSYNC = constants.O_DSYNC ?? (WINDOWS ? 0x04000000 : 0);
const WRITE_FLAGS = constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | O_DSYNC;

const elapsedMs = (start: bigint) => Number(process.hrtime.bigint() - start) / 1e6;
const mbPerSec = (bytes: number, ms: number) => (bytes > 0 && ms > 0 ? Math.round((bytes / MB / (ms / 1000)) * 10) / 10 : null);

const timedIO = async (total: number, op: (pos: number, len: number, worker: number) => Promise<unknown>): Promise<DiskSpeedIO> => {
  let next = 0;
  let done = 0;
  const start = process.hrtime.bigint();
  const worker = async (id: number) => {
    while (next < total && elapsedMs(start) < DISK_SPEED.budgetMs) {
      const pos = next;
      const len = Math.min(DISK_SPEED.block, total - pos);
      next += len;
      await op(pos, len, id);
      done += len;
    }
  };
  await Promise.all(Array.from({ length: DISK_SPEED.queue }, (_, id) => worker(id)));
  return { bytes: done, ms: elapsedMs(start) };
};

export const readFileTimed = async (file: string, bytes: number, onOpen?: (fd: number) => boolean): Promise<DiskSpeedIO | null> => {
  const handle = await open(file, 'r');
  try {
    if (onOpen && !onOpen(handle.fd)) {
      return null;
    }
    const buffers = Array.from({ length: DISK_SPEED.queue }, () => Buffer.allocUnsafe(DISK_SPEED.block));
    return await timedIO(bytes, (pos, len, worker) => handle.read(buffers[worker] as Buffer, 0, len, pos));
  } finally {
    await handle.close();
  }
};

// df only touches the file system of dir - a hung network mount elsewhere cannot block it
const fileSystemOf = async (dir: string) => {
  if (WINDOWS) {
    return /^[a-z]:/i.test(dir) ? dir.slice(0, 2).toUpperCase() : '';
  }
  try {
    const { stdout } = await execFile('df', ['-P', dir], { timeout: 5000 });
    return stdout.toString().trim().split('\n').pop()?.split(/\s+/)[0] || '';
  } catch {
    return '';
  }
};

const measure = async (path: unknown, sizeMB: unknown, platform: DiskSpeedPlatform): Promise<DiskSpeedData | null> => {
  if (path !== undefined && path !== null && path !== '' && (typeof path !== 'string' || path.includes('\0'))) {
    return null;
  }
  if (sizeMB !== undefined && sizeMB !== null && (typeof sizeMB !== 'number' || !Number.isFinite(sizeMB))) {
    return null;
  }
  const size = Math.min(DISK_SPEED.maxMB, Math.max(DISK_SPEED.minMB, Math.round((sizeMB as number | undefined) ?? DISK_SPEED.defaultMB)));
  const total = size * MB;

  let dir = '';
  try {
    dir = await realpath(resolve((path as string) || tmpdir()));
    if (!(await stat(dir)).isDirectory()) {
      return null;
    }
    // bavail counts f_frsize units, NFS / FUSE report a much larger f_bsize - stay conservative
    const space = await statfs(dir);
    if (space.bavail * Math.min(space.bsize, 4096) < total + DISK_SPEED.reserveBytes) {
      return null;
    }
  } catch {
    return null;
  }

  const start = process.hrtime.bigint();
  let testDir = '';
  try {
    testDir = await mkdtemp(join(dir, '.si-diskspeed-'));
    const file = join(testDir, 'test.bin');
    const handle = await open(file, WRITE_FLAGS, 0o600);
    let write: DiskSpeedIO;
    let uncached = true;
    try {
      if (platform.prepareWrite) {
        uncached = platform.prepareWrite(handle.fd);
      }
      // position stamped into every 4 KiB - no two blocks are equal for deduplicating storage
      const buffers = Array.from({ length: DISK_SPEED.queue }, () => randomBytes(DISK_SPEED.block));
      write = await timedIO(total, (pos, len, worker) => {
        const buffer = buffers[worker] as Buffer;
        for (let offset = 0; offset < len; offset += 4096) {
          buffer.writeDoubleLE(pos + offset, offset);
        }
        return handle.write(buffer, 0, len, pos);
      });
      const syncStart = process.hrtime.bigint();
      await handle.sync();
      write.ms += elapsedMs(syncStart);
    } finally {
      await handle.close();
    }
    const read = uncached && write.bytes ? await platform.readUncached(file, write.bytes).catch(() => null) : null;
    const ms = Math.round(elapsedMs(start));
    return {
      path: dir,
      fs: await fileSystemOf(dir),
      sizeMB: Math.round(write.bytes / MB),
      writeSpeed: mbPerSec(write.bytes, write.ms),
      readSpeed: read ? mbPerSec(read.bytes, read.ms) : null,
      ms
    };
  } catch {
    return null;
  } finally {
    if (testDir) {
      await rm(testDir, { recursive: true, force: true }).catch(() => {});
    }
  }
};

// one test at a time - parallel runs would share the free space check and measure each other
let _queue: Promise<unknown> = Promise.resolve();

export const runDiskSpeed = (path: unknown, sizeMB: unknown, platform: DiskSpeedPlatform): Promise<DiskSpeedData | null> => {
  const run = _queue.then(() => measure(path, sizeMB, platform));
  _queue = run.catch(() => null);
  return run;
};
