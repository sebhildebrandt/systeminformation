import { execSave } from './common/exec';
import { Npm } from './common/types';

export const npm = async (): Promise<Npm[]> => {
  const result: Npm[] = [];
  const { stdout } = await execSave('npm list -g --depth=0');
  const lines = (stdout || '').split('\n');
  lines.forEach((element) => {
    const lineSplit = element.split(/[─-]{2} /); // unix `── `, windows `-- `
    if (lineSplit.length > 1) {
      const packageSplit = lineSplit[1].trim().split('@');
      const version = packageSplit.pop() || '';
      result.push({
        name: packageSplit.join('@'),
        version
      });
    }
  });
  return result;
};
