import { existsSync } from "fs";

export const darwinXcodeExists = () => {
  const cmdLineToolsExists = existsSync('/Library/Developer/CommandLineTools/usr/bin/');
  const xcodeAppExists = existsSync('/Applications/Xcode.app/Contents/Developer/Tools');
  const xcodeExists = existsSync('/Library/Developer/Xcode/');
  return (cmdLineToolsExists || xcodeExists || xcodeAppExists);
};
