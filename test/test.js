const readline = require('readline');
const util = require('util');
const exec = require('child_process').exec;
const lib_version = require('../package.json').prereleaseversion;
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
  console.log('┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐');
  console.log('│  a ... Audio              h ... Bluetooth          s ... Services                                          ? ... Get Object      │');
  console.log('│  b ... BIOS               i ... INET Latency       S ... Shell                                             , ... All Static      │');
  console.log('│  B ... Baseboard          I ... INET Check Site    t ... time               1 ... NET Iface Default        . ... All Dynamic     │');
  console.log('│  C ... Chassis            j ... CPU Current Speed  T ... CPU Temperature    2 ... NET Gateway Default      / ... All             │');
  console.log('│  c ... CPU                l ... CPU Current Load   u ... USB                3 ... NET Interfaces                                 │');
  console.log('│  d ... DiskLayout         L ... Full Load          U ... UUID               4 ... NET Stats                                      │');
  console.log('│  D ... DiskIO             m ... Memory             v ... Versions           5 ... NET Connections                                │');
  console.log('│  e ... Block Devices      M ... MEM Layout         V ... Virtual Box        6 ... Docker Info                                    │');
  console.log('│  E ... Open Files         o ... OS Info            w ... WIFI networks      7 ... Docker Container                               │');
  console.log('│  f ... FS Size            p ... Processes          y ... System             8 ... Docker Cont Stats                              │');
  console.log('│  F ... FS Stats           P ... Process Load       Y ... Battery            9 ... Docker Cont Proc                               │');
  console.log('│  g ... Graphics           r ... Printer            z ... Users              0 ... Docker All               q >>> QUIT            │');
  console.log('└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘');
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
  title = '│' + ('  ' + title + '                                 ').substr(0, 44 - lib_version.length) + 'v: ' + lib_version + ' │';
  console.log('┌────────────────────────────────────────────────┐');
  console.log(title);
  console.log('└────────────────────────────────────────────────┘');

}

process.stdin.on('keypress', (key, data) => {
  // console.log(data);
  if (data.name === 'q' && !data.shift) {
      // shut down
    process.exit();
  }

  if (!waiting) {
    waiting = true;
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
            console.log('Menu item not found. Please select valid menu item ... Press q to quit');
          } else if (stdout.toString().startsWith('"not_supported')) {
            console.log();
            console.log('Key: ' + key);
            console.log('Not supported');
          } else if (stdout.toString()) {
            data = JSON.parse(stdout.toString());
            console.log();
            printTitle(data.title);
            console.log(util.inspect(data.data, { colors: true, depth: 4 }));
            printMenu();
          }
        } catch (e) {
          console.log();
          console.log('Key: ' + key);
          console.log('ERROR');
          console.log('----------------------------------------------------------------------------------------------------');
          console.log(stdout.toString());
          console.log();
        }
      }
    });
  }
});

printHeader();
printMenu();
EnableUserInput();
