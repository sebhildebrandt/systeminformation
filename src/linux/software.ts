import { exec } from '../common/exec';
import { getValue, nextTick } from '../common';
import { Software } from '../common/types';
import { execOptsLinux } from '../common/const';

const run = async (cmd: string): Promise<string> => {
  try {
    const { stdout } = await exec(cmd, execOptsLinux);
    return stdout.toString();
  } catch {
    return '';
  }
};

const initSoftware = (source: string): Software => ({
  name: '',
  description: '',
  version: '',
  installDate: null,
  architecture: '',
  source,
  path: '',
  signedBy: []
});

// Debian/Ubuntu — status field keeps only fully installed packages (state "ii")
const parseDpkg = (stdout: string): Software[] =>
  stdout
    .split('\n')
    .filter(Boolean)
    .map((line) => line.split('\t'))
    .filter((parts) => (parts[0] || '').trim().startsWith('ii'))
    .map((parts) => ({
      ...initSoftware('dpkg'),
      name: (parts[1] || '').trim(),
      version: (parts[2] || '').trim(),
      architecture: (parts[3] || '').trim(),
      description: parts.slice(4).join('\t').trim()
    }));

// RHEL/Fedora/SUSE
const parseRpm = (stdout: string): Software[] =>
  stdout
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const parts = line.split('\t');
      const installtime = parseInt((parts[3] || '').trim(), 10);
      return {
        ...initSoftware('rpm'),
        name: (parts[0] || '').trim(),
        version: (parts[1] || '').trim(),
        architecture: (parts[2] || '').trim(),
        installDate: installtime ? new Date(installtime * 1000) : null,
        description: parts.slice(4).join('\t').trim()
      };
    });

// Arch — `pacman -Qi` emits blank-line separated blocks
const parsePacman = (stdout: string): Software[] => {
  const result: Software[] = [];
  stdout.split(/\n\s*\n/).forEach((block) => {
    const lines = block.split('\n');
    const name = getValue(lines, 'Name', ':', true);
    if (!name) {
      return;
    }
    const idate = getValue(lines, 'Install Date', ':', true);
    const parsed = idate ? new Date(idate) : null;
    result.push({
      ...initSoftware('pacman'),
      name,
      version: getValue(lines, 'Version', ':', true),
      architecture: getValue(lines, 'Architecture', ':', true),
      description: getValue(lines, 'Description', ':', true),
      installDate: parsed && !Number.isNaN(parsed.getTime()) ? parsed : null
    });
  });
  return result;
};

// universal app formats — first line is a header
const parseSnap = (stdout: string): Software[] =>
  stdout
    .split('\n')
    .slice(1)
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/\s+/);
      return {
        ...initSoftware('snap'),
        name: parts[0] || '',
        version: parts[1] || ''
      };
    });

const parseFlatpak = (stdout: string): Software[] =>
  stdout
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const parts = line.split('\t');
      return {
        ...initSoftware('flatpak'),
        name: (parts[0] || '').trim(),
        path: (parts[1] || '').trim(),
        version: (parts[2] || '').trim(),
        architecture: (parts[3] || '').trim()
      };
    });

export const software = async (): Promise<Software[]> => {
  await nextTick();

  const [dpkg, rpm, pacman, snap, flatpak] = await Promise.all([
    run("dpkg-query -W -f='${db:Status-Abbrev}\\t${Package}\\t${Version}\\t${Architecture}\\t${binary:Summary}\\n' 2>/dev/null"),
    run("rpm -qa --qf '%{NAME}\\t%{VERSION}-%{RELEASE}\\t%{ARCH}\\t%{INSTALLTIME}\\t%{SUMMARY}\\n' 2>/dev/null"),
    run('pacman -Qi 2>/dev/null'),
    run('snap list 2>/dev/null'),
    run('flatpak list --columns=name,application,version,arch 2>/dev/null')
  ]);

  return [...parseDpkg(dpkg), ...parseRpm(rpm), ...parsePacman(pacman), ...parseSnap(snap), ...parseFlatpak(flatpak)];
};
