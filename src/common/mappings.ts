'use strict';

import { PLATFORM, WINDOWS } from "./const";
import { CpuObject } from "./types";

export const audioTypeLabel = (type: string, input = false, output = false) => {
  const speaker = 'Speaker';
  const microphone = 'Microphone';
  switch (true) {
    case type.indexOf('speak') >= 0: return speaker;
    case type.indexOf('laut') >= 0: return speaker;
    case type.indexOf('loud') >= 0: return speaker;
    case type.indexOf('head') >= 0: return 'Headset';
    case type.indexOf('mic') >= 0: return microphone;
    case type.indexOf('mikr') >= 0: return microphone;
    case type.indexOf('controll') >= 0: return 'Controller';
    case type.indexOf('line o') >= 0: return 'Line Out';
    case type.indexOf('digital o') >= 0: return 'Digital Out';
    case output: return speaker;
    case input: return microphone;
    default: return '';
  }
};

export const audioDarwinChannelLabel = (str: string) => {
  switch (true) {
    case str.indexOf('builtin') >= 0: return 'Built-In';
    case str.indexOf('extern') >= 0: return 'Audio-Jack';
    case str.indexOf('hdmi') >= 0: return 'HDMI';
    case str.indexOf('displayport') >= 0: return 'Display-Port';
    case str.indexOf('usb') >= 0: return 'USB';
    case str.indexOf('pci') >= 0: return 'PCIe';
    default: return '';
  }
};

export const bluetoothTypeLabel = (str: string) => {
  let result = '';
  switch (true) {
    case str.indexOf('keyboard') >= 0: return 'Keyboard';
    case str.indexOf('mouse') >= 0: return 'Mouse';
    case str.indexOf('speaker') >= 0: return 'Speaker';
    case str.indexOf('headset') >= 0: return 'Headset';
    case str.indexOf('phone') >= 0: return 'Phone';
    default: return '';
  }
};

export const usbLinuxType = (type: string, name: string) => {
  let result = type;
  const str = (name + ' ' + type).toLowerCase();
  switch (true) {
    case (str.indexOf('camera') >= 0): return 'Camera';
    case (str.indexOf('hub') >= 0): return 'Hub';
    case (str.indexOf('keybrd') >= 0): return 'Keyboard';
    case (str.indexOf('keyboard') >= 0): return 'Keyboard';
    case (str.indexOf('mouse') >= 0): return 'Mouse';
    case (str.indexOf('stora') >= 0): return 'Storage';
    case (str.indexOf('mic') >= 0): return 'Microphone';
    case (str.indexOf('headset') >= 0): return 'Audio';
    case (str.indexOf('audio') >= 0): return 'Audio';
    default: return '';
  }
};

export const usbDarwinType = (name: string) => {
  switch (true) {
    case (name.indexOf('camera') >= 0): return 'Camera';
    case (name.indexOf('touch bar') >= 0): return 'Touch Bar';
    case (name.indexOf('controller') >= 0): return 'Controller';
    case (name.indexOf('headset') >= 0): return 'Audio';
    case (name.indexOf('keyboard') >= 0): return 'Keyboard';
    case (name.indexOf('trackpad') >= 0): return 'Trackpad';
    case (name.indexOf('sensor') >= 0): return 'Sensor';
    case (name.indexOf('bthusb') >= 0): return 'Bluetooth';
    case (name.indexOf('bth') >= 0): return 'Bluetooth';
    case (name.indexOf('rfcomm') >= 0): return 'Bluetooth';
    case (name.indexOf('usbhub') >= 0): return 'Hub';
    case (name.indexOf(' hub') >= 0): return 'Hub';
    case (name.indexOf('mouse') >= 0): return 'Mouse';
    case (name.indexOf('mic') >= 0): return 'Microphone';
    case (name.indexOf('removable') >= 0): return 'Storage';
    default: return '';
  }
};

