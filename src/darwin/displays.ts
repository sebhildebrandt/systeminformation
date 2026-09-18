import { nextTick, toInt } from '../common';
import { plistParser, plistReader } from '../common/darwin';
import { exec, execSave, execSecure, shareInflight } from '../common/exec';
import { graphicsIdToVendor, graphicsModelToVendor } from '../common/mappings';
import { DisplayData } from '../common/types';

const parseDisplaysDarwin = (graphicsArr: any[]): DisplayData[] => {
  const displays: DisplayData[] = [];
  try {
    graphicsArr.forEach((item: any) => {
      if (item.spdisplays_ndrvs && item.spdisplays_ndrvs.length) {
        item.spdisplays_ndrvs.forEach((displayItem: { [index: string]: string }) => {
          const connectionType = displayItem['spdisplays_connection_type'] || '';
          const currentResolutionParts = (displayItem['_spdisplays_resolution'] || '').split('@');
          const currentResolution = currentResolutionParts[0].split('x');
          const pixelParts = (displayItem['_spdisplays_pixels'] || '').split('x');
          const pixelDepthString = displayItem['spdisplays_depth'] || '';
          const serial = displayItem['_spdisplays_display-serial-number'] || displayItem['_spdisplays_display-serial-number2'] || null;
          displays.push({
            vendor: graphicsIdToVendor(displayItem['_spdisplays_display-vendor-id'] || '') || graphicsModelToVendor(displayItem['_name'] || ''),
            vendorId: displayItem['_spdisplays_display-vendor-id'] || '',
            model: displayItem['_name'] || '',
            productionYear: toInt(displayItem['_spdisplays_display-year']) || null,
            serial: serial !== '0' ? serial : null,
            displayId: displayItem['_spdisplays_displayID'] || null,
            deviceName: null,
            main: displayItem['spdisplays_main'] ? displayItem['spdisplays_main'] === 'spdisplays_yes' : false,
            mirror: (displayItem['spdisplays_mirror'] || 'spdisplays_off') !== 'spdisplays_off',
            builtin: (displayItem['spdisplays_display_type'] || '').indexOf('built-in') > -1,
            connection: connectionType.indexOf('_internal') > -1 ? 'Internal' : connectionType.indexOf('_displayport') > -1 ? 'Display Port' : connectionType.indexOf('_hdmi') > -1 ? 'HDMI' : null,
            sizeX: null,
            sizeY: null,
            pixelDepth: pixelDepthString === 'CGSThirtyBitColor' ? 30 : pixelDepthString === 'CGSThirtytwoBitColor' ? 32 : pixelDepthString === 'CGSTwentyfourBitColor' ? 24 : null,
            resolutionX: pixelParts.length > 1 ? parseInt(pixelParts[0], 10) : null,
            resolutionY: pixelParts.length > 1 ? parseInt(pixelParts[1], 10) : null,
            currentResX: currentResolution.length > 1 ? parseInt(currentResolution[0], 10) : null,
            currentResY: currentResolution.length > 1 ? parseInt(currentResolution[1], 10) : null,
            positionX: 0,
            positionY: 0,
            workAreaResolutionX: null,
            workAreaResolutionY: null,
            workAreaPositionX: null,
            workAreaPositionY: null,
            powerState: '',
            currentRefreshRate: currentResolutionParts.length > 1 ? parseInt(currentResolutionParts[1], 10) : null,
            scale: null
          });
        });
      }
    });
  } catch {}
  return displays;
};

const getDisplayPositionDarwin = async (displays: DisplayData[]): Promise<DisplayData[]> => {
  try {
    const { stdout } = await exec(
      'defaults read /Library/Preferences/com.apple.windowserver.plist 2>/dev/null;defaults read /Library/Preferences/com.apple.windowserver.displays.plist 2>/dev/null; echo ""',
      { maxBuffer: 1024 * 20000 }
    );
    const output = (stdout || '').toString();
    const obj: any = plistReader(output);
    if (obj.DisplayAnyUserSets && obj.DisplayAnyUserSets.Configs && obj.DisplayAnyUserSets.Configs[0] && obj.DisplayAnyUserSets.Configs[0].DisplayConfig) {
      const current = obj.DisplayAnyUserSets.Configs[0].DisplayConfig;
      let i = 0;
      current.forEach((o: any) => {
        if (o.CurrentInfo && o.CurrentInfo.OriginX !== undefined && displays[i]) {
          displays[i].positionX = o.CurrentInfo.OriginX;
        }
        if (o.CurrentInfo && o.CurrentInfo.OriginY !== undefined && displays[i]) {
          displays[i].positionY = o.CurrentInfo.OriginY;
        }
        i++;
      });
    }
    if (obj.DisplayAnyUserSets && obj.DisplayAnyUserSets.length > 0 && obj.DisplayAnyUserSets[0].length > 0 && obj.DisplayAnyUserSets[0][0].DisplayID) {
      const current = obj.DisplayAnyUserSets[0];
      let i = 0;
      current.forEach((o: any) => {
        if ('OriginX' in o && displays[i]) {
          displays[i].positionX = o.OriginX;
        }
        if ('OriginY' in o && displays[i]) {
          displays[i].positionY = o.OriginY;
        }
        if (o['Mode'] && o.Mode.BitsPerPixel !== undefined && displays[i]) {
          displays[i].pixelDepth = o.Mode.BitsPerPixel;
        }
        i++;
      });
    }
  } catch {}
  return displays;
};

