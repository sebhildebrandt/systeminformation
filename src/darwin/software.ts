import { plistParser } from '../common/darwin';
import { nextTick } from '../common';
import { exec } from '../common/exec';
import { Software } from '../common/types';

const parseSoftware = (data: string): Software[] => {
  const result: Software[] = [];
  const outObj = plistParser(data);
  outObj.forEach((element: any) => {
    let installDate: Date | null = null;
    try {
      installDate = new Date(element.lastModified);
    } catch {}
    result.push({
      name: element._name || '',
      description: element.info || '',
      version: element.version || '',
      installDate,
      architecture: element.arch_kind || '',
      source: element.obtained_from || '',
      path: element.path || '',
      signedBy: element.signed_by || []
    });
  });
  return result;
};

export const software = async (): Promise<Software[]> => {
  await nextTick();

  try {
    const { stdout } = await exec('system_profiler SPApplicationsDataType -xml');
    return parseSoftware(stdout);
  } catch {
    return [];
  }
};
