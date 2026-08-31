import { nextTick } from '../common';
import type { FanData } from '../common/types';
import { ps, psArray } from '../common/windows';

// Win32_Fan carries no actual rpm - DesiredSpeed is the *requested* speed and is
// left empty by virtually every provider. Real values only come from a running
// LibreHardwareMonitor / OpenHardwareMonitor, which publish their own WMI namespace.
const HARDWARE_MONITORS = [
  { namespace: 'root\\LibreHardwareMonitor', source: 'LibreHardwareMonitor' },
  { namespace: 'root\\OpenHardwareMonitor', source: 'OpenHardwareMonitor' }
];

const toNumber = (value: any) => {
  const result = Number.parseFloat(value);
  return Number.isNaN(result) ? null : result;
};

const win32Fans = async (): Promise<FanData[]> => {
  const fans: FanData[] = [];
  try {
    const entries = psArray(await ps.exec('Get-CimInstance Win32_Fan | Select-Object DeviceID,Name,DesiredSpeed | ConvertTo-Json -compress'));
    entries.forEach((entry: any, index: number) => {
      const rpm = toNumber(entry?.DesiredSpeed);
      fans.push({
        id: entry?.DeviceID || `fan${index}`,
        label: entry?.Name || null,
        rpm: rpm && rpm > 0 ? rpm : null,
        pwm: null,
        source: 'Win32_Fan'
      });
    });
  } catch {}
  return fans;
};

// Fan sensors report rpm, Control sensors the duty cycle of the same hardware -
// both share the identifier prefix, so they are merged per fan
const monitorFans = async (namespace: string, source: string): Promise<FanData[]> => {
  const fans: FanData[] = [];
  try {
    const entries = psArray(
      await ps.exec(`Get-CimInstance -Namespace "${namespace}" -ClassName Sensor | Where-Object { $_.SensorType -eq 'Fan' -or $_.SensorType -eq 'Control' } | Select-Object Identifier,Name,SensorType,Value | ConvertTo-Json -compress`)
    );
    const controls: { [index: string]: number } = {};
    entries.forEach((entry: any) => {
      const value = toNumber(entry?.Value);
      if (entry?.SensorType === 'Control' && entry?.Identifier && value !== null) {
        controls[String(entry.Identifier).replace('/control/', '/fan/')] = Math.round(value);
      }
    });
    entries.forEach((entry: any, index: number) => {
      if (entry?.SensorType !== 'Fan') {
        return;
      }
      const identifier = entry?.Identifier ? String(entry.Identifier) : `fan${index}`;
      const pwm = controls[identifier];
      fans.push({
        id: identifier,
        label: entry?.Name || null,
        rpm: toNumber(entry?.Value),
        pwm: pwm === undefined ? null : pwm,
        source
      });
    });
  } catch {}
  return fans;
};

export const fans = async (): Promise<FanData[]> => {
  await nextTick();
  for (const monitor of HARDWARE_MONITORS) {
    const result = await monitorFans(monitor.namespace, monitor.source);
    if (result.length) {
      return result;
    }
  }
  return win32Fans();
};