export const usbWindowsType = (creationclass: string, name: string) => {
  switch (true) {
    case (name.indexOf('storage') >= 0): return 'Storage';
    case (name.indexOf('speicher') >= 0): return 'Storage';
    case (creationclass.indexOf('usbhub') >= 0): return 'Hub';
    case (creationclass.indexOf('storage') >= 0): return 'Storage';
    case (creationclass.indexOf('usbcontroller') >= 0): return 'Controller';
    case (creationclass.indexOf('keyboard') >= 0): return 'Keyboard';
    case (creationclass.indexOf('pointing') >= 0): return 'Mouse';
    case (creationclass.indexOf('disk') >= 0): return 'Storage';
    default: return '';
  }
};

export const wifiVendor = (model: string) => {
  model = model.toLowerCase();
  switch (true) {
    case (model.indexOf('intel') >= 0): return 'Intel';
    case (model.indexOf('realtek') >= 0): return 'Realtek';
    case (model.indexOf('qualcom') >= 0): return 'Qualcom';
    case (model.indexOf('broadcom') >= 0): return 'Broadcom';
    case (model.indexOf('cavium') >= 0): return 'Cavium';
    case (model.indexOf('cisco') >= 0): return 'Cisco';
    case (model.indexOf('marvel') >= 0): return 'Marvel';
    case (model.indexOf('zyxel') >= 0): return 'Zyxel';
    case (model.indexOf('melanox') >= 0): return 'Melanox';
    case (model.indexOf('d-link') >= 0): return 'D-Link';
    case (model.indexOf('tp-link') >= 0): return 'TP-Link';
    case (model.indexOf('asus') >= 0): return 'Asus';
    case (model.indexOf('linksys') >= 0): return 'Linksys';
    default: return '';
  }
};

export const getLogoFile = (distro = '') => {
  distro = distro || '';
  distro = distro.toLowerCase();
  switch (true) {
    case (WINDOWS): return 'windows';
    case (distro.indexOf('mac os') !== -1): return 'apple';
    case (distro.indexOf('arch') !== -1): return 'arch';
    case (distro.indexOf('centos') !== -1): return 'centos';
    case (distro.indexOf('coreos') !== -1): return 'coreos';
    case (distro.indexOf('debian') !== -1): return 'debian';
    case (distro.indexOf('deepin') !== -1): return 'deepin';
    case (distro.indexOf('elementary') !== -1): return 'elementary';
    case (distro.indexOf('fedora') !== -1): return 'fedora';
    case (distro.indexOf('gentoo') !== -1): return 'gentoo';
    case (distro.indexOf('mageia') !== -1): return 'mageia';
    case (distro.indexOf('mandriva') !== -1): return 'mandriva';
    case (distro.indexOf('manjaro') !== -1): return 'manjaro';
    case (distro.indexOf('mint') !== -1): return 'mint';
    case (distro.indexOf('mx') !== -1): return 'mx';
    case (distro.indexOf('openbsd') !== -1): return 'openbsd';
    case (distro.indexOf('freebsd') !== -1): return 'freebsd';
    case (distro.indexOf('opensuse') !== -1): return 'opensuse';
    case (distro.indexOf('pclinuxos') !== -1): return 'pclinuxos';
    case (distro.indexOf('puppy') !== -1): return 'puppy';
    case (distro.indexOf('raspbian') !== -1): return 'raspbian';
    case (distro.indexOf('reactos') !== -1): return 'reactos';
    case (distro.indexOf('redhat') !== -1): return 'redhat';
    case (distro.indexOf('slackware') !== -1): return 'slackware';
    case (distro.indexOf('sugar') !== -1): return 'sugar';
    case (distro.indexOf('steam') !== -1): return 'steam';
    case (distro.indexOf('suse') !== -1): return 'suse';
    case (distro.indexOf('mate') !== -1): return 'ubuntu-mate';
    case (distro.indexOf('lubuntu') !== -1): return 'lubuntu';
    case (distro.indexOf('xubuntu') !== -1): return 'xubuntu';
    case (distro.indexOf('ubuntu') !== -1): return 'ubuntu';
    case (distro.indexOf('solaris') !== -1): return 'solaris';
    case (distro.indexOf('tails') !== -1): return 'tails';
    case (distro.indexOf('feren') !== -1): return 'ferenos';
    case (distro.indexOf('robolinux') !== -1): return 'robolinux';
    default: return PLATFORM;
  }
};

