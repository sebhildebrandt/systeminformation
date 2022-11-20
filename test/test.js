const readline = require('readline');
const util = require('util');
const exec = require('child_process').exec;
const lib_version = require('../package.json').version;
const path = require('path');

let waiting = false;
let timer;

function printHeader() {
  console.log('');
  console.log('SYSTEMINFORMATION - Test Scripts - Version: ' + lib_version);
  console.log('═══════════════════════════════════════════════════════════');
}

function printMenu() {
  console.log('');
  console.log('┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐');
  console.log('│  a ... Audio              i ... INET Latency       t ... time               1 ... NET Iface Default     ? ... Get Object    │');
  console.log('│  b ... BIOS               I ... INET Check Site    T ... CPU Temperature    2 ... NET Gateway Default   , ... All Static    │');
  console.log('│  B ... Baseboard          j ... CPU Current Speed  u ... USB                3 ... NET Interfaces        . ... All Dynamic   │');
  console.log('│  C ... Chassis            l ... CPU Current Load   U ... UUID               4 ... NET Stats             / ... All           │');
  console.log('│  c ... CPU                L ... Full Load          v ... Versions           5 ... NET Connections                           │');
  console.log('│  d ... DiskLayout         m ... Memory             V ... Virtual Box                                                        │');
  console.log('│  D ... DiskIO             M ... MEM Layout         w ... WIFI networks                                                      │');
  console.log('│  e ... Block Devices      o ... OS Info            W ... WIFI interfaces    6 ... Docker Info                               │');
  console.log('│  E ... Open Files         p ... Processes          x ... WIFI connections   7 ... Docker Images                             │');
  console.log('│  f ... FS Size            P ... Process Load       y ... System             8 ... Docker Container                          │');
  console.log('│  F ... FS Stats           r ... Printer            Y ... Battery            9 ... Docker Cont Stats                         │');
  console.log('│  g ... Graphics           s ... Services           z ... Users              0 ... Docker Cont Proc                          │');
  console.log('│  h ... Bluetooth          S ... Shell                                       + ... Docker Volumes        q >>> QUIT          │');
  console.log('└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘');
}

function EnableUserInput() {
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
}

function dot() {
  process.stdout.write('.');
}

function clearline() {
  readline.cursorTo(process.stdout, 0);
  process.stdout.write('                                                                      ');
}


function startDots() {
  dot();
  timer = setInterval(() => {
    dot();
  }, 500);
}

function stopDots() {
  clearInterval(timer);
}

function printTitle(title) {
  // https://en.wikipedia.org/wiki/Box_Drawing_(Unicode_block)
  title = '│' + ('  ' + title + '                                     ').substr(0, 44 - lib_version.length) + 'v: ' + lib_version + ' │';
  console.log('┌────────────────────────────────────────────────┐');
  console.log(title);
  console.log('└────────────────────────────────────────────────┘');

}

process.stdin.on('keypress', (key, data) => {
  if (data.name === 'q' && !data.shift) {
    // shut down
    process.exit();
  }

  if (!waiting) {
    waiting = true;
    console.time(['Time to complete']);
    startDots();
    const siPath = path.join(__dirname, 'si.js');
    exec(`node ${siPath} '${key}'`, { timeout: 30000 }, (error, stdout) => {
      waiting = false;
      stopDots();
      clearline();
      if (error && error.signal) {
        console.log();
        console.log('Key: ' + key);
        console.log('TIMEOUT!');
      } else {
        try {
          if (stdout.toString().startsWith('"no_key')) {
            console.log();
            console.timeEnd(['Time to complete']);
            console.log('Menu item not found. Please select valid menu item ... Press q to quit');
          } else if (stdout.toString().startsWith('"not_supported')) {
            console.log();
            console.timeEnd(['Time to complete']);
            console.log('Key: ' + key);
            console.log('Not supported');
          } else if (stdout.toString()) {
            data = JSON.parse(stdout.toString());
            console.log();
            printTitle(data.title);
            console.log(util.inspect(data.data, { colors: true, depth: 4 }));
            console.timeEnd(['Time to complete']);
            printMenu();
          }
        } catch (e) {
          console.log();
          console.log('Key: ' + key);
          console.log('ERROR');
          console.log('----------------------------------------------------------------------------------------------------');
          console.log(stdout.toString());
          console.timeEnd(['Time to complete']);
          console.log();
        }
      }
    });
  }
});

printHeader();
printMenu();
EnableUserInput();
