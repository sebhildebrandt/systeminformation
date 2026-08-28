import { nextTick, toInt } from '../common';
import { plistParser, plistReader } from '../common/darwin';
import { exec, shareInflight } from '../common/exec';
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
            currentRefreshRate: currentResolutionParts.length > 1 ? parseInt(currentResolutionParts[1], 10) : null
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

export const displays = async () => {
  await nextTick();
  let result: DisplayData[] = [];

  try {
    const { stdout } = await shareInflight('SPDisplaysDataType', () => exec('system_profiler -xml -detailLevel full SPDisplaysDataType'));
    result = parseDisplaysDarwin(plistParser(stdout));
    result = await getDisplayPositionDarwin(result);
  } catch {}
  return result;
};
