import { toInt } from '../common';
import type { CpuTopologyData } from '../common/types';
import { ps } from '../common/windows';

// Win32_Processor has no per logical processor mapping - GetLogicalProcessorInformationEx has.
// Returns "core,socket;core,socket;..." per logical processor, numbered across processor groups.
// Core / socket ids are the enumeration order of the kernel (-1 = unknown).
const TOPOLOGY_SOURCE = `
using System;
using System.Runtime.InteropServices;
public static class SiCpuTopology {
  [DllImport("kernel32.dll", SetLastError = true)]
  static extern bool GetLogicalProcessorInformationEx(int relationship, IntPtr buffer, ref uint length);
  [DllImport("kernel32.dll")]
  static extern ushort GetActiveProcessorGroupCount();
  [DllImport("kernel32.dll")]
  static extern uint GetActiveProcessorCount(ushort group);

  public static string Get() {
    int groups = GetActiveProcessorGroupCount();
    int[] offset = new int[groups + 1];
    for (int g = 0; g < groups; g++) offset[g + 1] = offset[g] + (int)GetActiveProcessorCount((ushort)g);
    int total = offset[groups];
    int[] core = new int[total];
    int[] socket = new int[total];
    for (int i = 0; i < total; i++) { core[i] = -1; socket[i] = -1; }

    uint len = 0;
    GetLogicalProcessorInformationEx(0xffff, IntPtr.Zero, ref len);
    if (len == 0) return "";
    IntPtr buf = Marshal.AllocHGlobal((int)len);
    try {
      if (!GetLogicalProcessorInformationEx(0xffff, buf, ref len)) return "";
      // PROCESSOR_RELATIONSHIP: GroupCount at 30, GROUP_AFFINITY[] at 32 (KAFFINITY mask + WORD group)
      int stride = IntPtr.Size == 8 ? 16 : 8;
      int coreIdx = 0;
      int pkgIdx = 0;
      long pos = 0;
      while (pos < len) {
        IntPtr rec = new IntPtr(buf.ToInt64() + pos);
        int rel = Marshal.ReadInt32(rec, 0);
        int size = Marshal.ReadInt32(rec, 4);
        if (size <= 0) break;
        // 0 = RelationProcessorCore, 3 = RelationProcessorPackage
        if (rel == 0 || rel == 3) {
          int groupCount = Marshal.ReadInt16(rec, 30);
          for (int k = 0; k < groupCount; k++) {
            int entry = 32 + k * stride;
            ulong mask = IntPtr.Size == 8 ? (ulong)Marshal.ReadInt64(rec, entry) : (uint)Marshal.ReadInt32(rec, entry);
            int group = Marshal.ReadInt16(rec, entry + IntPtr.Size);
            if (group < 0 || group >= groups) continue;
            for (int bit = 0; bit < IntPtr.Size * 8; bit++) {
              if (((mask >> bit) & 1UL) == 0) continue;
              int idx = offset[group] + bit;
              if (idx >= total) continue;
              if (rel == 0) core[idx] = coreIdx; else socket[idx] = pkgIdx;
            }
          }
          if (rel == 0) coreIdx++; else pkgIdx++;
        }
        pos += size;
      }
    } finally {
      Marshal.FreeHGlobal(buf);
    }
    string[] parts = new string[total];
    for (int i = 0; i < total; i++) parts[i] = core[i] + "," + socket[i];
    return String.Join(";", parts);
  }
}
`;

const toId = (value: string | undefined) => {
  const id = toInt(value || '');
  return Number.isNaN(id) || id < 0 ? null : id;
};

export const parseCpuTopology = (stdout: string): CpuTopologyData[] =>
  stdout
    .trim()
    .split(';')
    .filter((part) => part.includes(','))
    .map((part) => {
      const [coreId, socketId] = part.split(',');
      return { coreId: toId(coreId), socketId: toId(socketId) };
    });

export const cpuTopology = async (): Promise<CpuTopologyData[]> => {
  try {
    // Add-Type compiles once per PowerShell process - the pool keeps its processes alive
    const stdout = await ps.exec(`if (-not ('SiCpuTopology' -as [type])) { Add-Type -TypeDefinition @'${TOPOLOGY_SOURCE}'@ }; [SiCpuTopology]::Get()`);
    return parseCpuTopology(String(stdout || ''));
  } catch {
    return [];
  }
};
