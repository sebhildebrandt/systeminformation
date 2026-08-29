import { getValue, nextTick, toInt } from '../common';
import { graphicsVideoTypes } from '../common/mappings';
import type { DisplayData } from '../common/types';
import { shareInflight } from '../common/exec';
import { ps } from '../common/windows';

type WinMonitor = { instanceName: string; sizeX: string; sizeY: string; active: boolean };
type WinDisplayMode = { refreshRate: number; width: number; height: number; positionX: number; positionY: number };

// EnumDisplaySettings (current mode per \\.\DISPLAYn) - physical pixels, unaffected by DPI scaling (issues #853, #346)
const psCurrentModes =
  "Add-Type -AssemblyName System.Windows.Forms; if (-not ('SiDevMode' -as [Type])) { Add-Type -TypeDefinition 'using System;using System.Runtime.InteropServices;[StructLayout(LayoutKind.Sequential,CharSet=CharSet.Ansi)]public struct SIDEVMODE{[MarshalAs(UnmanagedType.ByValTStr,SizeConst=32)]public string dmDeviceName;public short dmSpecVersion;public short dmDriverVersion;public short dmSize;public short dmDriverExtra;public int dmFields;public int dmPositionX;public int dmPositionY;public int dmDisplayOrientation;public int dmDisplayFixedOutput;public short dmColor;public short dmDuplex;public short dmYResolution;public short dmTTOption;public short dmCollate;[MarshalAs(UnmanagedType.ByValTStr,SizeConst=32)]public string dmFormName;public short dmLogPixels;public int dmBitsPerPel;public int dmPelsWidth;public int dmPelsHeight;public int dmDisplayFlags;public int dmDisplayFrequency;public int dmICMMethod;public int dmICMIntent;public int dmMediaType;public int dmDitherType;public int dmReserved1;public int dmReserved2;public int dmPanningWidth;public int dmPanningHeight;}public class SiDevMode{[DllImport(\"user32.dll\",CharSet=CharSet.Ansi)]public static extern bool EnumDisplaySettings(string lpszDeviceName,int iModeNum,ref SIDEVMODE lpDevMode);}' }; [System.Windows.Forms.Screen]::AllScreens | ForEach-Object { $dm = New-Object SIDEVMODE; $dm.dmSize = [System.Runtime.InteropServices.Marshal]::SizeOf($dm); if ([SiDevMode]::EnumDisplaySettings($_.DeviceName, -1, [ref]$dm)) { $_.DeviceName + '|' + $dm.dmDisplayFrequency + '|' + $dm.dmBitsPerPel + '|' + $dm.dmPelsWidth + '|' + $dm.dmPelsHeight + '|' + $dm.dmPositionX + '|' + $dm.dmPositionY } }";

