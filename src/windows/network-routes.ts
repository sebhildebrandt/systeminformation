import { nextTick, toInt } from '../common';
import type { NetworkRouteData } from '../common/types';
import { ps, psArray } from '../common/windows';

// InterfaceMetric is a script property of MSFT_NetRoute that queries the interface per route -
// fetching the interfaces once and joining them here is much faster
const ROUTES_SCRIPT = [
  "$routes = @(Get-NetRoute -PolicyStore ActiveStore -ErrorAction SilentlyContinue | Select-Object DestinationPrefix,NextHop,InterfaceAlias,InterfaceIndex,RouteMetric,@{n='Family';e={[int]$_.AddressFamily}});",
  "$ifaces = @(Get-NetIPInterface -ErrorAction SilentlyContinue | Select-Object InterfaceIndex,InterfaceMetric,@{n='Family';e={[int]$_.AddressFamily}});",
  '@{ routes = $routes; ifaces = $ifaces } | ConvertTo-Json -Depth 3 -Compress'
].join(' ');

// AddressFamily: 2 = IPv4, 23 = IPv6
const familyName = (value: unknown) => (toInt(String(value)) === 23 ? 'IPv6' : 'IPv4');

export const parseWindowsRoutes = (data: any): NetworkRouteData[] => {
  const ifaceMetrics = new Map<string, number>();
  for (const iface of psArray(data?.ifaces)) {
    ifaceMetrics.set(`${iface?.InterfaceIndex}/${familyName(iface?.Family)}`, toInt(String(iface?.InterfaceMetric)) || 0);
  }
  return psArray(data?.routes).map((route: any) => {
    const family = familyName(route?.Family);
    // toInt() maps a missing value to 0 - a missing metric must stay null
    const routeMetric = typeof route?.RouteMetric === 'number' ? route.RouteMetric : Number.NaN;
    // effective metric as shown by "route print": route metric + interface metric
    const ifaceMetric = ifaceMetrics.get(`${route?.InterfaceIndex}/${family}`) ?? 0;
    const nextHop = String(route?.NextHop || '');
    return {
      destination: String(route?.DestinationPrefix || ''),
      gateway: nextHop === '0.0.0.0' || nextHop === '::' ? '' : nextHop,
      iface: String(route?.InterfaceAlias || ''),
      metric: Number.isNaN(routeMetric) ? null : routeMetric + ifaceMetric,
      family
    };
  });
};

export const networkRoutes = async (): Promise<NetworkRouteData[]> => {
  await nextTick();
  try {
    return parseWindowsRoutes(await ps.exec(ROUTES_SCRIPT));
  } catch {
    return [];
  }
};
