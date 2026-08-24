#!/usr/bin/env node

// ==================================================================================
// cli.ts
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2024
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================

const pck = require('../package.json');
import * as si from './index';

const capFirst = (str: string) => {
  return str[0].toUpperCase() + str.slice(1);
};

function getValue(value: any) {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return value.toString();
}

const printLines = (obj: any) => {
  for (const property in obj) {
    console.log(`${capFirst(property) + '                    '.substring(0, 17 - property.length)}: ${getValue(obj[property])}`);
  }
  console.log();
};

const info = () => {
  console.log('┌─────────────────────────────────────────────────────────────────────────────────────────┐');
  console.log(
    `${'│ SYSTEMINFORMATION                                                                                                   '.substring(0, 80 - pck.version.length)}Version: ${pck.version} │`
  );
  console.log('└─────────────────────────────────────────────────────────────────────────────────────────┘');

  si.osInfo().then((res) => {
    console.log();
    console.log('Operating System:');
    console.log('──────────────────────────────────────────────────────────────────────────────────────────');
    delete res.serial;
    delete res.servicepack;
    delete res.logofile;
    delete res.fqdn;
    delete res.uefi;
    printLines(res);
    si.system().then((res) => {
      console.log('System:');
      console.log('──────────────────────────────────────────────────────────────────────────────────────────');
      delete res.serial;
      delete res.uuid;
      delete res.sku;
      delete res.uuid;
      printLines(res);
      si.cpu().then((res) => {
        console.log('CPU:');
        console.log('──────────────────────────────────────────────────────────────────────────────────────────');
        delete res.cache;
        delete res.governor;
        delete res.flags;
        delete res.virtualization;
        delete res.revision;
        delete res.voltage;
        delete res.vendor;
        delete res.speedMin;
        delete res.speedMax;
        printLines(res);
      });
    });
  });
};

// ----------------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------------
(() => {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] !== 'info') {
    si.cpu().then(async (data) => {
      data.time = await si.time();
      console.log(JSON.stringify(data, null, 2));
    });
  } else {
    info();
  }
})();