// NSScreen.visibleFrame (screen minus menu bar and Dock) per CGDirectDisplayID - points, y-up, origin at the main screen's bottom left
const jxaVisibleFrames =
  'ObjC.import("AppKit"); var s = $.NSScreen.screens, out = []; for (var i = 0; i < s.count; i++) { var sc = s.objectAtIndex(i), f = sc.frame, v = sc.visibleFrame; out.push([sc.deviceDescription.objectForKey($("NSScreenNumber")).intValue, f.origin.x, f.origin.y, f.size.width, f.size.height, v.origin.x, v.origin.y, v.size.width, v.size.height].join("|")); } out.join("\\n")';

const getWorkAreaDarwin = async (displays: DisplayData[]): Promise<DisplayData[]> => {
  try {
    const { stdout } = await execSave(`osascript -l JavaScript -e '${jxaVisibleFrames}'`);
    const screens = stdout
      .toString()
      .split('\n')
      .map((line) => line.split('|').map((part) => parseFloat(part)))
      .filter((parts) => parts.length === 9 && !Number.isNaN(parts[0]));
    // the main screen sits at the origin - its height converts y-up NSScreen coordinates to the y-down global space used by positionY
    const main = screens.find((parts) => parts[1] === 0 && parts[2] === 0);
    if (!main) {
      return displays;
    }
    screens.forEach((parts) => {
      const display = displays.find((element) => toInt(element.displayId || '') === parts[0]);
      if (display) {
        display.workAreaResolutionX = Math.round(parts[7]);
        display.workAreaResolutionY = Math.round(parts[8]);
        display.workAreaPositionX = Math.round(parts[5]);
        display.workAreaPositionY = Math.round(main[4] - (parts[6] + parts[8]));
      }
    });
  } catch {}
  return displays;
};

// ioreg prints the power managed node as
// "IOPowerManagement" = {"CapabilityFlags"=32832,"MaxPowerState"=4,"CurrentPowerState"=4}
// intel macs run the display through IODisplayWrangler (5 states), apple silicon through
// IOMobileFramebufferShim (on/off only) - the first node found decides
export const parseIoregPowerState = (stdout: string) => {
  const match = stdout.match(/"MaxPowerState"=(\d+)[^}]*"CurrentPowerState"=(\d+)/);
  if (!match) {
    return '';
  }
  const max = toInt(match[1]);
  const current = toInt(match[2]);
  if (!max) {
    return '';
  }
  if (current >= max) {
    return 'on';
  }
  if (!current) {
    return 'off';
  }
  return current === max - 1 ? 'standby' : 'suspend';
};

// the display power state is a system wide value on macOS, so every display gets the same one
const getPowerStateDarwin = async () => {
  for (const args of [['-n', 'IODisplayWrangler', '-r', '-d', '1'], ['-c', 'IOMobileFramebufferShim', '-r', '-d', '1']]) {
    const powerState = parseIoregPowerState(await execSecure('ioreg', args));
    if (powerState) {
      return powerState;
    }
  }
  return '';
};

export const displays = async () => {
  await nextTick();
  let result: DisplayData[] = [];

  try {
    const { stdout } = await shareInflight('SPDisplaysDataType', () => exec('system_profiler -xml -detailLevel full SPDisplaysDataType'));
    result = parseDisplaysDarwin(plistParser(stdout));
    result = await getDisplayPositionDarwin(result);
    result = await getWorkAreaDarwin(result);
    const powerState = await getPowerStateDarwin();
    for (const display of result) {
      display.powerState = powerState;
    }
  } catch {}
  return result;
};
