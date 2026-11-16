import { randomBytes } from 'node:crypto';
import { mkdtemp, open, realpath, rm, stat, statfs } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import type { DiskSpeedData } from './types';

const MB = 1024 * 1024;
export const DISK_SPEED = {
  defaultMB: 1024,
  minMB: 16,
  maxMB: 4096,
  // per phase - slow media (USB sticks, SD cards) test less than the requested size instead of minutes
  budgetMs: 10000,
  reserveBytes: 1024 * MB,
  // large blocks with a few requests in flight - a single 1 MB request at a time leaves fast SSDs idle
  block: 4 * MB,
  queue: 4
};

export type DiskSpeedIO = { bytes: number; ms: number };

export type DiskSpeedPlatform = {
  // called with the descriptor of the test file before it is written; false = no uncached read possible
  prepareWrite?: (fd: number) => boolean;
  // reads the test file past the page cache, null if the platform cannot bypass it
  readUncached: (file: string, bytes: number) => Promise<DiskSpeedIO | null>;
};

const elapsedMs = (start: bigint) => Number(process.hrtime.bigint() - start) / 1e6;
const mbPerSec = (bytes: number, ms: number) => (bytes > 0 && ms > 0 ? Math.round((bytes / MB / (ms / 1000)) * 10) / 10 : null);

// parallel positional IO in fixed blocks until `total` bytes are done or the time budget is used up
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

// file system holding the tested directory - matched by device id, path prefixes fail on macOS
// firmlinks (/private/var lives on the data volume, not on "/"); longest mount wins on ties
const fileSystemOf = async (dir: string) => {
  try {
    const { fsSize } = await import('../fs-size.js');
    const dev = (await stat(dir)).dev;
    const items = (await fsSize()) || [];
    const devs = await Promise.all(
      items.map((item) =>
        item.mount
          ? stat(item.mount).then(
              (s) => s.dev,
              () => null
            )
          : null
      )
    );
    const matches = items.filter((_, i) => devs[i] === dev).sort((a, b) => b.mount.length - a.mount.length);
    return matches[0]?.fs || '';
  } catch {
    return '';
  }
};

export const runDiskSpeed = async (path: unknown, sizeMB: unknown, platform: DiskSpeedPlatform): Promise<DiskSpeedData | null> => {
  // trust boundary: both parameters come from the caller
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
    const space = await statfs(dir);
    if (space.bavail * space.bsize < total + DISK_SPEED.reserveBytes) {
      return null;
    }
  } catch {
    return null;
  }

  const start = process.hrtime.bigint();
  let testDir = '';
  try {
    // own directory with a random name - never touches existing files
    testDir = await mkdtemp(join(dir, '.si-diskspeed-'));
    const file = join(testDir, 'test.bin');
    const handle = await open(file, 'wx');
    let write: DiskSpeedIO;
    let uncached = true;
    try {
      if (platform.prepareWrite) {
        uncached = platform.prepareWrite(handle.fd);
      }
      // random data, block position stamped in - no compression / deduplication by the drive
      const buffers = Array.from({ length: DISK_SPEED.queue }, () => randomBytes(DISK_SPEED.block));
      write = await timedIO(total, (pos, len, worker) => {
        const buffer = buffers[worker] as Buffer;
        buffer.writeDoubleLE(pos, 0);
        return handle.write(buffer, 0, len, pos);
      });
      const syncStart = process.hrtime.bigint();
      await handle.sync();
      write.ms += elapsedMs(syncStart);
    } finally {
      await handle.close();
    }
    const read = uncached && write.bytes ? await platform.readUncached(file, write.bytes).catch(() => null) : null;
    return {
      path: dir,
      fs: await fileSystemOf(dir),
      sizeMB: Math.round(write.bytes / MB),
      writeSpeed: mbPerSec(write.bytes, write.ms),
      readSpeed: read ? mbPerSec(read.bytes, read.ms) : null,
      ms: Math.round(elapsedMs(start))
    };
  } catch {
    return null;
  } finally {
    if (testDir) {
      await rm(testDir, { recursive: true, force: true }).catch(() => {});
    }
  }
};
