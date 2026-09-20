import { cloneObj, getValue, nextTick } from '../common';
import { initMemData } from '../common/defaults';
import { execSave } from '../common/exec';

export const mem = async () => {
  await nextTick();
  const defaults = cloneObj(initMemData);
  try {
    const { stdout } = await execSave(
      '/sbin/sysctl -i hw.realmem hw.physmem vm.stats.vm.v_page_count vm.stats.vm.v_wire_count vm.stats.vm.v_active_count vm.stats.vm.v_inactive_count vm.stats.vm.v_cache_count vm.stats.vm.v_free_count vm.stats.vm.v_page_size kstat.zfs.misc.arcstats.size kstat.zfs.misc.arcstats.c_min'
    );
    const lines = stdout.toString().split('\n');
    const pagesize = parseInt(getValue(lines, 'vm.stats.vm.v_page_size'), 10);
    const inactive = parseInt(getValue(lines, 'vm.stats.vm.v_inactive_count'), 10) * pagesize;
    const cache = parseInt(getValue(lines, 'vm.stats.vm.v_cache_count'), 10) * pagesize;
    const free = parseInt(getValue(lines, 'vm.stats.vm.v_free_count'), 10) * pagesize;
    const buffcache = inactive + cache;
    let total = parseInt(getValue(lines, 'hw.realmem'), 10);
    if (isNaN(total)) {
      total = parseInt(getValue(lines, 'hw.physmem'), 10);
    }
    // the zfs ARC is wired memory the page counters report as used, but it is released on
    // demand down to c_min - without this `active` sits near total on a zfs host (#808).
    // sysctl -i skips both names on a system without zfs, leaving arc at 0
    const arcSize = parseInt(getValue(lines, 'kstat.zfs.misc.arcstats.size'), 10) || 0;
    const arcMin = parseInt(getValue(lines, 'kstat.zfs.misc.arcstats.c_min'), 10) || 0;
    const arc = Math.max(arcSize - arcMin, 0);
    const available = Math.min(total, buffcache + free + arc);
    return {
      ...defaults,
      total,
      free,
      // defaults.used is evaluated once at import - always derive it from this measurement
      used: total - free,
      buffcache,
      available,
      active: total - available,
      swaptotal: 0,
      swapfree: 0,
      swapused: 0
    };
  } catch {}
  return defaults;
};
