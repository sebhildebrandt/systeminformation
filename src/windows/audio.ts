import { cloneObj, nextTick } from '../common';
import { initAudioResult } from '../common/defaults';
import { audioTypeLabel, audioWindowsStatus } from '../common/mappings';
import type { AudioData } from '../common/types';
import { ps, psArray } from '../common/windows';

type WindowsAudioEndpoint = { f: string; s: unknown; r?: unknown; l?: unknown; n: string };

// Win32_SoundDevice knows neither a "is default" flag nor the direction of a device. The MMDevices
// registry has both: one key per endpoint below Render (playback) / Capture (recording), and Role:0
// a FILETIME rewritten whenever an endpoint becomes the default.
// Nothing is cast in powershell - an unexpected value type would abort the whole pipeline silently.
const MMDEVICES = 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\MMDevices\\Audio';
const NAME_KEYS = ['{b3f8fa53-0004-438e-9003-51a46e139bfc},6', '{a45c254e-df1c-4efd-8020-67d146a850e0},2', '{b3f8fa53-0004-438e-9003-51a46e139bfc},2'];

const WIN_AUDIO_ENDPOINTS =
  `@('Render','Capture') | ForEach-Object { $f=$_; Get-ChildItem "${MMDEVICES}\\$f" -ErrorAction SilentlyContinue | ForEach-Object { ` +
  '$k=Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue; $p=Get-ItemProperty "$($_.PSPath)\\Properties" -ErrorAction SilentlyContinue; ' +
  `[PSCustomObject]@{f=$f;s=$k.DeviceState;r=$k.'Role:0';l=$k.'Level:0';n=(@(${NAME_KEYS.map((key) => `$p.'${key}'`).join(',')}) -join ' ')} } } | ConvertTo-Json -Depth 4 -compress`;

// Role:0 / Level:0 are little endian binary, but the value type is not guaranteed - normalise both
// shapes to bytes and compare from the top, which stays exact where a number would lose precision
const toRank = (value: unknown): number[] | null => {
  if (Array.isArray(value)) {
    return value.length ? value.map((byte) => Number(byte) || 0) : null;
  }
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return null;
  }
  const bytes: number[] = [];
  let rest = Math.floor(numeric);
  for (let i = 0; i < 8; i++) {
    bytes.push(rest % 256);
    rest = Math.floor(rest / 256);
  }
  return bytes;
};

const compareRank = (a: number[], b: number[]) => {
  for (let i = Math.max(a.length, b.length) - 1; i >= 0; i--) {
    const diff = (a[i] || 0) - (b[i] || 0);
    if (diff) {
      return diff;
    }
  }
  return 0;
};

// returns null rather than an arbitrary pick when nothing distinguishes the candidates
const pickMax = <T>(entries: { endpoint: WindowsAudioEndpoint; value: T }[], compare: (a: T, b: T) => number) => {
  let best = entries[0];
  let ambiguous = false;
  for (const entry of entries.slice(1)) {
    const diff = compare(entry.value, best.value);
    if (diff > 0) {
      best = entry;
      ambiguous = false;
    } else if (diff === 0) {
      ambiguous = true;
    }
  }
  return ambiguous ? null : best.endpoint;
};

const bestEndpoint = (active: WindowsAudioEndpoint[]) => {
  if (active.length === 1) {
    return active[0];
  }
  for (const key of ['r', 'l'] as const) {
    const ranked: { endpoint: WindowsAudioEndpoint; value: number[] }[] = [];
    for (const endpoint of active) {
      const value = toRank(endpoint[key]);
      if (value) {
        ranked.push({ endpoint, value });
      }
    }
    const best = ranked.length ? pickMax(ranked, compareRank) : null;
    if (best) {
      return best;
    }
  }
  return null;
};

const activeEndpoints = (endpoints: WindowsAudioEndpoint[], flow: string) =>
  endpoints.filter((endpoint) => endpoint.f === flow && Number(endpoint.s) === 1 && (endpoint.n || '').trim());

export const audioFlowNames = (endpoints: WindowsAudioEndpoint[], flow: string) => activeEndpoints(endpoints, flow).map((endpoint) => endpoint.n.trim().toLowerCase());

const endpointNames = (endpoint: WindowsAudioEndpoint | null) => (endpoint?.n || '').trim().toLowerCase() || null;

export const pickDefaultAudioNames = (endpoints: WindowsAudioEndpoint[]) => ({
  render: endpointNames(bestEndpoint(activeEndpoints(endpoints, 'Render'))),
  capture: endpointNames(bestEndpoint(activeEndpoints(endpoints, 'Capture')))
});

export const matchesAudioDevice = (name: string, names: string[]) => {
  const needle = (name || '').trim().toLowerCase();
  return needle.length > 2 && names.some((entry) => entry.includes(needle));
};

// an adapter without any active endpoint tells us nothing about its direction
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

// false only when every direction this device serves has a resolved default, null otherwise
export const audioDefaultFlag = (name: string, defaults: { render: string | null; capture: string | null }, flows: { in: boolean | null; out: boolean | null }) => {
  const known = [defaults.render, defaults.capture].filter((entry): entry is string => Boolean(entry));
  if (matchesAudioDevice(name, known)) {
    return true;
  }
  if (!known.length || (flows.out && !defaults.render) || (flows.in && !defaults.capture)) {
    return null;
  }
  return false;
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
        default: audioDefaultFlag(data.Name, defaultNames, flows),
        channel: audioChannelWin(data.PNPDeviceID, data.Name),
        type: audioTypeLabel(data.Name, Boolean(flows.in), Boolean(flows.out)),
        in: flows.in,
        out: flows.out,
        status: audioWindowsStatus(data.StatusInfo)
      };
    });
};
