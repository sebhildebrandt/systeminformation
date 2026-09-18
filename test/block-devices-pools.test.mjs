// Parser unit checks for zfs/btrfs pool detection in blockDevices()
// run: node test/block-devices-pools.test.mjs (after npm run dev)
import assert from 'node:assert/strict';
import { applyPoolsLinux, btrfsPoolsLinux, btrfsProfileFromEntries, parseZfsMountpoints, parseZpoolList, parseZpoolStatus, zfsPoolsLinux } from '../dist/common/filesys.js';

const ZPOOL_STATUS = `  pool: tank
 state: ONLINE
  scan: none requested
config:

	NAME                  STATE     READ WRITE CKSUM
	tank                  ONLINE       0     0     0
	  mirror-0            ONLINE       0     0     0
	    /dev/sda1         ONLINE       0     0     0
	    /dev/sdb1         ONLINE       0     0     0

errors: No known data errors

  pool: backup
 state: ONLINE
config:

	NAME            STATE     READ WRITE CKSUM
	backup          ONLINE       0     0     0
	  raidz1-0      ONLINE       0     0     0
	    /dev/sdc    ONLINE       0     0     0
	    /dev/sdd    ONLINE       0     0     0
	    /dev/sde    ONLINE       0     0     0
	logs
	  /dev/sdf      ONLINE       0     0     0

errors: No known data errors
`;

const ZPOOL_STATUS_STRIPE = `  pool: scratch
 state: ONLINE
config:

	NAME          STATE     READ WRITE CKSUM
	scratch       ONLINE       0     0     0
	  /dev/sdg    ONLINE       0     0     0

errors: No known data errors
`;

const status = parseZpoolStatus(ZPOOL_STATUS);
assert.deepEqual(status.get('tank'), { type: 'mirror', members: ['sda1', 'sdb1'] });
assert.deepEqual(status.get('backup'), { type: 'raidz1', members: ['sdc', 'sdd', 'sde', 'sdf'] });
assert.deepEqual(parseZpoolStatus(ZPOOL_STATUS_STRIPE).get('scratch'), { type: 'stripe', members: ['sdg'] });
assert.equal(parseZpoolStatus('').size, 0);

// draid vdev names keep their config suffix, only the trailing vdev index is dropped
const ZPOOL_STATUS_DRAID = `  pool: big
config:

	NAME                      STATE
	big                       ONLINE
	  draid2:4d:12c:2s-0      ONLINE
	    /dev/sdh              ONLINE
`;
assert.equal(parseZpoolStatus(ZPOOL_STATUS_DRAID).get('big').type, 'draid2:4d:12c:2s');

const list = parseZpoolList('tank\t10725883904\tONLINE\nbackup\t32210157568\tONLINE\n');
assert.equal(list.get('tank'), 10725883904);
assert.equal(list.get('backup'), 32210157568);
assert.equal(parseZpoolList('').size, 0);

assert.equal(btrfsProfileFromEntries(['bytes_used', 'total_bytes', 'raid1']), 'raid1');
assert.equal(btrfsProfileFromEntries(['total_bytes', 'raid1c3']), 'raid1c3');
assert.equal(btrfsProfileFromEntries(['total_bytes', 'bytes_used']), '');

// --- /proc/mounts: lsblk shows no mountpoint for zfs_member devices, the dataset is mounted ---
const PROC_MOUNTS = `/dev/sda1 / ext4 rw,relatime 0 0
tank /tank zfs rw,xattr,noacl 0 0
tank/data /tank/data zfs rw,xattr,noacl 0 0
backup /mnt/my\\040backup zfs rw,xattr,noacl 0 0
/dev/sdb /mnt/btr btrfs rw,relatime 0 0
`;
const mounts = parseZfsMountpoints(PROC_MOUNTS);
assert.equal(mounts.get('tank'), '/tank');
assert.equal(mounts.get('backup'), '/mnt/my backup', 'octal escapes must be decoded');
assert.equal(mounts.has('tank/data'), false, 'only root datasets carry the pool name');
assert.equal(mounts.has('/dev/sdb'), false, 'non zfs lines are ignored');
assert.equal(mounts.size, 2);
assert.equal(parseZfsMountpoints('').size, 0);

// --- applyPoolsLinux: sets group on members and appends one entry per pool ---
const blk = [
  { name: 'sda', type: 'disk', fsType: '', mount: '', size: 8001563222016, uuid: '', label: '', group: '' },
  { name: 'sda1', type: 'part', fsType: 'zfs_member', mount: '', size: 8001561124864, uuid: '', label: 'tank', group: '' },
  { name: 'sdb', type: 'disk', fsType: '', mount: '', size: 8001563222016, uuid: '', label: '', group: '' },
  { name: 'sdb1', type: 'part', fsType: 'zfs_member', mount: '', size: 8001561124864, uuid: '', label: 'tank', group: '' }
];
const result = applyPoolsLinux(blk, [
  { name: 'tank', type: 'mirror', fsType: 'zfs', size: 8001563222016, uuid: '', mount: '/tank', members: ['sda1', 'sdb1'] }
]);

assert.equal(result.length, 5);
assert.equal(result.find((e) => e.name === 'sda1').group, 'tank');
assert.equal(result.find((e) => e.name === 'sdb1').group, 'tank');
assert.equal(result.find((e) => e.name === 'sda').group, '');
const pool = result.find((e) => e.type === 'mirror');
assert.equal(pool.name, 'tank');
assert.equal(pool.fsType, 'zfs');
assert.equal(pool.mount, '/tank');
assert.equal(pool.size, 8001563222016);

// unknown members must not create an entry, and a pool without members is skipped entirely
assert.equal(applyPoolsLinux(blk, [{ name: 'ghost', type: 'mirror', fsType: 'zfs', size: 1, uuid: '', mount: '', members: ['sdz'] }]).length, 4);

// collectors must stay silent on hosts without zfs / btrfs instead of throwing
assert.deepEqual(await zfsPoolsLinux([]), []);
if (process.platform !== 'linux') {
  assert.deepEqual(await zfsPoolsLinux(blk), []);
  assert.deepEqual(await btrfsPoolsLinux(blk), []);
}

console.log('block-devices-pools: all checks passed');