const parseLinesWindowsDisplaysPowershell = (
  ssections: any[],
  monitors: WinMonitor[],
  dsections: any[],
  connections: { [index: string]: string },
  isections: any[],
  currentModes: { [index: string]: WinDisplayMode }
) => {
  const displays: DisplayData[] = [];
  // Win32_DesktopMonitor entries keyed by PNPDeviceID - matched per display instead of using only the first entry (idea from PR #855)
  const desktopMonitors = (dsections || []).map((section: any) => {
    const linesDisplay = section.split('\n');
    return {
      deviceId: getValue(linesDisplay, 'PNPDeviceID', ':').replace(/&amp;/g, '&').toLowerCase(),
      vendor: getValue(linesDisplay, 'MonitorManufacturer', ':'),
      model: getValue(linesDisplay, 'Name', ':'),
      resolutionX: toInt(getValue(linesDisplay, 'ScreenWidth', ':')),
      resolutionY: toInt(getValue(linesDisplay, 'ScreenHeight', ':'))
    };
  });
  // iterate over physical monitors too - mirrored monitors have no own logical screen (issue #940)
  const count = Math.max(ssections.length, monitors.length);
  for (let i = 0; i < count; i++) {
    const hasOwnScreen = i < ssections.length;
    // mirrored monitors show the same image as the first screen
    const ssection = hasOwnScreen ? ssections[i] : ssections[0];
    if (ssection !== undefined && ssection.trim() !== '') {
      const linesScreen = `BitsPerPixel ${ssection}`.split('\n');
      // screen <-> monitor correlation stays index based - Forms.Screen exposes no shared key with root\wmi
      const monitor = monitors[i];
      const instanceName = monitor ? monitor.instanceName : '';
      const bitsPerPixel = toInt(getValue(linesScreen, 'BitsPerPixel'));
      const bounds = getValue(linesScreen, 'Bounds').replace('{', '').replace('}', '').replace(/=/g, ':').split(',');
      const primary = getValue(linesScreen, 'Primary');
      const sizeX = monitor ? monitor.sizeX : '';
      const sizeY = monitor ? monitor.sizeY : '';
      const videoOutputTechnology = instanceName && connections[instanceName] !== undefined ? connections[instanceName] : '';
      const deviceName = getValue(linesScreen, 'DeviceName');
      // Forms.Screen bounds are DPI scaled and mix scaled sizes with unscaled positions - take
      // resolution and position from EnumDisplaySettings, which reports physical pixels (issue #346)
      const mode = currentModes[deviceName.toLowerCase()];
      const boundsWidth = toInt(getValue(bounds, 'Width', ':'));
      const boundsHeight = toInt(getValue(bounds, 'Height', ':'));
      const boundsX = toInt(getValue(bounds, 'X', ':'));
      const boundsY = toInt(getValue(bounds, 'Y', ':'));
      const resX = mode ? mode.width : boundsWidth;
      const resY = mode ? mode.height : boundsHeight;
      // WmiMonitorID data matches per InstanceName - prefer it over the locale-dependent Win32_DesktopMonitor values
      const isection = instanceName ? isections.find((element: any) => element.instanceId.toLowerCase().startsWith(instanceName)) : undefined;
      const dsection = instanceName ? desktopMonitors.find((element: any) => element.deviceId && instanceName.startsWith(element.deviceId)) : undefined;
      displays.push({
        vendor: (isection && isection.vendor) || (dsection ? dsection.vendor : ''),
        vendorId: null,
        model: (isection && isection.model) || (dsection ? dsection.model : ''),
        productionYear: isection ? isection.productionYear : null,
        serial: (isection && isection.serial) || null,
        deviceName,
        displayId: instanceName || null,
        main: hasOwnScreen ? primary.toLowerCase() === 'true' : false,
        // mirrored monitors have no own logical screen - they duplicate the first one, which is mirrored too (issue #930)
        mirror: !hasOwnScreen || (monitors.length > ssections.length && i === 0),
        builtin: videoOutputTechnology === '2147483648',
        connection: videoOutputTechnology && graphicsVideoTypes[videoOutputTechnology] ? graphicsVideoTypes[videoOutputTechnology] : '',
        resolutionX: resX,
        resolutionY: resY,
        sizeX: sizeX ? parseInt(sizeX, 10) : null,
        sizeY: sizeY ? parseInt(sizeY, 10) : null,
        pixelDepth: bitsPerPixel,
        currentResX: resX,
        currentResY: resY,
        positionX: mode ? mode.positionX : boundsX,
        positionY: mode ? mode.positionY : boundsY,
        currentRefreshRate: (mode && mode.refreshRate) || null,
        scale: mode && boundsWidth ? Math.round((mode.width / boundsWidth) * 100) / 100 : null
      });
    }
  }
  if (ssections.length === 0) {
    const first = desktopMonitors[0];
    displays.push({
      vendor: first ? first.vendor : '',
      vendorId: null,
      model: first ? first.model : '',
      productionYear: null,
      serial: null,
      deviceName: '',
      displayId: null,
      main: true,
      mirror: false,
      builtin: true,
      sizeX: null,
      sizeY: null,
      connection: null,
      resolutionX: first ? first.resolutionX : 0,
      resolutionY: first ? first.resolutionY : 0,
      pixelDepth: null,
      currentResX: first ? first.resolutionX : 0,
      currentResY: first ? first.resolutionY : 0,
      positionX: 0,
      positionY: 0,
      currentRefreshRate: null,
      scale: null
    });
  }
  return displays;
};

