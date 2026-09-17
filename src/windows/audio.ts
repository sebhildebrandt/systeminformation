import { cloneObj, nextTick } from '../common';
import { initAudioResult } from '../common/defaults';
import { audioTypeLabel, audioWindowsStatus } from '../common/mappings';
import type { AudioData } from '../common/types';
import { ps, psArray } from '../common/windows';

type WindowsAudioEndpoint = { f: string; s: number; l: number; n: string };

// Win32_SoundDevice knows neither a "is default" flag nor the direction of a device. Windows keeps
// both in the MMDevices registry: one key per endpoint below Render (playback) / Capture (recording),
// DeviceState 1 = active, and per flow the active endpoint with the highest Level:0 is the default.
// The endpoint names come from the registry as well, so matching them against the WMI device name
// compares two machine provided strings - no locale dependent guessing.
const MMDEVICES = 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\MMDevices\\Audio';
const NAME_KEYS = ['{b3f8fa53-0004-438e-9003-51a46e139bfc},6', '{a45c254e-df1c-4efd-8020-67d146a850e0},2', '{b3f8fa53-0004-438e-9003-51a46e139bfc},2'];

const WIN_AUDIO_ENDPOINTS =
  `@('Render','Capture') | ForEach-Object { $f=$_; Get-ChildItem "${MMDEVICES}\\$f" -ErrorAction SilentlyContinue | ForEach-Object { ` +
  '$k=Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue; $p=Get-ItemProperty "$($_.PSPath)\\Properties" -ErrorAction SilentlyContinue; ' +
  `[PSCustomObject]@{f=$f;s=[int]$k.DeviceState;l=[long]$k.'Level:0';n=(@(${NAME_KEYS.map((key) => `$p.'${key}'`).join(',')}) -join ' ')} } } | ConvertTo-Json -compress`;

export const audioFlowNames = (endpoints: WindowsAudioEndpoint[], flow: string) =>
  endpoints.filter((endpoint) => endpoint.f === flow && endpoint.s === 1 && (endpoint.n || '').trim()).map((endpoint) => endpoint.n.trim().toLowerCase());

export const pickDefaultAudioNames = (endpoints: WindowsAudioEndpoint[]) => {
  const result: string[] = [];
  for (const flow of ['Render', 'Capture']) {
    let best: WindowsAudioEndpoint | null = null;
    for (const endpoint of endpoints) {
      if (endpoint.f === flow && endpoint.s === 1 && (!best || endpoint.l > best.l)) {
        best = endpoint;
      }
    }
    const names = (best?.n || '').trim().toLowerCase();
    if (names) {
      result.push(names);
    }
  }
  return result;
};

export const matchesAudioDevice = (name: string, names: string[]) => {
  const needle = (name || '').trim().toLowerCase();
  return needle.length > 2 && names.some((entry) => entry.includes(needle));
};

// an adapter without any active endpoint tells us nothing about its direction - stay null there
// instead of claiming it is neither input nor output
export const audioFlowFlags = (name: string, renderNames: string[], captureNames: string[]) => {
  const out = matchesAudioDevice(name, renderNames);
  const isIn = matchesAudioDevice(name, captureNames);
  return out || isIn ? { in: isIn, out } : { in: null, out: null };
};

export const audioChannelWin = (pnpDeviceId: string, name: string) => {
  const id = (pnpDeviceId || '').toUpperCase();
  const label = (name || '').toLowerCase();
  // hdmi / displayport endpoints sit on an hdaudio or pci bus - the name is the stronger signal
  if (label.includes('hdmi') || label.includes('displayport')) {
    return 'HDMI';
  }
  if (id.startsWith('USB\\')) {
    return 'USB';
  }
  if (id.startsWith('BTH')) {
    return 'Bluetooth';
  }
  if (id.startsWith('HDAUDIO\\') || id.startsWith('INTELAUDIO\\')) {
    return 'Onboard';
  }
  if (id.startsWith('PCI\\')) {
    return 'PCIe';
  }
  return null;
};

const getWindowsAudioEndpoints = async (): Promise<WindowsAudioEndpoint[]> => {
  try {
    return psArray(await ps.exec(WIN_AUDIO_ENDPOINTS));
  } catch {
    return [];
  }
};

export const audio = async (): Promise<AudioData[]> => {
  await nextTick();
  const defaults = cloneObj(initAudioResult);
  const [deviceList, endpoints] = await Promise.all([
    ps.exec('Get-CimInstance Win32_SoundDevice | Select-Object DeviceID,PNPDeviceID,StatusInfo,Name,Manufacturer | ConvertTo-Json -Depth 5'),
    getWindowsAudioEndpoints()
  ]);
  const defaultNames = pickDefaultAudioNames(endpoints);
  const renderNames = audioFlowNames(endpoints, 'Render');
  const captureNames = audioFlowNames(endpoints, 'Capture');

  return psArray(deviceList)
    .filter((data: any) => data?.Name)
    .map((data: any) => {
      const flows = audioFlowFlags(data.Name, renderNames, captureNames);
      return {
        ...defaults,
        id: data.DeviceID || '',
        name: data.Name,
        manufacturer: (data.Manufacturer || '').trim(),
        default: endpoints.length ? matchesAudioDevice(data.Name, defaultNames) : null,
        channel: audioChannelWin(data.PNPDeviceID, data.Name),
        type: audioTypeLabel(data.Name, Boolean(flows.in), Boolean(flows.out)),
        in: flows.in,
        out: flows.out,
        status: audioWindowsStatus(data.StatusInfo)
      };
    });
};
