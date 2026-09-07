import { constants } from 'fs';
import { access, lstat, open, readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { isSafePathSegment } from './security';

export const getFilesInPath = async (source: string) => {
  const fetchedFiles = [];
  try {
    const files = (await readdir(source)).filter(isSafePathSegment);

    for (const file of files) {
      try {
        const filepath = join(source, file);
        const stats = await lstat(filepath);
        if (stats.isFile()) {
          fetchedFiles.push(filepath);
        }
        if (stats.isDirectory()) {
          const childFiles = await readdir(filepath);
          files.push(...childFiles.filter(isSafePathSegment).map((f) => join(file, f)));
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

export const readFileLines = async (file: string) => {
  try {
    return (await readFile(file, 'utf8')).split('\n');
  } catch {
    return [];
  }
};

// replaces the `echo -n "key: "; cat <dir>/<key>` shell blobs - returns the same
// `key: value` lines that getValue() expects
export const readSysfsMany = async (dir: string, names: string[]) => {
  return Promise.all(names.map(async (name) => `${name}: ${await readSysfs(join(dir, name))}`));
};

// reading every pid at once holds one fd per process - busy hosts hit EMFILE well below
// the number of processes `ps` reports
const PROC_READ_BATCH = 64;

// aggregate cpu line of /proc/stat plus one /proc/<pid>/stat line per (living) pid
export const readProcStats = async (pids: any[]) => {
  const paths: string[] = [];
  for (const pid of pids) {
    // bind once - the guard and the path must not evaluate a foreign toString() twice
    const id = String(pid);
    if (/^\d+$/.test(id)) {
      paths.push(`/proc/${id}/stat`);
    }
  }
  const statLines = await readFileLines('/proc/stat');
  const procs: string[] = [];
  for (let i = 0; i < paths.length; i += PROC_READ_BATCH) {
    procs.push(...(await Promise.all(paths.slice(i, i + PROC_READ_BATCH).map((path) => readSysfs(path)))));
  }
  return {
    all: statLines.find((line) => line.startsWith('cpu ')) || '',
    procs: procs.filter((line) => line)
  };
};

// user-writable config files have no natural size bound - exec() used to cap these reads at
// node's 1 MB default, so keep that limit and never allocate more than it
export const readFileMax = async (file: string, maxBytes = 1024 * 1024) => {
  let handle;
  try {
    handle = await open(file, 'r');
    const { size } = await handle.stat();
    const buffer = Buffer.alloc(Math.min(size || maxBytes, maxBytes));
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
    return buffer.toString('utf8', 0, bytesRead).trim();
  } catch {
    return '';
  } finally {
    await handle?.close();
  }
};

export const DMI_PATH = '/sys/devices/virtual/dmi/id';
