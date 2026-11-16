import { DISK_SPEED, runDiskSpeed } from '../common/disk-speed';
import type { DiskSpeedData } from '../common/types';
import { ps } from '../common/windows';

// FILE_FLAG_NO_BUFFERING bypasses the system cache but needs sector aligned buffers (VirtualAlloc) and
// sizes. One thread per in flight request, positioned via OVERLAPPED - same queue depth as the write.
const READ_SOURCE = `
using System;
using System.Diagnostics;
using System.Globalization;
using System.Runtime.InteropServices;
using System.Threading;
using Microsoft.Win32.SafeHandles;
public static class SiDiskRead {
  [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
  static extern SafeFileHandle CreateFileW(string name, uint access, uint share, IntPtr security, uint disposition, uint flags, IntPtr template);
  [DllImport("kernel32.dll", SetLastError = true)]
  static extern bool ReadFile(SafeFileHandle handle, IntPtr buffer, uint toRead, out uint read, ref NativeOverlapped overlapped);
  [DllImport("kernel32.dll", SetLastError = true)]
  static extern IntPtr VirtualAlloc(IntPtr address, UIntPtr size, uint type, uint protect);
  [DllImport("kernel32.dll", SetLastError = true)]
  static extern bool VirtualFree(IntPtr address, UIntPtr size, uint type);

  public static string Read(string path, long maxBytes, long budgetMs, int block, int queue) {
    long next = 0;
    long total = 0;
    bool failed = false;
    Stopwatch watch = Stopwatch.StartNew();
    Thread[] threads = new Thread[queue];
    for (int i = 0; i < queue; i++) {
      threads[i] = new Thread(() => {
        // GENERIC_READ, FILE_SHARE_READ, OPEN_EXISTING, FILE_FLAG_NO_BUFFERING
        using (SafeFileHandle handle = CreateFileW(path, 0x80000000, 1, IntPtr.Zero, 3, 0x20000000, IntPtr.Zero)) {
          if (handle.IsInvalid) { failed = true; return; }
          // MEM_COMMIT | MEM_RESERVE, PAGE_READWRITE
          IntPtr buffer = VirtualAlloc(IntPtr.Zero, (UIntPtr)(uint)block, 0x3000, 0x04);
          if (buffer == IntPtr.Zero) { failed = true; return; }
          try {
            while (watch.ElapsedMilliseconds < budgetMs) {
              long pos = Interlocked.Add(ref next, block) - block;
              if (pos >= maxBytes) break;
              NativeOverlapped position = new NativeOverlapped();
              position.OffsetLow = (int)(pos & 0xFFFFFFFF);
              position.OffsetHigh = (int)(pos >> 32);
              uint read;
              if (!ReadFile(handle, buffer, (uint)block, out read, ref position) || read == 0) break;
              Interlocked.Add(ref total, read);
            }
          } finally {
            VirtualFree(buffer, UIntPtr.Zero, 0x8000);
          }
        }
      });
      threads[i].Start();
    }
    foreach (Thread thread in threads) thread.Join();
    watch.Stop();
    if (failed) return "";
    return total + "," + watch.Elapsed.TotalMilliseconds.ToString(CultureInfo.InvariantCulture);
  }
}
`;

export const parseReadResult = (stdout: string) => {
  const [bytes, ms] = stdout.trim().split(',').map(Number);
  return bytes !== undefined && ms !== undefined && Number.isFinite(bytes) && Number.isFinite(ms) && bytes > 0 && ms > 0 ? { bytes, ms } : null;
};

const readUncached = async (file: string, bytes: number) => {
  // user influenced path - base64 encoded, never part of the script text
  const path64 = Buffer.from(file, 'utf8').toString('base64');
  const script = `if (-not ('SiDiskRead' -as [type])) { Add-Type -TypeDefinition @'${READ_SOURCE}'@ }; [SiDiskRead]::Read([Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${path64}')), ${Math.trunc(bytes)}, ${DISK_SPEED.budgetMs}, ${DISK_SPEED.block}, ${DISK_SPEED.queue})`;
  return parseReadResult(String((await ps.exec(script)) || ''));
};

export const diskSpeed = (path?: string, sizeMB?: number): Promise<DiskSpeedData | null> => runDiskSpeed(path, sizeMB, { readUncached });