export const displays = async () => {
  await nextTick();
  let result: DisplayData[] = [];

  try {
    const workload = [];
    // video controller values serve as single-display fallbacks (resolution, depth, refresh rate)
    workload.push(shareInflight('win32_VideoController', () => ps.exec('Get-CimInstance win32_VideoController | fl *')));
    workload.push(ps.exec('Get-CimInstance win32_desktopmonitor | fl *'));
    workload.push(ps.exec('Get-CimInstance -Namespace root\\wmi -ClassName WmiMonitorBasicDisplayParams | fl'));
    workload.push(ps.exec('Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Screen]::AllScreens'));
    workload.push(ps.exec('Get-CimInstance -Namespace root\\wmi -ClassName WmiMonitorConnectionParams | fl'));
    workload.push(
      ps.exec(
        'gwmi WmiMonitorID -Namespace root\\wmi | ForEach-Object {(($_.ManufacturerName -notmatch 0 | foreach {[char]$_}) -join "") + "|" + (($_.ProductCodeID -notmatch 0 | foreach {[char]$_}) -join "") + "|" + (($_.UserFriendlyName -notmatch 0 | foreach {[char]$_}) -join "") + "|" + (($_.SerialNumberID -notmatch 0 | foreach {[char]$_}) -join "") + "|" + $_.YearOfManufacture + "|" + $_.InstanceName}'
      )
    );
    workload.push(ps.exec(psCurrentModes));

    const data = await Promise.allSettled(workload).then((results) => results.map((result) => (result.status === 'fulfilled' ? result.value : '')));

    // fallback values from video controller
    let _resolutionX = 0;
    let _resolutionY = 0;
    let _pixelDepth = 0;
    let _refreshRate = 0;
    const csections = data[0]
      .toString()
      .replace(/\r/g, '')
      .split(/\n\s*\n/);
    csections.forEach((section: string) => {
      if (section.trim() !== '') {
        const lines = section.trim().split('\n');
        _resolutionX = toInt(getValue(lines, 'CurrentHorizontalResolution', ':')) || _resolutionX;
        _resolutionY = toInt(getValue(lines, 'CurrentVerticalResolution', ':')) || _resolutionY;
        _refreshRate = toInt(getValue(lines, 'CurrentRefreshRate', ':')) || _refreshRate;
        _pixelDepth = toInt(getValue(lines, 'CurrentBitsPerPixel', ':')) || _pixelDepth;
      }
    });

    // displays
    let dsections = data[1]
      .toString()
      .replace(/\r/g, '')
      .split(/\n\s*\n/);
    if (dsections[0].trim() === '') {
      dsections = dsections.splice(1);
    }
    if (dsections.length && dsections[dsections.length - 1].trim() === '') {
      dsections.pop();
    }

    // physical monitors (powershell) - keyed by InstanceName (issue #764)
    // inactive monitors (attached but not part of the desktop, e.g. "PC screen only") are skipped
    const monitors: WinMonitor[] = data[2]
      .toString()
      .replace(/\r/g, '')
      .split(/\n\s*\n/)
      .map((section: string) => {
        const lines = section.split('\n');
        return {
          instanceName: getValue(lines, 'InstanceName').toLowerCase(),
          sizeX: getValue(lines, 'MaxHorizontalImageSize'),
          sizeY: getValue(lines, 'MaxVerticalImageSize'),
          active: getValue(lines, 'Active').toLowerCase() !== 'false'
        };
      })
      .filter((monitor: WinMonitor) => monitor.instanceName && monitor.active);

    // forms.screens (powershell)
    let ssections = data[3].toString().replace(/\r/g, '').split('BitsPerPixel ');
    ssections = ssections.splice(1);

    // connection params (powershell) - video type per InstanceName (issue #764)
    const connections: { [index: string]: string } = {};
    data[4]
      .toString()
      .replace(/\r/g, '')
      .split(/\n\s*\n/)
      .forEach((section: string) => {
        const lines = section.split('\n');
        const instanceName = getValue(lines, 'InstanceName').toLowerCase();
        if (instanceName) {
          connections[instanceName] = getValue(lines, 'VideoOutputTechnology');
        }
      });

    // monitor ID (powershell) - model / vendor
    const res: string[] = String(data[5] ?? '')
      .replace(/\r/g, '')
      .split(/\n/);
    const isections: any = [];
    res.forEach((element) => {
      const parts = element.split('|');
      if (parts.length === 6) {
        isections.push({
          vendor: parts[0],
          code: parts[1],
          model: parts[2],
          serial: parts[3],
          productionYear: toInt(parts[4]) || null,
          instanceId: parts[5]
        });
      }
    });

    // current display mode per device name (issues #853, #346)
    const currentModes: { [index: string]: WinDisplayMode } = {};
    String(data[6] ?? '')
      .replace(/\r/g, '')
      .split(/\n/)
      .forEach((element) => {
        const parts = element.split('|');
        if (parts.length === 7 && parts[0].trim() && toInt(parts[3])) {
          const frequency = toInt(parts[1]);
          currentModes[parts[0].trim().toLowerCase()] = {
            // dmDisplayFrequency 0/1 means hardware default
            refreshRate: frequency > 1 ? frequency : 0,
            width: toInt(parts[3]),
            height: toInt(parts[4]),
            positionX: toInt(parts[5]),
            positionY: toInt(parts[6])
          };
        }
      });

    result = parseLinesWindowsDisplaysPowershell(ssections, monitors, dsections, connections, isections, currentModes);

    if (result.length === 1) {
      if (_resolutionX) {
        result[0].resolutionX = _resolutionX;
        if (!result[0].currentResX) {
          result[0].currentResX = _resolutionX;
        }
      }
      if (_resolutionY) {
        result[0].resolutionY = _resolutionY;
        if (result[0].currentResY === 0) {
          result[0].currentResY = _resolutionY;
        }
      }
      if (_pixelDepth) {
        result[0].pixelDepth = _pixelDepth;
      }
    }
    result = result.map((element) => {
      if (_refreshRate && !element.currentRefreshRate) {
        element.currentRefreshRate = _refreshRate;
      }
      return element;
    });
  } catch {}
  return result;
};
