import { cloneObj, getValue, nextTick } from '../common';
import { initMemData } from '../common/defaults';
import { execSave } from '../common/exec';

export const mem = async () => {
  await nextTick();
  const defaults = cloneObj(initMemData);
  try {
    const { stdout } = await execSave(
      '/sbin/sysctl -i hw.realmem hw.physmem vm.stats.vm.v_page_count vm.stats.vm.v_wire_count vm.stats.vm.v_active_count vm.stats.vm.v_inactive_count vm.stats.vm.v_cache_count vm.stats.vm.v_free_count vm.stats.vm.v_page_size'
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
    return {
      ...defaults,
      total,
      free,
      buffcache,
      available: buffcache + free,
      active: total - free - buffcache,
      swaptotal: 0,
      swapfree: 0,
      swapused: 0
    };
  } catch {}
  return defaults;
};
