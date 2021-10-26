import { constants } from 'fs';
import { access } from 'fs/promises';

export const darwinXcodeExists = async () => {
  const results = await Promise.allSettled([
    access('/Library/Developer/CommandLineTools/usr/bin/', constants.F_OK),
    access('/Applications/Xcode.app/Contents/Developer/Tools', constants.F_OK),
    access('/Library/Developer/Xcode/', constants.F_OK)
  ]);

  // If at least one path fulfilled the promise xcode is installed
  return results.find(result => result.status === 'fulfilled') !== undefined;
};
