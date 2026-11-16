import { DISK_SPEED, runDiskSpeed } from '../common/disk-speed';
import type { DiskSpeedData } from '../common/types';
import { ps } from '../common/windows';

// FILE_FLAG_NO_BUFFERING reads past the system cache. It needs sector aligned buffers and sizes:
// VirtualAlloc returns page aligned memory, the block size is a multiple of every sector size.
// Returns "bytes,ms" - empty if the file cannot be read unbuffered.
const READ_SOURCE = `
using System;
using System.Diagnostics;
using System.Globalization;
using System.Runtime.InteropServices;
using Microsoft.Win32.SafeHandles;
public static class SiDiskRead {
  [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
  static extern SafeFileHandle CreateFileW(string name, uint access, uint share, IntPtr security, uint disposition, uint flags, IntPtr template);
  [DllImport("kernel32.dll", SetLastError = true)]
  static extern bool ReadFile(SafeFileHandle handle, IntPtr buffer, uint toRead, out uint read, IntPtr overlapped);
  [DllImport("kernel32.dll", SetLastError = true)]
  static extern IntPtr VirtualAlloc(IntPtr address, UIntPtr size, uint type, uint protect);
  [DllImport("kernel32.dll", SetLastError = true)]
  static extern bool VirtualFree(IntPtr address, UIntPtr size, uint type);

  public static string Read(string path, long maxBytes, long budgetMs, uint block) {
    // GENERIC_READ, FILE_SHARE_READ, OPEN_EXISTING, FILE_FLAG_NO_BUFFERING | FILE_FLAG_SEQUENTIAL_SCAN
    using (SafeFileHandle handle = CreateFileW(path, 0x80000000, 1, IntPtr.Zero, 3, 0x20000000 | 0x08000000, IntPtr.Zero)) {
      if (handle.IsInvalid) return "";
      // MEM_COMMIT | MEM_RESERVE, PAGE_READWRITE
      IntPtr buffer = VirtualAlloc(IntPtr.Zero, (UIntPtr)block, 0x3000, 0x04);
      if (buffer == IntPtr.Zero) return "";
      try {
        long total = 0;
        Stopwatch watch = Stopwatch.StartNew();
        while (total < maxBytes && watch.ElapsedMilliseconds < budgetMs) {
          uint read;
          if (!ReadFile(handle, buffer, block, out read, IntPtr.Zero) || read == 0) break;
          total += read;
        }
        watch.Stop();
        return total + "," + watch.Elapsed.TotalMilliseconds.ToString(CultureInfo.InvariantCulture);
      } finally {
        VirtualFree(buffer, UIntPtr.Zero, 0x8000);
      }
    }
  }
}
`;

export const parseReadResult = (stdout: string) => {
  const [bytes, ms] = stdout.trim().split(',').map(Number);
  return bytes !== undefined && ms !== undefined && Number.isFinite(bytes) && Number.isFinite(ms) && bytes > 0 && ms > 0 ? { bytes, ms } : null;
};

const readUncached = async (file: string, bytes: number) => {
  // the path is user influenced - passed base64 encoded, never as script text
  const path64 = Buffer.from(file, 'utf8').toString('base64');
  const script = `if (-not ('SiDiskRead' -as [type])) { Add-Type -TypeDefinition @'${READ_SOURCE}'@ }; [SiDiskRead]::Read([Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${path64}')), ${Math.trunc(bytes)}, ${DISK_SPEED.budgetMs}, ${DISK_SPEED.block})`;
  return parseReadResult(String((await ps.exec(script)) || ''));
};

export const diskSpeed = (path?: string, sizeMB?: number): Promise<DiskSpeedData | null> => runDiskSpeed(path, sizeMB, { readUncached });
