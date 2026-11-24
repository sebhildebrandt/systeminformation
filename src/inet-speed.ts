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
  // upload requests start small (slow uplinks still complete some) and double while they finish fast
  uploadStartBytes: 1 * MB,
  uploadRequestBytes: 10 * MB,
  uploadGrowMs: 1000,
  streams: 4
};

type TransferState = { done: () => boolean; add: (n: number) => void; leftMs: () => number };
type TransferRequest = (state: TransferState) => Promise<void>;

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

// parallel streams until the byte cap or the time budget is reached - redirects are not followed.
// newStream() returns the request function of one stream (may keep per-stream state)
const timedTransfer = async (maxBytes: number, newStream: () => TransferRequest) => {
  let bytes = 0;
  // time of the last counted byte - time spent on a request aborted at the budget end carries no data
  let lastMs = 0;
  const start = process.hrtime.bigint();
  const done = () => bytes >= maxBytes || elapsedMs(start) >= INET_SPEED.budgetMs;
  const worker = async () => {
    const request = newStream();
    let own = 0;
    const state: TransferState = {
      done,
      leftMs: () => Math.max(0, INET_SPEED.budgetMs - elapsedMs(start)),
      add: (n) => {
        own += n;
        bytes += n;
        lastMs = elapsedMs(start);
      }
    };
    while (!done()) {
      const before = own;
      await request(state).catch(() => {});
      // a request of this stream that transferred nothing (error status, refused) ends the stream -
      // checked per stream, the shared counter would keep a refused stream looping
      if (own === before) {
        break;
      }
    }
  };
  await Promise.all(Array.from({ length: INET_SPEED.streams }, worker));
  return { bytes, ms: lastMs };
};

const download = (url: URL) =>
  timedTransfer(
    INET_SPEED.maxDownloadBytes,
    () => (state) =>
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
  // bytes of started requests - keeps the parallel streams within maxUploadBytes
  let started = 0;
  return timedTransfer(INET_SPEED.maxUploadBytes, () => {
    let size = INET_SPEED.uploadStartBytes;
    return (state) =>
      new Promise<void>((resolve) => {
        const bytes = Math.min(size, INET_SPEED.maxUploadBytes - started);
        if (bytes <= 0) {
          resolve();
          return;
        }
        started += bytes;
        const requestStart = process.hrtime.bigint();
        let sent = 0;
        let settled = false;
        // a stalled server never drains the socket - end the request at the budget end anyway
        const budgetTimer = setTimeout(() => req.destroy(), state.leftMs());
        budgetTimer.unref();
        // a request only counts once the server answered it with 2xx - bytes accepted by the socket
        // still sit in kernel / TLS buffers and would inflate the rate of slow uplinks
        const settle = (confirmed: boolean) => {
          if (settled) {
            return;
          }
          settled = true;
          clearTimeout(budgetTimer);
          if (confirmed) {
            state.add(bytes);
            if (elapsedMs(requestStart) < INET_SPEED.uploadGrowMs) {
              size = Math.min(size * 2, INET_SPEED.uploadRequestBytes);
            }
          }
          resolve();
        };
        const req = clientFor(url).request(url, {
          method: 'POST',
          headers: { ...HEADERS, 'Content-Type': 'application/octet-stream', 'Content-Length': bytes },
          timeout: INET_SPEED.budgetMs
        });
        req.on('timeout', () => req.destroy());
        req.on('error', () => settle(false));
        req.on('close', () => settle(false));
        req.on('response', (res) => {
          res.resume();
          settle(!!res.statusCode && res.statusCode >= 200 && res.statusCode <= 299 && sent >= bytes);
          req.destroy();
        });
        const pump = () => {
          while (sent < bytes) {
            if (state.done()) {
              req.destroy();
              return;
            }
            const part = Math.min(chunk.length, bytes - sent);
            sent += part;
            if (!req.write(chunk.subarray(0, part))) {
              req.once('drain', pump);
              return;
            }
          }
          req.end();
        };
        pump();
      });
  });
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