export const OSX_RAM_manufacturers: { [index: string]: any; } = {
  '0x014F': 'Transcend Information',
  '0x2C00': 'Micron Technology Inc.',
  '0x802C': 'Micron Technology Inc.',
  '0x80AD': 'Hynix Semiconductor Inc.',
  '0x80CE': 'Samsung Electronics Inc.',
  '0xAD00': 'Hynix Semiconductor Inc.',
  '0xCE00': 'Samsung Electronics Inc.',
  '0x02FE': 'Elpida',
  '0x5105': 'Qimonda AG i. In.',
  '0x8551': 'Qimonda AG i. In.',
  '0x859B': 'Crucial',
  '0x04CD': 'G-Skill'
};

export const LINUX_RAM_manufacturers: { [index: string]: any; } = {
  '017A': 'Apacer',
  '0198': 'HyperX',
  '029E': 'Corsair',
  '04CB': 'A-DATA',
  '04CD': 'G-Skill',
  '059B': 'Crucial',
  '00CE': 'Samsung',
  '1315': 'Crutial',
  '014F': 'Transcend Information',
  '2C00': 'Micron Technology Inc.',
  '802C': 'Micron Technology Inc.',
  '80AD': 'Hynix Semiconductor Inc.',
  '80CE': 'Samsung Electronics Inc.',
  'AD00': 'Hynix Semiconductor Inc.',
  'CE00': 'Samsung Electronics Inc.',
  '02FE': 'Elpida',
  '5105': 'Qimonda AG i. In.',
  '8551': 'Qimonda AG i. In.',
  '859B': 'Crucial'
};

export const getManufacturerDarwin = (manId: string) => {
  if ({}.hasOwnProperty.call(OSX_RAM_manufacturers, manId)) {
    return (OSX_RAM_manufacturers[manId]);
  }
  return manId;
};

export const getManufacturerLinux = (manId: string) => {
  const manIdSearch = manId.replace('0x', '').toUpperCase();
  if (manIdSearch.length === 4 && {}.hasOwnProperty.call(LINUX_RAM_manufacturers, manIdSearch)) {
    return (LINUX_RAM_manufacturers[manIdSearch]);
  }
  return manId;
};

export const raspberryClockSpeed: { [index: string]: any; } = {
  '0': 400,
  '1': 450,
  '2': 450,
  '3': 3200
};


export const winPrinterStatus: { [index: string]: any; } = {
  1: 'Other',
  2: 'Unknown',
  3: 'Idle',
  4: 'Printing',
  5: 'Warmup',
  6: 'Stopped Printing',
  7: 'Offline',
};

