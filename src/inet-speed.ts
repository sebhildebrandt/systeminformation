import { randomBytes } from 'node:crypto';
import http from 'node:http';
import https from 'node:https';
import { nextTick } from './common';
import type { InetSpeedData } from './common/types';

const MB = 1000 * 1000;
export const INET_SPEED = {
  downloadUrl: 'https://speed.cloudflare.com/__down?bytes=25000000',
  uploadUrl: 'https://speed.cloudflare.com/__up',
  budgetMs: 8000,
  // caps the data volume on fast or metered connections
  maxDownloadBytes: 250 * MB,
  maxUploadBytes: 50 * MB,
  uploadRequestBytes: 10 * MB,
  streams: 4
};

type TransferState = { done: () => boolean; add: (n: number) => void };

const elapsedMs = (start: bigint) => Number(process.hrtime.bigint() - start) / 1e6;
const mbitPerSec = (bytes: number, ms: number) => (bytes > 0 && ms > 0 ? Math.round(((bytes * 8) / 1e6 / (ms / 1000)) * 10) / 10 : null);

const parseUrl = (value: unknown, fallback: string) => {
  if (value === undefined || value === null || value === '') {
    return new URL(fallback);
  }
  if (typeof value !== 'string') {
    return null;
  }
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url : null;
  } catch {
    return null;
  }
};

const clientFor = (url: URL) => (url.protocol === 'https:' ? https : http);
const HEADERS = { 'User-Agent': 'systeminformation' };

// parallel requests until the byte cap or the time budget is reached - redirects are not followed
const timedTransfer = async (maxBytes: number, request: (state: TransferState) => Promise<void>) => {
  let bytes = 0;
  const start = process.hrtime.bigint();
  const state: TransferState = {
    done: () => bytes >= maxBytes || elapsedMs(start) >= INET_SPEED.budgetMs,
    add: (n) => {
      bytes += n;
    }
  };
  const worker = async () => {
    while (!state.done()) {
      const before = bytes;
      await request(state).catch(() => {});
      // a request that transferred nothing (error status, refused) ends this stream
      if (bytes === before) {
        break;
      }
    }
  };
  await Promise.all(Array.from({ length: INET_SPEED.streams }, worker));
  return { bytes, ms: elapsedMs(start) };
};

const download = (url: URL) =>
  timedTransfer(
    INET_SPEED.maxDownloadBytes,
    (state) =>
      new Promise<void>((resolve) => {
        const req = clientFor(url).get(url, { headers: HEADERS, timeout: INET_SPEED.budgetMs }, (res) => {
          if (!res.statusCode || res.statusCode < 200 || res.statusCode > 299) {
            res.resume();
            resolve();
            return;
          }
          res.on('data', (chunk: Buffer) => {
            state.add(chunk.length);
            if (state.done()) {
              req.destroy();
            }
          });
          res.on('end', () => resolve());
          res.on('error', () => resolve());
        });
        req.on('timeout', () => req.destroy());
        req.on('error', () => resolve());
        req.on('close', () => resolve());
      })
  );

const upload = (url: URL) => {
  const chunk = randomBytes(64 * 1024);
  return timedTransfer(
    INET_SPEED.maxUploadBytes,
    (state) =>
      new Promise<void>((resolve) => {
        const req = clientFor(url).request(url, {
          method: 'POST',
          headers: { ...HEADERS, 'Content-Type': 'application/octet-stream', 'Content-Length': INET_SPEED.uploadRequestBytes },
          timeout: INET_SPEED.budgetMs
        });
        req.on('timeout', () => req.destroy());
        req.on('error', () => resolve());
        req.on('close', () => resolve());
        let queued = 0;
        let counted = 0;
        let rejected = false;
        // a server that refuses the upload must not count as throughput
        req.on('response', (res) => {
          res.resume();
          if (!res.statusCode || res.statusCode < 200 || res.statusCode > 299) {
            rejected = true;
            state.add(-counted);
            req.destroy();
          }
        });
        const pump = () => {
          while (queued < INET_SPEED.uploadRequestBytes) {
            if (state.done()) {
              req.destroy();
              return;
            }
            const part = Math.min(chunk.length, INET_SPEED.uploadRequestBytes - queued);
            queued += part;
            // counted once flushed to the socket, not when queued
            const writable = req.write(chunk.subarray(0, part), (err) => {
              if (!err && !rejected) {
                counted += part;
                state.add(part);
              }
            });
            if (!writable) {
              req.once('drain', pump);
              return;
            }
          }
          req.end();
        };
        pump();
      })
  );
};

const measure = async (downloadUrl?: string, uploadUrl?: string): Promise<InetSpeedData | null> => {
  const down = parseUrl(downloadUrl, INET_SPEED.downloadUrl);
  const up = parseUrl(uploadUrl, INET_SPEED.uploadUrl);
  if (!down || !up) {
    return null;
  }
  const start = process.hrtime.bigint();
  const dl = await download(down);
  const ul = await upload(up);
  return {
    server: down.host,
    downloadSpeed: mbitPerSec(dl.bytes, dl.ms),
    uploadSpeed: mbitPerSec(ul.bytes, ul.ms),
    downloadMB: Math.round((dl.bytes / MB) * 10) / 10,
    uploadMB: Math.round((ul.bytes / MB) * 10) / 10,
    ms: Math.round(elapsedMs(start))
  };
};

// one test at a time - parallel runs would share the bandwidth
let _queue: Promise<unknown> = Promise.resolve();

export const inetSpeed = async (downloadUrl?: string, uploadUrl?: string): Promise<InetSpeedData | null> => {
  await nextTick();
  const run = _queue.then(() => measure(downloadUrl, uploadUrl));
  _queue = run.catch(() => null);
  return run;
};