export const AMDBaseFrequencies = {
  '8346': '1.8',
  '8347': '1.9',
  '8350': '2.0',
  '8354': '2.2',
  '8356|SE': '2.4',
  '8356': '2.3',
  '8360': '2.5',
  '2372': '2.1',
  '2373': '2.1',
  '2374': '2.2',
  '2376': '2.3',
  '2377': '2.3',
  '2378': '2.4',
  '2379': '2.4',
  '2380': '2.5',
  '2381': '2.5',
  '2382': '2.6',
  '2384': '2.7',
  '2386': '2.8',
  '2387': '2.8',
  '2389': '2.9',
  '2393': '3.1',
  '8374': '2.2',
  '8376': '2.3',
  '8378': '2.4',
  '8379': '2.4',
  '8380': '2.5',
  '8381': '2.5',
  '8382': '2.6',
  '8384': '2.7',
  '8386': '2.8',
  '8387': '2.8',
  '8389': '2.9',
  '8393': '3.1',
  '2419EE': '1.8',
  '2423HE': '2.0',
  '2425HE': '2.1',
  '2427': '2.2',
  '2431': '2.4',
  '2435': '2.6',
  '2439SE': '2.8',
  '8425HE': '2.1',
  '8431': '2.4',
  '8435': '2.6',
  '8439SE': '2.8',
  '4122': '2.2',
  '4130': '2.6',
  '4162EE': '1.7',
  '4164EE': '1.8',
  '4170HE': '2.1',
  '4174HE': '2.3',
  '4176HE': '2.4',
  '4180': '2.6',
  '4184': '2.8',
  '6124HE': '1.8',
  '6128HE': '2.0',
  '6132HE': '2.2',
  '6128': '2.0',
  '6134': '2.3',
  '6136': '2.4',
  '6140': '2.6',
  '6164HE': '1.7',
  '6166HE': '1.8',
  '6168': '1.9',
  '6172': '2.1',
  '6174': '2.2',
  '6176': '2.3',
  '6176SE': '2.3',
  '6180SE': '2.5',
  '3250': '2.5',
  '3260': '2.7',
  '3280': '2.4',
  '4226': '2.7',
  '4228': '2.8',
  '4230': '2.9',
  '4234': '3.1',
  '4238': '3.3',
  '4240': '3.4',
  '4256': '1.6',
  '4274': '2.5',
  '4276': '2.6',
  '4280': '2.8',
  '4284': '3.0',
  '6204': '3.3',
  '6212': '2.6',
  '6220': '3.0',
  '6234': '2.4',
  '6238': '2.6',
  '6262HE': '1.6',
  '6272': '2.1',
  '6274': '2.2',
  '6276': '2.3',
  '6278': '2.4',
  '6282SE': '2.6',
  '6284SE': '2.7',
  '6308': '3.5',
  '6320': '2.8',
  '6328': '3.2',
  '6338P': '2.3',
  '6344': '2.6',
  '6348': '2.8',
  '6366': '1.8',
  '6370P': '2.0',
  '6376': '2.3',
  '6378': '2.4',
  '6380': '2.5',
  '6386': '2.8',
  'FX|4100': '3.6',
  'FX|4120': '3.9',
  'FX|4130': '3.8',
  'FX|4150': '3.8',
  'FX|4170': '4.2',
  'FX|6100': '3.3',
  'FX|6120': '3.6',
  'FX|6130': '3.6',
  'FX|6200': '3.8',
  'FX|8100': '2.8',
  'FX|8120': '3.1',
  'FX|8140': '3.2',
  'FX|8150': '3.6',
  'FX|8170': '3.9',
  'FX|4300': '3.8',
  'FX|4320': '4.0',
  'FX|4350': '4.2',
  'FX|6300': '3.5',
  'FX|6350': '3.9',
  'FX|8300': '3.3',
  'FX|8310': '3.4',
  'FX|8320': '3.5',
  'FX|8350': '4.0',
  'FX|8370': '4.0',
  'FX|9370': '4.4',
  'FX|9590': '4.7',
  'FX|8320E': '3.2',
  'FX|8370E': '3.3',

  // ZEN Desktop CPUs
  '1200': '3.1',
  'Pro 1200': '3.1',
  '1300X': '3.5',
  'Pro 1300': '3.5',
  '1400': '3.2',
  '1500X': '3.5',
  'Pro 1500': '3.5',
  '1600': '3.2',
  '1600X': '3.6',
  'Pro 1600': '3.2',
  '1700': '3.0',
  'Pro 1700': '3.0',
  '1700X': '3.4',
  'Pro 1700X': '3.4',
  '1800X': '3.6',
  '1900X': '3.8',
  '1920': '3.2',
  '1920X': '3.5',
  '1950X': '3.4',

  // ZEN Desktop APUs
  '200GE': '3.2',
  'Pro 200GE': '3.2',
  '220GE': '3.4',
  '240GE': '3.5',
  '3000G': '3.5',
  '300GE': '3.4',
  '3050GE': '3.4',
  '2200G': '3.5',
  'Pro 2200G': '3.5',
  '2200GE': '3.2',
  'Pro 2200GE': '3.2',
  '2400G': '3.6',
  'Pro 2400G': '3.6',
  '2400GE': '3.2',
  'Pro 2400GE': '3.2',

  // ZEN Mobile APUs
  'Pro 200U': '2.3',
  '300U': '2.4',
  '2200U': '2.5',
  '3200U': '2.6',
  '2300U': '2.0',
  'Pro 2300U': '2.0',
  '2500U': '2.0',
  'Pro 2500U': '2.2',
  '2600H': '3.2',
  '2700U': '2.0',
  'Pro 2700U': '2.2',
  '2800H': '3.3',

  // ZEN Server Processors
  '7351': '2.4',
  '7351P': '2.4',
  '7401': '2.0',
  '7401P': '2.0',
  '7551P': '2.0',
  '7551': '2.0',
  '7251': '2.1',
  '7261': '2.5',
  '7281': '2.1',
  '7301': '2.2',
  '7371': '3.1',
  '7451': '2.3',
  '7501': '2.0',
  '7571': '2.2',
  '7601': '2.2',

  // ZEN Embedded Processors
  'V1500B': '2.2',
  'V1780B': '3.35',
  'V1202B': '2.3',
  'V1404I': '2.0',
  'V1605B': '2.0',
  'V1756B': '3.25',
  'V1807B': '3.35',

  '3101': '2.1',
  '3151': '2.7',
  '3201': '1.5',
  '3251': '2.5',
  '3255': '2.5',
  '3301': '2.0',
  '3351': '1.9',
  '3401': '1.85',
  '3451': '2.15',

  // ZEN+ Desktop
  '1200|AF': '3.1',
  '2300X': '3.5',
  '2500X': '3.6',
  '2600': '3.4',
  '2600E': '3.1',
  '1600|AF': '3.2',
  '2600X': '3.6',
  '2700': '3.2',
  '2700E': '2.8',
  'Pro 2700': '3.2',
  '2700X': '3.7',
  'Pro 2700X': '3.6',
  '2920X': '3.5',
  '2950X': '3.5',
  '2970WX': '3.0',
  '2990WX': '3.0',

  // ZEN+ Desktop APU
  'Pro 300GE': '3.4',
  'Pro 3125GE': '3.4',
  '3150G': '3.5',
  'Pro 3150G': '3.5',
  '3150GE': '3.3',
  'Pro 3150GE': '3.3',
  '3200G': '3.6',
  'Pro 3200G': '3.6',
  '3200GE': '3.3',
  'Pro 3200GE': '3.3',
  '3350G': '3.6',
  'Pro 3350G': '3.6',
  '3350GE': '3.3',
  'Pro 3350GE': '3.3',
  '3400G': '3.7',
  'Pro 3400G': '3.7',
  '3400GE': '3.3',
  'Pro 3400GE': '3.3',

  // ZEN+ Mobile
  '3300U': '2.1',
  'PRO 3300U': '2.1',
  '3450U': '2.1',
  '3500U': '2.1',
  'PRO 3500U': '2.1',
  '3500C': '2.1',
  '3550H': '2.1',
  '3580U': '2.1',
  '3700U': '2.3',
  'PRO 3700U': '2.3',
  '3700C': '2.3',
  '3750H': '2.3',
  '3780U': '2.3',

  // ZEN2 Desktop CPUS
  '3100': '3.6',
  '3300X': '3.8',
  '3500': '3.6',
  '3500X': '3.6',
  '3600': '3.6',
  'Pro 3600': '3.6',
  '3600X': '3.8',
  '3600XT': '3.8',
  'Pro 3700': '3.6',
  '3700X': '3.6',
  '3800X': '3.9',
  '3800XT': '3.9',
  '3900': '3.1',
  'Pro 3900': '3.1',
  '3900X': '3.8',
  '3900XT': '3.8',
  '3950X': '3.5',
  '3960X': '3.8',
  '3970X': '3.7',
  '3990X': '2.9',
  '3945WX': '4.0',
  '3955WX': '3.9',
  '3975WX': '3.5',
  '3995WX': '2.7',

  // ZEN2 Desktop APUs
  '4300GE': '3.5',
  'Pro 4300GE': '3.5',
  '4300G': '3.8',
  'Pro 4300G': '3.8',
  '4600GE': '3.3',
  'Pro 4650GE': '3.3',
  '4600G': '3.7',
  'Pro 4650G': '3.7',
  '4700GE': '3.1',
  'Pro 4750GE': '3.1',
  '4700G': '3.6',
  'Pro 4750G': '3.6',
  '4300U': '2.7',
  '4450U': '2.5',
  'Pro 4450U': '2.5',
  '4500U': '2.3',
  '4600U': '2.1',
  'PRO 4650U': '2.1',
  '4680U': '2.1',
  '4600HS': '3.0',
  '4600H': '3.0',
  '4700U': '2.0',
  'PRO 4750U': '1.7',
  '4800U': '1.8',
  '4800HS': '2.9',
  '4800H': '2.9',
  '4900HS': '3.0',
  '4900H': '3.3',
  '5300U': '2.6',
  '5500U': '2.1',
  '5700U': '1.8',

  // ZEN2 - EPYC
  '7232P': '3.1',
  '7302P': '3.0',
  '7402P': '2.8',
  '7502P': '2.5',
  '7702P': '2.0',
  '7252': '3.1',
  '7262': '3.2',
  '7272': '2.9',
  '7282': '2.8',
  '7302': '3.0',
  '7352': '2.3',
  '7402': '2.8',
  '7452': '2.35',
  '7502': '2.5',
  '7532': '2.4',
  '7542': '2.9',
  '7552': '2.2',
  '7642': '2.3',
  '7662': '2.0',
  '7702': '2.0',
  '7742': '2.25',
  '7H12': '2.6',
  '7F32': '3.7',
  '7F52': '3.5',
  '7F72': '3.2',

  // Epyc (Milan)

  '7763': '2.45',
  '7713': '2.0',
  '7713P': '2.0',
  '7663': '2.0',
  '7643': '2.3',
  '75F3': '2.95',
  '7543': '2.8',
  '7543P': '2.8',
  '7513': '2.6',
  '7453': '2.75',
  '74F3': '3.2',
  '7443': '2.85',
  '7443P': '2.85',
  '7413': '2.65',
  '73F3': '3.5',
  '7343': '3.2',
  '7313': '3.0',
  '7313P': '3.0',
  '72F3': '3.7',

  // ZEN3
  '5600X': '3.7',
  '5800X': '3.8',
  '5900X': '3.7',
  '5950X': '3.4'
};

export const getAMDSpeed = (brand: string): number => {
  let result = '0';
  let key: keyof typeof AMDBaseFrequencies;
  for (key in AMDBaseFrequencies) {
    if ({}.hasOwnProperty.call(AMDBaseFrequencies, key)) {
      let parts = key.split('|');
      let found = 0;
      parts.forEach(item => {
        if (brand.indexOf(item) > -1) {
          found++;
        }
      });
      if (found === parts.length) {
        result = AMDBaseFrequencies[key];
      }
    }
  }
  return parseFloat(result);
};

export const cpuBrandManufacturer = (res: CpuObject) => {
  res.brand = res.brand.replace(/\(R\)+/g, '®').replace(/\s+/g, ' ').trim();
  res.brand = res.brand.replace(/\(TM\)+/g, '™').replace(/\s+/g, ' ').trim();
  res.brand = res.brand.replace(/\(C\)+/g, '©').replace(/\s+/g, ' ').trim();
  res.brand = res.brand.replace(/CPU+/g, '').replace(/\s+/g, ' ').trim();
  res.manufacturer = res.brand.split(' ')[0];

  let parts = res.brand.split(' ');
  parts.shift();
  res.brand = parts.join(' ');
  return res;
};


export const socketTypes: { [index: string]: any; } = {
  1: 'Other',
  2: 'Unknown',
  3: 'Daughter Board',
  4: 'ZIF Socket',
  5: 'Replacement/Piggy Back',
  6: 'None',
  7: 'LIF Socket',
  8: 'Slot 1',
  9: 'Slot 2',
  10: '370 Pin Socket',
  11: 'Slot A',
  12: 'Slot M',
  13: '423',
  14: 'A (Socket 462)',
  15: '478',
  16: '754',
  17: '940',
  18: '939',
  19: 'mPGA604',
  20: 'LGA771',
  21: 'LGA775',
  22: 'S1',
  23: 'AM2',
  24: 'F (1207)',
  25: 'LGA1366',
  26: 'G34',
  27: 'AM3',
  28: 'C32',
  29: 'LGA1156',
  30: 'LGA1567',
  31: 'PGA988A',
  32: 'BGA1288',
  33: 'rPGA988B',
  34: 'BGA1023',
  35: 'BGA1224',
  36: 'LGA1155',
  37: 'LGA1356',
  38: 'LGA2011',
  39: 'FS1',
  40: 'FS2',
  41: 'FM1',
  42: 'FM2',
  43: 'LGA2011-3',
  44: 'LGA1356-3',
  45: 'LGA1150',
  46: 'BGA1168',
  47: 'BGA1234',
  48: 'BGA1364',
  49: 'AM4',
  50: 'LGA1151',
  51: 'BGA1356',
  52: 'BGA1440',
  53: 'BGA1515',
  54: 'LGA3647-1',
  55: 'SP3',
  56: 'SP3r2',
  57: 'LGA2066',
  58: 'BGA1392',
  59: 'BGA1510',
  60: 'BGA1528',
  61: 'LGA4189',
  62: 'LGA1200',
  63: 'LGA4677',
};

export const wifiFrequencies: { [index: string]: any; } = {
  1: 2412,
  2: 2417,
  3: 2422,
  4: 2427,
  5: 2432,
  6: 2437,
  7: 2442,
  8: 2447,
  9: 2452,
  10: 2457,
  11: 2462,
  12: 2467,
  13: 2472,
  14: 2484,
  32: 5160,
  34: 5170,
  36: 5180,
  38: 5190,
  40: 5200,
  42: 5210,
  44: 5220,
  46: 5230,
  48: 5240,
  50: 5250,
  52: 5260,
  54: 5270,
  56: 5280,
  58: 5290,
  60: 5300,
  62: 5310,
  64: 5320,
  68: 5340,
  96: 5480,
  100: 5500,
  102: 5510,
  104: 5520,
  106: 5530,
  108: 5540,
  110: 5550,
  112: 5560,
  114: 5570,
  116: 5580,
  118: 5590,
  120: 5600,
  122: 5610,
  124: 5620,
  126: 5630,
  128: 5640,
  132: 5660,
  134: 5670,
  136: 5680,
  138: 5690,
  140: 5700,
  142: 5710,
  144: 5720,
  149: 5745,
  151: 5755,
  153: 5765,
  155: 5775,
  157: 5785,
  159: 5795,
  161: 5805,
  165: 5825,
  169: 5845,
  173: 5865,
  183: 4915,
  184: 4920,
  185: 4925,
  187: 4935,
  188: 4940,
  189: 4945,
  192: 4960,
  196: 4980
};

export const chassisTypes = ['Other',
  'Unknown',
  'Desktop',
  'Low Profile Desktop',
  'Pizza Box',
  'Mini Tower',
  'Tower',
  'Portable',
  'Laptop',
  'Notebook',
  'Hand Held',
  'Docking Station',
  'All in One',
  'Sub Notebook',
  'Space-Saving',
  'Lunch Box',
  'Main System Chassis',
  'Expansion Chassis',
  'SubChassis',
  'Bus Expansion Chassis',
  'Peripheral Chassis',
  'Storage Chassis',
  'Rack Mount Chassis',
  'Sealed-Case PC',
  'Multi-System Chassis',
  'Compact PCI',
  'Advanced TCA',
  'Blade',
  'Blade Enclosure',
  'Tablet',
  'Convertible',
  'Detachable',
  'IoT Gateway ',
  'Embedded PC',
  'Mini PC',
  'Stick PC',
];
