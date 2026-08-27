import { PLATFORM, WINDOWS } from './const';
import type { CpuBrandObject } from './types';

const speaker = 'Speaker';
const microphone = 'Microphone';
const phone = 'Phone';

export const audioTypeLabel = (type: string, input = false, output = false) => {
  type = type.toLowerCase();
  switch (true) {
    case type.indexOf('input') >= 0:
      return microphone;
    case type.indexOf('display audio') >= 0:
      return speaker;
    case type.indexOf('speak') >= 0:
      return speaker;
    case type.indexOf('laut') >= 0:
      return speaker;
    case type.indexOf('loud') >= 0:
      return speaker;
    case type.indexOf('head') >= 0:
      return 'Headset';
    case type.indexOf('microp') >= 0:
      return microphone;
    case type.indexOf('phone') >= 0:
      return phone;
    case type.indexOf('mikr') >= 0:
      return microphone;
    case type.indexOf('controll') >= 0:
      return 'Controller';
    case type.indexOf('line o') >= 0:
      return 'Line Out';
    case type.indexOf('digital o') >= 0:
      return 'Digital Out';
    case type.indexOf('smart sound technology') >= 0:
      return 'Digital Signal Processor';
    case type.indexOf('high definition audio') >= 0:
      return 'Sound Driver';
    case output:
      return speaker;
    case input:
      return microphone;
    default:
      return '';
  }
};

export const audioDarwinChannelLabel = (str: string) => {
  switch (true) {
    case str.indexOf('builtin') >= 0:
      return 'Built-In';
    case str.indexOf('extern') >= 0:
      return 'Audio-Jack';
    case str.indexOf('hdmi') >= 0:
      return 'HDMI';
    case str.indexOf('displayport') >= 0:
      return 'Display-Port';
    case str.indexOf('usb') >= 0:
      return 'USB';
    case str.indexOf('pci') >= 0:
      return 'PCIe';
    default:
      return '';
  }
};

export const audioWindowsStatus = (statusInfo: number | string): string => {
  const status = typeof statusInfo === 'number' ? statusInfo : Number.parseInt(statusInfo, 10);
  switch (true) {
    case status === 1:
      return 'Other';
    case status === 2:
      return 'Unknown';
    case status === 3:
      return 'Enabled';
    case status === 4:
      return 'Disabled';
    case status === 5:
      return 'Not Applicable';
    default:
      return 'Unknown';
  }
};

export const bluetoothTypeLabel = (str: string) => {
  str = str.toLowerCase();
  switch (true) {
    case str.indexOf('keyboard') >= 0:
      return 'Keyboard';
    case str.indexOf('mouse') >= 0:
      return 'Mouse';
    case str.indexOf('trackpad') >= 0:
      return 'Trackpad';
    case str.indexOf('speaker') >= 0:
      return 'Speaker';
    case str.indexOf('headset') >= 0:
      return 'Headset';
    case str.indexOf('phone') >= 0:
      return 'Phone';
    case str.indexOf('macbook') >= 0:
      return 'Computer';
    case str.indexOf('imac') >= 0:
      return 'Computer';
    case str.indexOf('ipad') >= 0:
      return 'Tablet';
    case str.indexOf('watch') >= 0:
      return 'Watch';
    case str.indexOf('headphone') >= 0:
      return 'Headset';
    case str.indexOf('microph') >= 0:
      return 'Microphone';
    case str.indexOf('audio') >= 0:
      return 'Audio';
    case str.indexOf('sound') >= 0:
      return 'Audio';
    default:
      return '';
  }
};

export const bluetoothManufacturer = (str: string) => {
  const defaultValue = str.split(' ')[0];
  str = str.toLowerCase();
  switch (true) {
    case str.indexOf('apple') >= 0:
      return 'Apple';
    case str.indexOf('ipad') >= 0:
      return 'Apple';
    case str.indexOf('imac') >= 0:
      return 'Apple';
    case str.indexOf('iphone') >= 0:
      return 'Apple';
    case str.indexOf('magic mouse') >= 0:
      return 'Apple';
    case str.indexOf('magic trackpad') >= 0:
      return 'Apple';
    case str.indexOf('macbook') >= 0:
      return 'Apple';
    default:
      return defaultValue;
  }
};

export const manufacturedApple = (str: string) => {
  str = str.toLowerCase();
  switch (true) {
    case str.indexOf('apple') >= 0:
      return 'Apple';
    case str.indexOf('ipad') >= 0:
      return 'Apple';
    case str.indexOf('imac') >= 0:
      return 'Apple';
    case str.indexOf('iphone') >= 0:
      return 'Apple';
    case str.indexOf('magic mouse') >= 0:
      return 'Apple';
    case str.indexOf('magic trackpad') >= 0:
      return 'Apple';
    case str.indexOf('facetime') >= 0:
      return 'Apple';
    case str.indexOf('macbook') >= 0:
      return 'Apple';
    default:
      return '';
  }
};

export const usbLinuxType = (type: string, name: string) => {
  const str = (name + ' ' + type).toLowerCase();
  switch (true) {
    case str.indexOf('camera') >= 0:
      return 'Camera';
    case str.indexOf('hub') >= 0:
      return 'Hub';
    case str.indexOf('keybrd') >= 0:
      return 'Keyboard';
    case str.indexOf('keyboard') >= 0:
      return 'Keyboard';
    case str.indexOf('mouse') >= 0:
      return 'Mouse';
    case str.indexOf('stora') >= 0:
      return 'Storage';
    case str.indexOf('microp') >= 0:
      return microphone;
    case str.indexOf('headset') >= 0:
      return 'Audio';
    case str.indexOf('audio') >= 0:
      return 'Audio';
    default:
      return type;
  }
};

export const usbDarwinType = (name: string) => {
  name = name.toLowerCase();
  switch (true) {
    case name.indexOf('camera') >= 0:
      return 'Camera';
    case name.indexOf('touch bar') >= 0:
      return 'Touch Bar';
    case name.indexOf('controller') >= 0:
      return 'Controller';
    case name.indexOf('headset') >= 0:
      return 'Audio';
    case name.indexOf('trackpad') >= 0:
      return 'Trackpad';
    case name.indexOf('keyboard') >= 0:
      return 'Keyboard';
    case name.indexOf('sensor') >= 0:
      return 'Sensor';
    case name.indexOf('bthusb') >= 0:
      return 'Bluetooth';
    case name.indexOf('bth') >= 0:
      return 'Bluetooth';
    case name.indexOf('rfcomm') >= 0:
      return 'Bluetooth';
    case name.indexOf('usbhub') >= 0:
      return 'Hub';
    case name.indexOf(' hub') >= 0:
      return 'Hub';
    case name.indexOf('mouse') >= 0:
      return 'Mouse';
    case name.indexOf('microp') >= 0:
      return microphone;
    case name.indexOf('removable') >= 0:
      return 'Storage';
    default:
      return '';
  }
};

export const usbWindowsType = (creationclass: string, name: string) => {
  switch (true) {
    case name.indexOf('storage') >= 0:
      return 'Storage';
    case name.indexOf('speicher') >= 0:
      return 'Storage';
    case creationclass.indexOf('usbhub') >= 0:
      return 'Hub';
    case creationclass.indexOf('storage') >= 0:
      return 'Storage';
    case creationclass.indexOf('usbcontroller') >= 0:
      return 'Controller';
    case creationclass.indexOf('keyboard') >= 0:
      return 'Keyboard';
    case creationclass.indexOf('pointing') >= 0:
      return 'Mouse';
    case creationclass.indexOf('disk') >= 0:
      return 'Storage';
    default:
      return '';
  }
};

export const wifiVendor = (model: string) => {
  model = model.toLowerCase();
  switch (true) {
    case model.indexOf('intel') >= 0:
      return 'Intel';
    case model.indexOf('realtek') >= 0:
      return 'Realtek';
    case model.indexOf('qualcom') >= 0:
      return 'Qualcom';
    case model.indexOf('broadcom') >= 0:
      return 'Broadcom';
    case model.indexOf('cavium') >= 0:
      return 'Cavium';
    case model.indexOf('cisco') >= 0:
      return 'Cisco';
    case model.indexOf('marvel') >= 0:
      return 'Marvel';
    case model.indexOf('zyxel') >= 0:
      return 'Zyxel';
    case model.indexOf('melanox') >= 0:
      return 'Melanox';
    case model.indexOf('d-link') >= 0:
      return 'D-Link';
    case model.indexOf('tp-link') >= 0:
      return 'TP-Link';
    case model.indexOf('asus') >= 0:
      return 'Asus';
    case model.indexOf('linksys') >= 0:
      return 'Linksys';
    default:
      return '';
  }
};

export const getLogoFile = (distro = '') => {
  distro = distro || '';
  distro = distro.toLowerCase();
  switch (true) {
    case WINDOWS:
      return 'windows';
    case distro.indexOf('mac os') !== -1 || distro.indexOf('macos') !== -1:
      return 'apple';
    case distro.indexOf('arch') !== -1:
      return 'arch';
    case distro.indexOf('cachy') !== -1:
      return 'cachy';
    case distro.indexOf('centos') !== -1:
      return 'centos';
    case distro.indexOf('coreos') !== -1:
      return 'coreos';
    case distro.indexOf('debian') !== -1:
      return 'debian';
    case distro.indexOf('deepin') !== -1:
      return 'deepin';
    case distro.indexOf('elementary') !== -1:
      return 'elementary';
    case distro.indexOf('endeavour') !== -1:
      return 'endeavour';
    case distro.indexOf('fedora') !== -1:
      return 'fedora';
    case distro.indexOf('gentoo') !== -1:
      return 'gentoo';
    case distro.indexOf('mageia') !== -1:
      return 'mageia';
    case distro.indexOf('mandriva') !== -1:
      return 'mandriva';
    case distro.indexOf('manjaro') !== -1:
      return 'manjaro';
    case distro.indexOf('mint') !== -1:
      return 'mint';
    case distro.indexOf('mx') !== -1:
      return 'mx';
    case distro.indexOf('openbsd') !== -1:
      return 'openbsd';
    case distro.indexOf('freebsd') !== -1:
      return 'freebsd';
    case distro.indexOf('opensuse') !== -1:
      return 'opensuse';
    case distro.indexOf('pclinuxos') !== -1:
      return 'pclinuxos';
    case distro.indexOf('puppy') !== -1:
      return 'puppy';
    case distro.indexOf('popos') !== -1:
      return 'popos';
    case distro.indexOf('raspbian') !== -1:
      return 'raspbian';
    case distro.indexOf('reactos') !== -1:
      return 'reactos';
    case distro.indexOf('redhat') !== -1:
      return 'redhat';
    case distro.indexOf('slackware') !== -1:
      return 'slackware';
    case distro.indexOf('sugar') !== -1:
      return 'sugar';
    case distro.indexOf('steam') !== -1:
      return 'steam';
    case distro.indexOf('suse') !== -1:
      return 'suse';
    case distro.indexOf('mate') !== -1:
      return 'ubuntu-mate';
    case distro.indexOf('lubuntu') !== -1:
      return 'lubuntu';
    case distro.indexOf('xubuntu') !== -1:
      return 'xubuntu';
    case distro.indexOf('ubuntu') !== -1:
      return 'ubuntu';
    case distro.indexOf('solaris') !== -1:
      return 'solaris';
    case distro.indexOf('tails') !== -1:
      return 'tails';
    case distro.indexOf('feren') !== -1:
      return 'ferenos';
    case distro.indexOf('robolinux') !== -1:
      return 'robolinux';
    default:
      return PLATFORM;
  }
};

const WINDOWS_RELEASES: [number, string][] = [
  [26200, '25H2'],
  [26100, '24H2'],
  [22631, '23H2'],
  [22621, '22H2'],
  [19045, '22H2'],
  [22000, '21H2'],
  [19044, '21H2'],
  [19043, '21H1'],
  [19042, '20H2'],
  [19041, '2004'],
  [18363, '1909'],
  [18362, '1903'],
  [17763, '1809'],
  [17134, '1803']
];

export const getWindowsRelease = (build: number) => {
  for (const [minBuild, label] of WINDOWS_RELEASES) {
    if (build >= minBuild) return label;
  }
  return '';
};

export const JEDEV_RAM_manufacturers: { [index: string]: any } = {
  'A Force': ['7F7F7F7F7F7F7F02', '7F7F7F6DFFFFFFFF'],
  ADATA: ['04CB', '7F7F7F7FCB000000'],
  Aeneon: ['7F7F7F7F7F570000'],
  AMD: ['80010000830B'],
  'Apacer Technology Inc.': ['017A', '7F7A', '7A01', 'APACER'],
  ASint: ['06C1', 'c106', '7F7F7F7F7F7FC100'],
  ATP: ['86E3'],
  'A-TECH': ['0080000080AD'],
  Avant: ['7F7F7F7F7FF70000', '85F7', 'F705'],
  Carry: ['070E'],
  Catalyst: ['314F000000000000'],
  Centon: ['7F7F7F1900000000'],
  CFD: ['0770000080AD'],
  CSX: ['855D', '7F7F7F7F7F5D0000'],
  Corsair: ['029E', '0215', '9E02', '7F7F9E0000000000', '009C36160000'],
  Crucial: [
    '1315',
    '059B',
    '859B',
    '9B85',
    '9B05',
    '0D9B',
    '09B8',
    '7F7F7F7F7F9B0000',
    '7F7F7F7F7F9BFFFF',
    '0000000000009B85',
    '859<',
    '009D36160000',
    '009C2B0C0000',
    '9B000D1000000000',
    'F7F7F7F7F7B90000',
    '9B'
  ],
  'Dane-Elec': ['7FDA'],
  DERLAR: ['8AA2'],
  Elpida: ['00FE', '01FE', '02FE', 'FE02', '7F7FFE0000000000', '0000000000FE7F7F', '000000000000FE02', '000000000FE02'],
  Essencore: ['0898000080AD'],
  EUDAR: ['847C'],
  EVGA: ['08D9'],
  Foxline: ['88F2', '8ABA'],
  'G-Alantic': ['08F7'],
  'G.Skill International Enterprise': ['04CD', 'CD04', '7F7F7F7FCD000000', '04=>', '=>04', 'EC9D0B160000', 'G-SKILL', 'G.SKILL'],
  GIGABYTE: ['89F2'],
  'Golden Empire': ['7F7F7F1300000000', '8A45', '8313000080AD'],
  Goldenmars: ['7F7F7F7F7F620000'],
  GOODRAM: ['075D', '7F7F7F7F7F7F7F5D', '5D07'],
  Infineon: ['C100', 'C10', 'C1494E46494E454F'],
  Innodisk: ['86F1'],
  Itaucom: ['7F7F310000000000'],
  Hexon: ['7F7F7F7F7FDC0000'],
  'High Bridge': ['07E9'],
  Hikvision: ['0B2C'],
  'Hynix Semiconductor Inc.': [
    '00AD',
    '00DA',
    'DA00',
    '6F2B',
    '80AD',
    'AD00',
    'ADFF',
    'AD01',
    'AD80',
    '000000000000AD80',
    '00000000000000AD',
    'AD0',
    'DA0',
    '0AD8',
    '009C35230000',
    '009C2B160000',
    '0000AD010000',
    '0000000080AD',
    '08CD',
    '2E0400000000',
    '80AD',
    'HYNIX'
  ],
  KANMEIQi: ['0B29'],
  KINGBOX: ['7F7F7F7F51000000'],
  KingFast: ['897A'],
  Kingmax: ['7F7F7F2500000000', '7F7F7F2500000000', '8325000080AD', '83250000830B'],
  Kingston: ['0198', '7F98', '9804', 'F789', '9806', '9805', '00000B160000', '009C162D0000', '009C23240000'],
  KingTiger: ['7F7F7F7F7F7F7F10'],
  Kllisre: ['89C2'],
  Kreton: ['85E3', '7F7F7F7F7FE30000'],
  Lexar: ['8A76', '8A7600000000', '8A7600008A76'],
  MAXSUN: ['89A2'],
  'MCI Computer': ['7F7F640000000000'],
  Melco: ['7F7F7F8300000000'],
  'Micron Technology Inc.': [
    '002C',
    '00C2',
    '802C',
    '857F',
    '878A',
    '2C00',
    'C200',
    '2CFF',
    '2C80',
    '2C0',
    'C20',
    '2C',
    '08D0',
    '009C162C0000',
    'FFFFFFFFFFFFFF2C',
    '0000000000002C80',
    '0000000002C80',
    '2C080905DF3FF327',
    '2C1600000000',
    '00002C0F0000',
    'MICRON'
  ],
  Mougol: ['4B0', '4B00000000000000'],
  MTASE: ['8AAE'],
  Multilaser: ['08B6'],
  Nanya: ['830B', '030B', '0B83', '0B0D', '7F7F7F0B000000', '7F7F7F0B00000000', 'F7F7F7B000000000', '0000000000000B83'],
  Netlist: ['7F7F7F1600000000'],
  OCZ: ['84B0', '7F7F7F7FB0000000'],
  Patriot: ['4D41', '8502', '7F7F7F7F7F020000'],
  Pioneer: ['0B89'],
  PNY: ['01BA', '7FBA', 'BA01'],
  'Positivo Informatica': ['7F7F7F7F16000000'],
  pqi: ['853E', '7F7F7F7F7F3E0000'],
  PRINCETON: ['7F7F7F8A00000000'],
  PUSKILL: ['8AAD'],
  'Qimonda AG i. In.': ['7F7F7F7F7F510000', '5145', 'F7F7F7F7F7150000', '80C1', '85517FB38551', '855180B38551', '5105', '8551', 'QIMONDA'],
  Qumo: ['02B5'],
  Ramaxel: ['7F7F7F7F43000000', '0443', '04430000802C', '7F7F7F7F7F000000', '000000437F7F7F7F'],
  Reboto: ['0080000080CE'],
  'Samsung Electronics Inc.': [
    'EC00',
    '00CE',
    '80CE',
    '00EC',
    'CE00',
    'CE80',
    '0CE',
    'EC0',
    'CE0',
    '000000000000CE80',
    'CE80',
    'CE30',
    '00000000000000CE',
    'CE01',
    '009C360B0000',
    '0000CE020000',
    '009C0B160000',
    '09B0',
    '090D',
    '000000000CE80',
    '7F7F7F7F3B000000',
    'SAMSUNG'
  ],
  SanMax: ['86E9'],
  SemsoTai: ['09C8'],
  Sesame: ['0B13'],
  'Silicon Power': ['86D3', '7F7F7F7F7F7FD300'],
  SiS: ['7F7F7F7F7F7FA800'],
  Smart: ['7F94', '000000000000947F', '0194000080CE'],
  'Smart Modular': ['019400000A00'],
  'Super Talent': ['004D415500000000', '8634000082B5', '7F7F7F7F7F7F3400'],
  Swissbit: ['7F7F7FDA00000000'],
  TakeMS: ['7F7F7F5800000000', '7F7F7F58FFFFFFFF'],
  Team: ['04EF', 'EF04', '7F7F7F7FEF000000'],
  Teikon: ['079E', '9E07'],
  Textorm: ['8C97'],
  TIMETEC: ['8C26'],
  'Transcend Information Inc.': ['014F', '7F4F', 'TRANSCEND'],
  TwinMOS: ['866B', '066B'],
  Unifosa: ['0707000002FE'],
  Unigen: ['7FCE'],
  Uroad: ['07DC'],
  Veineda: ['89D0'],
  'V-Color': ['066D'],
  'V-GeN': ['0A94', '8A94'],
  'Walton Chaintech': ['05D6', '7F7F7F7F7FD60000']
};

export const getMemManufacturer = (manId: string) => {
  const manIdSearch = manId.replace('0x', '').toUpperCase();
  let result = manId;
  const keys = Object.keys(JEDEV_RAM_manufacturers);
  for (let i = 0; i < keys.length; i++) {
    if (JEDEV_RAM_manufacturers[keys[i]].includes(manIdSearch)) {
      result = keys[i];
      break;
    }
  }
  return result;
};

export const raspberryClockSpeed: { [index: string]: any } = {
  '0': 400,
  '1': 450,
  '2': 450,
  '3': 3200,
  '4': 4267
};

export const winPrinterStatus: { [index: string]: any } = {
  1: 'Other',
  2: 'Unknown',
  3: 'Idle',
  4: 'Printing',
  5: 'Warmup',
  6: 'Stopped Printing',
  7: 'Offline'
};

const AMDBaseFrequencies = {
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
  V1500B: '2.2',
  V1780B: '3.35',
  V1202B: '2.3',
  V1404I: '2.0',
  V1605B: '2.0',
  V1756B: '3.25',
  V1807B: '3.35',

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

  '7773X': '2.2',
  '7763': '2.45',
  '7713': '2.0',
  '7713P': '2.0',
  '7663': '2.0',
  '7643': '2.3',
  '7573X': '2.8',
  '75F3': '2.95',
  '7543': '2.8',
  '7543P': '2.8',
  '7513': '2.6',
  '7473X': '2.8',
  '7453': '2.75',
  '74F3': '3.2',
  '7443': '2.85',
  '7443P': '2.85',
  '7413': '2.65',
  '7373X': '3.05',
  '73F3': '3.5',
  '7343': '3.2',
  '7313': '3.0',
  '7313P': '3.0',
  '72F3': '3.7',

  // ZEN3
  '5600X': '3.7',
  '5800X': '3.8',
  '5900X': '3.7',
  '5950X': '3.4',
  '5945WX': '4.1',
  '5955WX': '4.0',
  '5965WX': '3.8',
  '5975WX': '3.6',
  '5995WX': '2.7',

  '7960X': '4.2',
  '7970X': '4.0',
  '7980X': '3.2',

  '7965WX': '4.2',
  '7975WX': '4.0',
  '7985WX': '3.2',
  '7995WX': '2.5',

  // ZEN4
  '9754': '2.25',
  '9754S': '2.25',
  '9734': '2.2',
  '9684X': '2.55',
  '9384X': '3.1',
  '9184X': '3.55',
  '9654P': '2.4',
  '9654': '2.4',
  '9634': '2.25',
  '9554P': '3.1',
  '9554': '3.1',
  '9534': '2.45',
  '9474F': '3.6',
  '9454P': '2.75',
  '9454': '2.75',
  '9374F': '3.85',
  '9354P': '3.25',
  '9354': '3.25',
  '9334': '2.7',
  '9274F': '4.05',
  '9254': '2.9',
  '9224': '2.5',
  '9174F': '4.1',
  '9124': '3.0',

  // Epyc 4th gen
  '4124P': '3.8',
  '4244P': '3.8',
  '4344P': '3.8',
  '4364P': '4.5',
  '4464P': '3.7',
  '4484PX': '4.4',
  '4564P': '4.5',
  '4584PX': '4.2',
  '8024P': '2.4',
  '8024PN': '2.05',
  '8124P': '2.45',
  '8124PN': '2.0',
  '8224P': '2.55',
  '8224PN': '2.0',
  '8324P': '2.65',
  '8324PN': '2.05',
  '8434P': '2.5',
  '8434PN': '2.0',
  '8534P': '2.3',
  '8534PN': '2.0',

  // Epyc 5th gen
  '9115': '2.6',
  '9135': '3.65',
  '9175F': '4.2',
  '9255': '3.25',
  '9275F': '4.1',
  '9335': '3.0',
  '9355P': '3.55',
  '9355': '3.55',
  '9375F': '3.8',
  '9365': '3.4',
  '9455P': '3.15',
  '9455': '3.15',
  '9475F': '3.65',
  '9535': '2.4',
  '9555P': '3.2',
  '9555': '3.2',
  '9575F': '3.3',
  '9565': '3.15',
  '9655P': '2.5',
  '9655': '2.5',
  '9755': '2.7',
  '4245P': '3.9',
  '4345P': '3.8',
  '4465P': '3.4',
  '4545P': '3.0',
  '4565P': '4.3',
  '4585PX': '4.3',
  '5900XT': '3.3',
  '5900': '3.0',
  '5945': '3.0',
  '5800X3D': '3.4',
  '5800XT': '3.8',
  '5800': '3.4',
  '5700X3D': '3.0',
  '5700X': '3.4',
  '5845': '3.4',
  '5600X3D': '3.3',
  '5600XT': '3.7',
  '5600T': '3.5',
  '5600': '3.5',
  '5600F': '3.0',
  '5645': '3.7',
  '5500X3D': '3.0',
  '5980HX': '3.3',
  '5980HS': '3.0',
  '5900HX': '3.3',
  '5900HS': '3.0',
  '5800H': '3.2',
  '5800HS': '2.8',
  '5800U': '1.9',
  '5600H': '3.3',
  '5600HS': '3.0',
  '5600U': '2.3',
  '5560U': '2.3',
  '5400U': '2.7',
  '5825U': '2.0',
  '5625U': '2.3',
  '5425U': '2.7',
  '5125C': '3.0',
  '7730U': '2.0',
  '7530U': '2.0',
  '7430U': '2.3',
  '7330U': '2.3',
  '7203': '2.8',
  '7303': '2.4',
  '7663P': '2.0',
  '6980HX': '3.3',
  '6980HS': '3.3',
  '6900HX': '3.3',
  '6900HS': '3.3',
  '6800H': '3.2',
  '6800HS': '3.2',
  '6800U': '2.7',
  '6600H': '3.3',
  '6600HS': '3.3',
  '6600U': '2.9',
  '7735HS': '3.2',
  '7735H': '3.2',
  '7736U': '2.7',
  '7735U': '2.7',
  '7435HS': '3.1',
  '7435H': '3.1',
  '7535HS': '3.3',
  '7535H': '3.3',
  '7535U': '2.9',
  '7235HS': '3.2',
  '7235H': '3.2',
  '7335U': '3.0',
  '270': '4.0',
  '260': '3.8',
  '250': '3.3',
  '240': '4.3',
  '230': '3.5',
  '220': '3.0',
  '210': '2.8',
  '8945HS': '4.0',
  '8845HS': '3.8',
  '8840HS': '3.3',
  '8840U': '3.3',
  '8645HS': '4.3',
  '8640HS': '3.5',
  '8640U': '3.5',
  '8540U': '3.0',
  '8440U': '2.8',
  '9950X3D': '4.3',
  '9950X': '4.3',
  '9900X3D': '4.4',
  '9900X': '4.4',
  '9800X3D': '4.7',
  '9700X': '3.8',
  '9700F': '3.8',
  '9600X': '3.9',
  '9600': '3.8',
  '9500F': '3.8',
  '9995WX': '2.5',
  '9985WX': '3.2',
  '9975WX': '4.0',
  '9965WX': '4.2',
  '9955WX': '4.5',
  '9945WX': '4.7',
  '9980X': '3.2',
  '9970X': '4.0',
  '9960X': '4.2',
  'PRO HX375': '2.0',
  HX375: '2.0',
  'PRO HX370': '2.0',
  HX370: '2.0',
  '365': '2.0',
  'PRO 360': '2.0',
  '350': '2.0',
  'PRO 350': '2.0',
  '340': '2.0',
  'PRO 340': '2.0',
  '330': '2.0',
  '395': '3.0',
  'PRO 395': '3.0',
  '390': '3.2',
  'PRO 390': '3.2',
  '385': '3.6',
  'PRO 385': '3.6',
  'PRO 380': '3.6',
  '9955HX3D': '2.3',
  '9955HX': '2.5',
  '9850HX': '3.0',
  '9015': '3.6',
  '9965': '2.25',
  '9845': '2.1',
  '9825': '2.2',
  '9745': '2.4',
  '9645': '2.3'
};

const socketTypesByName = {
  // INTEL
  LGA1150:
    'e3-1230 e3-1231 g1820 g3220 g3240 g3250 g3258 g3420 i3-4130 i3-4130t i3-4150 i3-4160 i3-4160t i3-4170 i3-4330 i3-4330te i3-4340 i3-4340te i3-4360 i5-4430 i5-4430 i5-4430s i5-4440 i5-4440 i5-4440s i5-4460 i5-4460 i5-4460s i5-4460t i5-4570 i5-4570 i5-4570s i5-4570s i5-4570t i5-4570t i5-4570te i5-4590 i5-4590 i5-4590s i5-4590s i5-4590t i5-4590t i5-4670 i5-4670 i5-4670k i5-4670k i5-4670s i5-4670t i5-4690 i5-4690 i5-4690k i5-4690k i5-4690s i5-4690t i5-5675c i7-4765t i7-4770 i7-4770 i7-4770k i7-4770k i7-4770s i7-4770s i7-4770t i7-4770te i7-4771 i7-4771 i7-4785t i7-4790 i7-4790 i7-4790k i7-4790k i7-4790s i7-4790s i7-4790t i7-5775c i7-5775c',

  LGA1151:
    'e-2224 e-2288g e3-1270 e3-1270 e3-1270 g3900 g3900te g3930 g4400 g4560 g4600 g4900 g4930 g5400 g5420 g5500 i3-6098p i3-6100 i3-6100t i3-6100te i3-6300 i3-6300t i3-6320 i3-7100 i3-7100t i3-7101e i3-7101te i3-7300 i3-7300t i3-7320 i3-7350k i3-8100 i3-8100f i3-8100t i3-8300 i3-8300t i3-8350k i3-8350k i3-9100 i3-9100e i3-9100f i3-9100t i3-9100te i3-9300 i3-9300t i3-9320 i3-9350k i3-9350kf i5-6400 i5-6400t i5-6402p i5-6500 i5-6500t i5-6500te i5-6600 i5-6600k i5-6600t i5-7400 i5-7400t i5-7500 i5-7500t i5-7600 i5-7600k i5-7600t i5-8400 i5-8400t i5-8500 i5-8500t i5-8600 i5-8600k i5-8600t i5-9400 i5-9400f i5-9400t i5-9500 i5-9500e i5-9500f i5-9500t i5-9500te i5-9600 i5-9600k i5-9600kf i5-9600t i7-6700 i7-6700k i7-6700t i7-7700 i7-7700k i7-7700t i7-8086k i7-8700 i7-8700k i7-8700t i7-9700 i7-9700e i7-9700f i7-9700k i7-9700kf i7-9700t i7-9700te i9-9900 i9-9900k i9-9900kf i9-9900ks i9-9900t t4400 t4500',

  LGA1155:
    'e3-1220 e3-1220l e3-1225 e3-1230 e3-1235 e3-1240 e3-1245 e3-1260l e3-1265l e3-1270 e3-1275 e3-1280 e3-1290 g1610 g1610t g1620 g1620t g1630 g2010 g2020 g2020t g2030 g2030t g2100t g2120 g2120t g2130 g2140 g440 g460 g465 g470 g530 g530t g540 g540t g550 g550t g555 g620 g620t g622 g630 g630t g632 g640 g640t g645 g645t g840 g850 g860 g860t g870 i3-2100 i3-2100t i3-2102 i3-2105 i3-2120 i3-2120t i3-2125 i3-2130 i3-3210 i3-3220 i3-3220t i3-3225 i3-3240 i3-3240t i3-3245 i3-3250 i3-3250t i5-2300 i5-2310 i5-2320 i5-2380p i5-2390t i5-2400 i5-2400s i5-2405s i5-2450p i5-2500 i5-2500k i5-2500s i5-2500t i5-2550k i5-3330 i5-3330s i5-3335s i5-3340 i5-3340s i5-3350p i5-3450 i5-3450s i5-3470 i5-3470s i5-3470t i5-3475s i5-3550 i5-3550s i5-3570 i5-3570k i5-3570s i5-3570t i7-2600 i7-2600k i7-2600s i7-2700k i7-3770 i7-3770k i7-3770s i7-3770t',

  LGA1156: 'i5-650 i5-655k i5-660 i5-661 i5-670 i5-680 i5-750 i5-750s i5-760 i7-860 i7-860s i7-870 i7-870s i7-875k i7-880',

  LGA1200:
    'g5900 g5900t g5905 g5905t g5920 g5925 g6400 g6400t g6500 g6500t g6600 i3-10100 i3-10100 i3-10100e i3-10100f i3-10100t i3-10100te i3-10105 i3-10105f i3-10105t i3-10300 i3-10300t i3-10305 i3-10305t i3-10320 i3-10325 i5-10400 i5-10400f i5-10400t i5-10500 i5-10500e i5-10500t i5-10500te i5-10600 i5-10600k i5-10600kf i5-10600t i5-11400 i5-11400f i5-11400t i5-11500 i5-11500t i5-11600 i5-11600k i7-10700 i7-10700e i7-10700f i7-10700k i7-10700kf i7-10700t i7-10700te i7-11700 i7-11700f i7-11700k i7-11700kf i7-11700t i9-10090k i9-10090kf i9-10850k i9-10900 i9-10900e i9-10900f i9-10900k i9-10900kf i9-10900t i9-10900te i9-10910 i9-11900 i9-11900f i9-11900k i9-11900kf i9-11900t',

  LGA1700:
    'i3-12100 i3-12100e i3-12100f i3-12100t i3-12100te i3-1215ul i3-12300 i3-12300t i3-13100 i3-13100e i3-13100f i3-13100t i5-12400 i5-12400f i5-12400t i5-12490f i5-12500 i5-12500t i5-12600 i5-12600k i5-12600kf i5-12600t i5-13400 i5-13400f i5-13400t i5-13500 i5-13500t i5-13600 i5-13600k i5-13600kf i5-13600t i7-12700 i7-12700f i7-12700k i7-12700kf i7-12700t i7-13700 i7-13700f i7-13700k i7-13700kf i7-13700t i9-12900 i9-12900f i9-12900k i9-12900kf i9-12900ks i9-12900t i9-13900 i9-13900f i9-13900k i9-13900kf i9-13900ks i9-13900t i5-14600k i7-14700k i9-14900k',

  LGA2066:
    'i5-7640x i7-7800x i7-7820x i7-9800x i9-7900x i9-7920x i9 7940x i9 7960x i9 7980xe i9-9820x i9-9900x i9-9920x i9-9940x i9-9960x i9-9980xe i9-9990xe i9-10900x i9-10920x i9-10940x i9-10980xe',

  LGA1366: 'i7-920 i7-930 i7-940 i7-950 i7-960 i7-965 i7-975 i7-970 i7-980 i7-980x i7-990x',

  LGA2011: 'i7-3820 i7-3930k i7-3960x i7-3970x i7-4820k i7-4930k i7-4960x',

  'LGA2011-3': 'i7-5820k i7-5930k i7-5960x i7-6800k i7-6850k i7-6900k i7-6950x',

  BGA1023:
    'i3-2310e i3-2310m i3-2340ue i3-2357m i3-2365m i3-2367m i3-2377m i3-3120me i3-3120me i3-3217u i3-3217ue i3-3217ue i3-3227u i3-3229y i5-2415m i5-2435m i5-2467m i5-2537m i5-2557m i5-3317u i5-3337u i5-3339y i5-3427u i5-3437u i5-3439y i7-2610ue i7-2617m i7-2620m i7-2629m i7-2637m i7-2640m i7-2649m i7-2655le i7-2657m i7-2677m i7-2715qe i7-3517u i7-3517ue i7-3520m i7-3537u i7-3540m i7-3555le i7-3612qe i7-3615qe i7-3667u i7-3687u i7-3689y',

  BGA1168:
    'i3-4005u i3-4010u i3-4010y i3-4012y i3-4020y i3-4025u i3-4030u i3-4030y i3-4100u i3-4120u i3-4158u i3-5005u i3-5010u i3-5015u i3-5020u i3-5157u i5-4200u i5-4200y i5-4202y i5-4210u i5-4210y i5-4220y i5-4250u i5-4258u i5-4260u i5-4278u i5-4288u i5-4300u i5-4300y i5-4302y i5-4308u i5-4310u i5-4350u i5-4360u i5-5200u i5-5250u i5-5257u i5-5287u i5-5300u i5-5350u i7-4500u i7-4510u i7-4550u i7-4558u i7-4578u i7-4600u i7-4610y i7-4650u i7-5500u i7-5550u i7-5557u i7-5600u i7-5650u',

  BGA1224: 'i7-2635qm i7-2675qm i7-2720qm i7-2760qm i7-2820qm i7-2860qm i7-3612qm i7-3615qm i7-3632qm i7-3635qm i7-3720qm i7-3740qm i7-3820qm i7-3840qm',

  BGA1234: 'm-5y10 m-5y10a m-5y10c m-5y31 m-5y51 m-5y70 m-5y71',

  BGA1284: 'i3-2115c i3-3115c',

  BGA1288:
    'i3-330e i3-330m i3-330um i3-350m i3-380um i5-460m i5-470um i5-480m i5-520e i5-520m i5-520um i5-540m i5-540um i5-560m i5-560m i5-580m i7-610e i7-610e i7-620le i7-620le i7-620lm i7-620lm i7-620m i7-620ue i7-620um i7-640lm i7-640m i7-640um i7-660lm i7-660ue i7-660um i7-680um',

  BGA1344: 'i5-1030g4 i5-1030g7 i5-1030ng7 i5-1038ng7 i7-1068ng7',

  BGA1356:
    'i3-6006u i3-6100u i3-6157u i3-6167u i3-7020u i3-7100u i3-7130u i3-7167u i3-8130u i5-6198du i5-6200u i5-6260u i5-6267u i5-6287u i5-6300u i5-6360u i5-7200u i5-7260u i5-7267u i5-7287u i5-7300u i5-7360u i5-8250u i5-8350u i7-6498du i7-6500u i7-6560u i7-6567u i7-6600u i7-6650u i7-6660u i7-7500u i7-7500u i7-7500u i7-7560u i7-7567u i7-7600u i7-7660u i7-8550u i7-8650u',

  BGA1364:
    'i3-4100e i3-4100e i3-4102e i3-4102e i3-4110e i3-4110e i3-4112e i3-4112e i5-4200h i5-4210h i5-4400e i5-4402e i5-4402ec i5-4410e i5-4422e i5-5350h i7-4700ec i7-4700eq i7-4700hq i7-4701eq i7-4702ec i7-4702hq i7-4710hq i7-4712hq i7-4720hq i7-4722hq i7-4750hq i7-4760hq i7-4770hq i7-4850eq i7-4850hq i7-4860eq i7-4860hq i7-4870hq i7-4950hq i7-4960hq i7-4980hq i7-5700eq i7-5700hq i7-5750hq i7-5850eq i7-5850hq i7-5950hq i5-4570r i5-4670r i5-5575r i5-5675r i7-4770r i7-5775r',

  BGA1377: 'i3-10100y i3-10110y i5-10210y i5-10310y i7-10510y',

  BGA1440:
    'i3-6100e i3-6100e i3-6100h i3-6102e i3-6102e i3-7100e i3-7100e i3-7100h i3-7102e i3-7102e i3-8100b i3-8100h i3-9100hl i3-9100hl i5-10200h i5-10300h i5-10400h i5-10500h i5-6300hq i5-6350hq i5-6440eq i5-6440hq i5-6442eq i5-7300hq i5-7440eq i5-7440hq i5-7442eq i5-8300h i5-8400b i5-8400h i5-8500b i5-9300h i5-9400h i7-10750h i7-10850h i7-10870h i7-10875h i7-6700hq i7-6700hq i7-6770hq i7-6820eq i7-6820hk i7-6820hq i7-6822eq i7-6870hq i7-6920hq i7-6970hq i7-7700hq i7-7820eq i7-7820hk i7-7820hq i7-7920hq i7-8700b i7-8750h i7-8850h i7-9750h i7-9750h i7-9750hf i7-9850h i7-9850he i7-9850hl i9-10885h i9-10980hk i9-8950hk i9-9980h i9-9980hk i5-6585r i5-6685r',

  BGA1449:
    'i3-1115g4 i3-1115g4e i3-1115g4e i3-1115gre i3-1115gre i3-1125g4 i5-11300h i5-1135g7 i5-1145g7 i5-1145g7e i5-1145gre i7-11370h i7-11375h i7-11390h i7-1165g7 i7-1165g7 i7-1165g7 i7-1185g7 i7-1185g7 i7-1185g7e i7-1185g7e i7-1185gre i7-1185gre i7-1195g7',

  BGA1515: 'i5-7y54 i5-7y57 i5-8200y i5-8210y i5-8310y i7-7y75 i7-7y75 i7-7y75 i7-8500y i7-8510y m3-6y30 m3-7y30 m3-7y32 m3-8100y m5-6y54 m5-6y57 m7-6y75',

  BGA1526: 'i3-1000g1 i3-1000g4 i3-1005g1 i5-1035g1 i5-1035g4 i5-1035g7 i7-1060g7 i7-1065g7',

  BGA1528:
    'i3-10110u i3-8109u i3-8121u i3-8145u i3-8145ue i3-8145ue i5-10210u i5-10310u i5-8257u i5-8259u i5-8265u i5-8269u i5-8279u i5-8365u i5-8365ue i7-10510u i7-10610u i7-10610u i7-10710u i7-10710u i7-10810u i7-10810u i7-8557u i7-8559u i7-8565u i7-8565u i7-8569u i7-8665u i7-8665ue',

  BGA1598: 'i3-1110g4 i3-1120g4 i5-1130g7 i5-1140g7 i7-1160g7 i7-1160g7 i7-1180g7 i7-1180g7',

  BGA1744:
    'i3-1210u i3-1215u i3-1215ue i3-1220p i3-1220pe i3-12300he i3-12300hl i3-1305u i3-1315u i3-1315ue i3-1320pe i3-13300he i5-1235u i5-1240p i5-1240u i5-12450h i5-1245u i5-12500h i5-1250p i5-12600h i5-1334u i5-1335u i5-1340p i5-13420h i5-1345u i5-13500h i5-1350p i5-13600h i7-1255u i7-1260p i7-1260u i7-12650h i7-1265u i7-12700h i7-1270p i7-12800h i7-1280p i7-1355u i7-1360p i7-13620h i7-1365u i7-13700h i7-1370p i7-13800h i9-12900h i9-12900hk i9-13900h i9-13900hk',

  BGA1781: 'i5-1230u i7-1250u',

  BGA1787: 'i3-11100he i7-11800h i7-11850h i9-11900h i9-11900kb i9-11950h i9-11980hk',

  BGA1792: 'i7-13705h i9-13905h',

  BGA1964: 'i5-12450hx i5-12600hx i5-13450hx i5-13500hx i5-13600hx i7-12650hx i7-12800hx i7-12850hx i7-13650hx i7-13700hx i7-13850hx i9-12900hx i9-12950hx i9-13900hx i9-13950hx i9-13980hx',

  BGA2270: 'i5-8305g i7-8705g i7-8705g i7-8706g i7-8706g i7-8706g i7-8706g i7-8709g i7-8709g i7-8809g i7-8809g',

  CSP1016: 'i3-l13g4 i5-l16g7',

  PGA946:
    'i3-4000m i3-4100m i3-4110m i5-4200m i5-4210m i5-4300m i5-4310m i5-4330m i5-4340m i7-4600m i7-4610m i7-4700mq i7-4702mq i7-4710mq i7-4712mq i7-4800mq i7-4810mq i7-4900mq i7-4910mq i7-4930mx i7-4940mx',

  PGA988: 'i3-2330e i3-370m i3-380m i3-390m i5-430m i5-450m i7-620m i7-620m i7-640m i7-720qm i7-740qm i7-820qm i7-840qm i7-920xm i7-940xm',

  PGA988B:
    'i3-2312m i3-2312m i3-2330m i3-2348m i3-2350m i3-2370m i3-3110m i3-3120m i3-3130m i5-2410m i5-2430m i5-2450m i5-2510e i5-2515e i5-2520m i5-2540m i5-3210m i5-3230m i5-3320m i5-3340m i5-3360m i5-3380m i5-3610me i7-2620m i7-2630qm i7-2640m i7-2670qm i7-2710qe i7-2720qm i7-2760qm i7-2820qm i7-2860qm i7-2920xm i7-2960xm i7-3520m i7-3540m i7-3610qe i7-3610qm i7-3612qm i7-3630qm i7-3632qm i7-3720qm i7-3740qm i7-3820qm i7-3840qm i7-3920xm i7-3920xm i7-3940xm',

  // AMD

  AM4: '1200 1200af 1300x 1400 1500x 1600 1600af 1600x 1700 1700x 1800x 2200g 2200ge 2300x 2400g 2400ge 2500x 2600 2600e 2600x 2700 2700e 2700x 3100 3200g 3200ge 3300x 3400g 3500 3500x 3600 3600x 3600xt 3700x 3800x 3800xt 3900 3900x 3900xt 3950x 4100 4300g 4300ge 4500 4600g 4600ge 4700g 4700ge 4700s 5100 5300g 5300ge 5500 5600 5600g 5600ge 5600x 5600x3d 5700 5700g 5700ge 5700x 5800 5800x 5800x3d 5900 5900x 5950x pro1200 pro1300 pro1500 pro1600 pro1700 pro1700x pro2100ge pro3200g pro3200ge pro3350g pro3350ge pro3400g pro3400ge pro5645 pro5845 pro5945',

  AM5: '7500f 7600 7600x 7700 7700x 7800x3d 7900 7900x 7900x3d 7950x 7950x3d pro7645 pro7745 pro7945',

  FL1: '7645hx 7745hx 7845hx 7945hx',

  FP5: '2200u 2300u 2500u 2600h 2700u 2800h 3200u 3250c 3250u 3300u 3350u 3450u 3500c 3500u 3550h 3580u 3700c 3700u 3750h 3780u',

  FP6: '7330u 7530u 7730u pro7330u pro7530u pro7730u 4300u 4500u 4600h 4600hs 4600u 4680u 4700u 4800h 4800hs 4800u 4900h 4900hs 4980u 5125c 5300u 5400u  5425u 5500u 5560u 5600h 5600hs 5600u 5625u 5700u 5800h 5800hs 5800u 5825u 5900hs 5900hx 5980hs 5980hx 7320u 7520u',

  FP7: '7640hs 7840hs 7940hs 6600h 6600hs 6600u 6800h 6800hs 6800u 6900hs 6900hx 6980hs 6980hx 7335u 7440u 7535hs 7535u 7540u 7640h 7640u 7735hs 7735u 7736u 7840h 7840u 7940h',

  SP3: '7601 7232p 7251 7252 7261 7262 7272 7281 7282 72f3 7301 7302 7302p 7313 7313p 7343 7351 7351p 7352 7371 7373x 73f3 7401 7401p 7402 7402p 7413 7443 7443p 7451 7452 7453 7473x 74f3 7501 7502 7502p 7513 7532 7542 7543 7543p 7551 7551p 7552 7571 7573x 75f3 7642 7643 7662 7663 7702 7702p 7713 7713p 7742 7763 7773x 7f32 7f52 7f72 7h12',

  SP4: '3351 3451',
  SP4r2: '3101 3151 3201 3251 3255 3301 3401',

  SP5: '9124 9174f 9184x 9224 9254 9274f 9334 9354 9354p 9374f 9384x 9454 9454p 9474f 9534 9554 9554p 9634 9654 9654p 9684x 9734 9754 9754s',

  sTRX4: '3960x 3970x 3990x',

  sWRX8: '3945wx 3955wx 3975wx 3995wx 5945wx 5955wx 5965wx 5975wx 5995wx',

  TR4: '1900x 1920x 1950x 2920x 2950x 2970wx 2990wx'
};

export const getSocketTypesByName = (str: string) => {
  str = str.toLowerCase();
  let result = '';
  let key: keyof typeof socketTypesByName;
  for (key in socketTypesByName) {
    const names = socketTypesByName[key].split(' ');
    names.forEach((element: string) => {
      if (str.indexOf(element) >= 0) {
        result = key;
      }
    });
  }
  return result;
};

export const cpuManufacturer = (str: string) => {
  const dafaults = str;
  str = str.toLowerCase();

  switch (true) {
    case str.indexOf('intel') >= 0:
      return 'Intel';
    case str.indexOf('amd') >= 0:
      return 'AMD';
    case str.indexOf('qemu') >= 0:
      return 'QEMU';
    case str.indexOf('hygon') >= 0:
      return 'Hygon';
    case str.indexOf('centaur') >= 0:
      return 'WinChip/Via';
    case str.indexOf('vmware') >= 0:
      return 'VMware';
    case str.indexOf('Xen') >= 0:
      return 'Xen Hypervisor';
    case str.indexOf('tcg') >= 0:
      return 'QEMU';
    case str.indexOf('apple') >= 0:
      return 'Apple';
    case str.indexOf('sifive') >= 0:
      return 'SiFive';
    case str.indexOf('thead') >= 0:
      return 'T-Head';
    case str.indexOf('andestech') >= 0:
      return 'Andes Technology';
    default:
      return dafaults;
  }
};

export const getAMDSpeed = (brand: string): number => {
  let result = '0';
  let key: keyof typeof AMDBaseFrequencies;
  for (key in AMDBaseFrequencies) {
    if (Object.keys(AMDBaseFrequencies).includes(key)) {
      const parts = key.split('|');
      let found = 0;
      parts.forEach((item) => {
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

export const cpuBrandManufacturer = (brand: string): CpuBrandObject => {
  brand = brand
    .replace(/\(R\)+/g, '®')
    .replace(/\s+/g, ' ')
    .trim();
  brand = brand
    .replace(/\(TM\)+/g, '™')
    .replace(/\s+/g, ' ')
    .trim();
  brand = brand
    .replace(/\(C\)+/g, '©')
    .replace(/\s+/g, ' ')
    .trim();
  brand = brand.replace(/CPU+/g, '').replace(/\s+/g, ' ').trim();
  const manufacturer = cpuManufacturer(brand);

  const parts = brand.split(' ').splice(1);
  brand = parts.join(' ');
  return {
    brand,
    manufacturer
  };
};

export const socketTypes: { [index: string]: any } = {
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
  64: 'LGA1700',
  65: 'BGA1744',
  66: 'BGA1781',
  67: 'BGA1211',
  68: 'BGA2422',
  69: 'LGA1211',
  70: 'LGA2422',
  71: 'LGA5773',
  72: 'BGA5773',
  73: 'AM5',
  74: 'SP5',
  75: 'SP6',
  76: 'BGA883',
  77: 'BGA1190',
  78: 'BGA4129',
  79: 'LGA4710',
  80: 'LGA7529',
  81: 'BGA1964',
  82: 'BGA1792',
  83: 'BGA2049',
  84: 'BGA2551',
  85: 'LGA1851',
  86: 'BGA2114',
  87: 'BGA2833'
};

export const wifiFrequencies: { [index: number]: any } = {
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

export const chassisTypes = [
  'Other',
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
  'Stick PC'
];

export const diskVendorFromModel = (model: string) => {
  const diskManufacturers = [
    { pattern: 'WESTERN.*', manufacturer: 'Western Digital' },
    { pattern: '^WDC.*', manufacturer: 'Western Digital' },
    { pattern: 'WD.*', manufacturer: 'Western Digital' },
    { pattern: 'TOSHIBA.*', manufacturer: 'Toshiba' },
    { pattern: 'HITACHI.*', manufacturer: 'Hitachi' },
    { pattern: '^IC.*', manufacturer: 'Hitachi' },
    { pattern: '^HTS.*', manufacturer: 'Hitachi' },
    { pattern: 'SANDISK.*', manufacturer: 'SanDisk' },
    { pattern: 'KINGSTON.*', manufacturer: 'Kingston Technology' },
    { pattern: '^SONY.*', manufacturer: 'Sony' },
    { pattern: 'TRANSCEND.*', manufacturer: 'Transcend' },
    { pattern: 'SAMSUNG.*', manufacturer: 'Samsung' },
    { pattern: '^ST(?!I\\ ).*', manufacturer: 'Seagate' },
    { pattern: '^STI\\ .*', manufacturer: 'SimpleTech' },
    { pattern: '^D...-.*', manufacturer: 'IBM' },
    { pattern: '^IBM.*', manufacturer: 'IBM' },
    { pattern: '^FUJITSU.*', manufacturer: 'Fujitsu' },
    { pattern: '^MP.*', manufacturer: 'Fujitsu' },
    { pattern: '^MK.*', manufacturer: 'Toshiba' },
    { pattern: 'MAXTO.*', manufacturer: 'Maxtor' },
    { pattern: 'PIONEER.*', manufacturer: 'Pioneer' },
    { pattern: 'PHILIPS.*', manufacturer: 'Philips' },
    { pattern: 'QUANTUM.*', manufacturer: 'Quantum Technology' },
    { pattern: 'FIREBALL.*', manufacturer: 'Quantum Technology' },
    { pattern: '^VBOX.*', manufacturer: 'VirtualBox' },
    { pattern: 'CORSAIR.*', manufacturer: 'Corsair Components' },
    { pattern: 'CRUCIAL.*', manufacturer: 'Crucial' },
    { pattern: 'ECM.*', manufacturer: 'ECM' },
    { pattern: 'INTEL.*', manufacturer: 'INTEL' },
    { pattern: 'EVO.*', manufacturer: 'Samsung' },
    { pattern: 'APPLE.*', manufacturer: 'Apple' }
  ];
  let result = '';
  if (model) {
    model = model.toUpperCase();
    diskManufacturers.forEach((manufacturer) => {
      const re = RegExp(manufacturer.pattern);
      if (re.test(model)) {
        result = manufacturer.manufacturer;
      }
    });
  }
  return result;
};

export const graphicsVideoTypes: { [index: string]: any } = {
  '-2': 'UNINITIALIZED',
  '-1': 'OTHER',
  '0': 'HD15',
  '1': 'SVIDEO',
  '2': 'Composite video',
  '3': 'Component video',
  '4': 'DVI',
  '5': 'HDMI',
  '6': 'LVDS',
  '8': 'D_JPN',
  '9': 'SDI',
  '10': 'DP',
  '11': 'DP embedded',
  '12': 'UDI',
  '13': 'UDI embedded',
  '14': 'SDTVDONGLE',
  '15': 'MIRACAST',
  '2147483648': 'INTERNAL',
  '4294967295': 'RDP'
};

export const graphicsModelToVendor = (model: string) => {
  const manufacturers = [
    { pattern: '^LG.+', manufacturer: 'LG' },
    { pattern: 'BENQ.*', manufacturer: 'BenQ' },
    { pattern: 'ASUS.*', manufacturer: 'Asus' },
    { pattern: 'DELL.*', manufacturer: 'Dell' },
    { pattern: 'SAMSUNG.*', manufacturer: 'Samsung' },
    { pattern: 'VIEWSON.*', manufacturer: 'ViewSonic' },
    { pattern: 'SONY.*', manufacturer: 'Sony' },
    { pattern: 'ACER.*', manufacturer: 'Acer' },
    { pattern: '^AOC.*', manufacturer: 'AOC Monitors' },
    { pattern: '^HP.*', manufacturer: 'HP' },
    { pattern: 'EIZO.*', manufacturer: 'Eizo' },
    { pattern: 'PHILIPS.*', manufacturer: 'Philips' },
    { pattern: 'IIYAMA.*', manufacturer: 'Iiyama' },
    { pattern: 'SHARP.*', manufacturer: 'Sharp' },
    { pattern: 'NEC.*', manufacturer: 'NEC' },
    { pattern: 'LENOVO.?', manufacturer: 'Lenovo' },
    { pattern: 'COMPAQ.?', manufacturer: 'Compaq' },
    { pattern: 'APPLE.?', manufacturer: 'Apple' },
    { pattern: 'INTEL.?', manufacturer: 'Intel' },
    { pattern: 'AMD.?', manufacturer: 'AMD' },
    { pattern: 'NVIDIA.?', manufacturer: 'NVIDIA' }
  ];

  let result = '';
  if (model) {
    model = model.toUpperCase();
    manufacturers.forEach((manufacturer) => {
      const re = RegExp(manufacturer.pattern);
      if (re.test(model)) {
        result = manufacturer.manufacturer;
      }
    });
  }
  return result;
};

export const graphicsIdToVendor = (id: string) => {
  const vendors: { [index: string]: any } = {
    '610': 'Apple',
    '1e6d': 'LG',
    '10ac': 'DELL',
    '4dd9': 'Sony',
    '38a3': 'NEC'
  };
  return vendors[id] || '';
};

export const graphicsVendorToId = (str: string) => {
  let result = '';
  str = (str || '').toLowerCase();
  if (str.indexOf('apple') >= 0) {
    result = '0x05ac';
  } else if (str.indexOf('nvidia') >= 0) {
    result = '0x10de';
  } else if (str.indexOf('intel') >= 0) {
    result = '0x8086';
  } else if (str.indexOf('ati') >= 0 || str.indexOf('amd') >= 0) {
    result = '0x1002';
  }

  return result;
};

export const graphicsMetalVersion = (id: string) => {
  const families: { [index: string]: any } = {
    spdisplays_mtlgpufamilymac1: 'mac1',
    spdisplays_mtlgpufamilymac2: 'mac2',
    spdisplays_mtlgpufamilyapple1: 'apple1',
    spdisplays_mtlgpufamilyapple2: 'apple2',
    spdisplays_mtlgpufamilyapple3: 'apple3',
    spdisplays_mtlgpufamilyapple4: 'apple4',
    spdisplays_mtlgpufamilyapple5: 'apple5',
    spdisplays_mtlgpufamilyapple6: 'apple6',
    spdisplays_mtlgpufamilyapple7: 'apple7',
    spdisplays_metalfeaturesetfamily11: 'family1_v1',
    spdisplays_metalfeaturesetfamily12: 'family1_v2',
    spdisplays_metalfeaturesetfamily13: 'family1_v3',
    spdisplays_metalfeaturesetfamily14: 'family1_v4',
    spdisplays_metalfeaturesetfamily21: 'family2_v1'
  };
  return families[id] || '';
};

export const winProcessStatus: { [index: string]: any } = {
  '0': 'unknown',
  '1': 'other',
  '2': 'ready',
  '3': 'running',
  '4': 'blocked',
  '5': 'suspended blocked',
  '6': 'suspended ready',
  '7': 'terminated',
  '8': 'stopped',
  '9': 'growing'
};

// Mac model name and serial number / model identifier

export const getAppleModel = (key: string) => {
  const appleModelIds = [
    {
      key: 'Mac17,9',
      name: 'MacBook Pro',
      size: '14-inch',
      processor: 'M5 Pro',
      year: '2026',
      additional: ''
    },
    {
      key: 'Mac17,8',
      name: 'MacBook Pro',
      size: '16-inch',
      processor: 'M5 Pro',
      year: '2026',
      additional: ''
    },
    {
      key: 'Mac17,7',
      name: 'MacBook Pro',
      size: '14-inch',
      processor: 'M5 Max',
      year: '2026',
      additional: ''
    },
    {
      key: 'Mac17,6',
      name: 'MacBook Pro',
      size: '16-inch',
      processor: 'M5 Max',
      year: '2026',
      additional: ''
    },
    {
      key: 'Mac17,5',
      name: 'MacBook Pro',
      size: '16-inch',
      processor: 'M5 Pro',
      year: '2026',
      additional: ''
    },
    {
      key: 'Mac17,4',
      name: 'MacBook Pro',
      size: '14-inch',
      processor: 'M5 Pro',
      year: '2026',
      additional: ''
    },
    {
      key: 'Mac17,1',
      name: 'MacBook Neo',
      size: '14-inch',
      processor: 'A18 Pro',
      year: '2026',
      additional: ''
    },
    {
      key: 'Mac17,3',
      name: 'MacBook Pro',
      size: '16-inch',
      processor: 'M5',
      year: '2025',
      additional: ''
    },
    {
      key: 'Mac17,2',
      name: 'MacBook Pro',
      size: '14-inch',
      processor: 'M5',
      year: '2025',
      additional: ''
    },
    {
      key: 'Mac16,13',
      name: 'MacBook Air',
      size: '15-inch',
      processor: 'M4',
      year: '2025',
      additional: ''
    },
    {
      key: 'Mac16,12',
      name: 'MacBook Air',
      size: '13-inch',
      processor: 'M4',
      year: '2025',
      additional: ''
    },
    {
      key: 'Mac15,13',
      name: 'MacBook Air',
      size: '15-inch',
      processor: 'M3',
      year: '2024',
      additional: ''
    },
    {
      key: 'Mac15,12',
      name: 'MacBook Air',
      size: '13-inch',
      processor: 'M3',
      year: '2024',
      additional: ''
    },
    {
      key: 'Mac14,15',
      name: 'MacBook Air',
      size: '15-inch',
      processor: 'M2',
      year: '2024',
      additional: ''
    },
    {
      key: 'Mac14,2',
      name: 'MacBook Air',
      size: '13-inch',
      processor: 'M2',
      year: '2022',
      additional: ''
    },
    {
      key: 'MacBookAir10,1',
      name: 'MacBook Air',
      size: '13-inch',
      processor: 'M1',
      year: '2020',
      additional: ''
    },
    {
      key: 'MacBookAir9,1',
      name: 'MacBook Air',
      size: '13-inch',
      processor: '',
      year: '2020',
      additional: ''
    },
    {
      key: 'MacBookAir8,2',
      name: 'MacBook Air',
      size: '13-inch',
      processor: '',
      year: '2019',
      additional: ''
    },
    {
      key: 'MacBookAir8,1',
      name: 'MacBook Air',
      size: '13-inch',
      processor: '',
      year: '2018',
      additional: ''
    },
    {
      key: 'MacBookAir7,2',
      name: 'MacBook Air',
      size: '13-inch',
      processor: '',
      year: '2017',
      additional: ''
    },
    {
      key: 'MacBookAir7,2',
      name: 'MacBook Air',
      size: '13-inch',
      processor: '',
      year: 'Early 2015',
      additional: ''
    },
    {
      key: 'MacBookAir7,1',
      name: 'MacBook Air',
      size: '11-inch',
      processor: '',
      year: 'Early 2015',
      additional: ''
    },
    {
      key: 'MacBookAir6,2',
      name: 'MacBook Air',
      size: '13-inch',
      processor: '',
      year: 'Early 2014',
      additional: ''
    },
    {
      key: 'MacBookAir6,1',
      name: 'MacBook Air',
      size: '11-inch',
      processor: '',
      year: 'Early 2014',
      additional: ''
    },
    {
      key: 'MacBookAir6,2',
      name: 'MacBook Air',
      size: '13-inch',
      processor: '',
      year: 'Mid 2013',
      additional: ''
    },
    {
      key: 'MacBookAir6,1',
      name: 'MacBook Air',
      size: '11-inch',
      processor: '',
      year: 'Mid 2013',
      additional: ''
    },
    {
      key: 'MacBookAir5,2',
      name: 'MacBook Air',
      size: '13-inch',
      processor: '',
      year: 'Mid 2012',
      additional: ''
    },
    {
      key: 'MacBookAir5,1',
      name: 'MacBook Air',
      size: '11-inch',
      processor: '',
      year: 'Mid 2012',
      additional: ''
    },
    {
      key: 'MacBookAir4,2',
      name: 'MacBook Air',
      size: '13-inch',
      processor: '',
      year: 'Mid 2011',
      additional: ''
    },
    {
      key: 'MacBookAir4,1',
      name: 'MacBook Air',
      size: '11-inch',
      processor: '',
      year: 'Mid 2011',
      additional: ''
    },
    {
      key: 'MacBookAir3,2',
      name: 'MacBook Air',
      size: '13-inch',
      processor: '',
      year: 'Late 2010',
      additional: ''
    },
    {
      key: 'MacBookAir3,1',
      name: 'MacBook Air',
      size: '11-inch',
      processor: '',
      year: 'Late 2010',
      additional: ''
    },
    {
      key: 'MacBookAir2,1',
      name: 'MacBook Air',
      size: '13-inch',
      processor: '',
      year: 'Mid 2009',
      additional: ''
    },
    {
      key: 'Mac16,1',
      name: 'MacBook Pro',
      size: '14-inch',
      processor: 'M4',
      year: '2024',
      additional: ''
    },
    {
      key: 'Mac16,6',
      name: 'MacBook Pro',
      size: '14-inch',
      processor: 'M4 Pro',
      year: '2024',
      additional: ''
    },
    {
      key: 'Mac16,8',
      name: 'MacBook Pro',
      size: '14-inch',
      processor: 'M4 Max',
      year: '2024',
      additional: ''
    },
    {
      key: 'Mac16,5',
      name: 'MacBook Pro',
      size: '16-inch',
      processor: 'M4 Pro',
      year: '2024',
      additional: ''
    },
    {
      key: 'Mac16,6',
      name: 'MacBook Pro',
      size: '16-inch',
      processor: 'M4 Max',
      year: '2024',
      additional: ''
    },
    {
      key: 'Mac15,3',
      name: 'MacBook Pro',
      size: '14-inch',
      processor: 'M3',
      year: 'Nov 2023',
      additional: ''
    },
    {
      key: 'Mac15,6',
      name: 'MacBook Pro',
      size: '14-inch',
      processor: 'M3 Pro',
      year: 'Nov 2023',
      additional: ''
    },
    {
      key: 'Mac15,8',
      name: 'MacBook Pro',
      size: '14-inch',
      processor: 'M3 Pro',
      year: 'Nov 2023',
      additional: ''
    },
    {
      key: 'Mac15,10',
      name: 'MacBook Pro',
      size: '14-inch',
      processor: 'M3 Max',
      year: 'Nov 2023',
      additional: ''
    },
    {
      key: 'Mac15,7',
      name: 'MacBook Pro',
      size: '16-inch',
      processor: 'M3 Pro',
      year: 'Nov 2023',
      additional: ''
    },
    {
      key: 'Mac15,9',
      name: 'MacBook Pro',
      size: '16-inch',
      processor: 'M3 Pro',
      year: 'Nov 2023',
      additional: ''
    },
    {
      key: 'Mac15,11',
      name: 'MacBook Pro',
      size: '16-inch',
      processor: 'M3 Max',
      year: 'Nov 2023',
      additional: ''
    },
    {
      key: 'Mac14,5',
      name: 'MacBook Pro',
      size: '14-inch',
      processor: 'M2 Max',
      year: '2023',
      additional: ''
    },
    {
      key: 'Mac14,9',
      name: 'MacBook Pro',
      size: '14-inch',
      processor: 'M2 Max',
      year: '2023',
      additional: ''
    },
    {
      key: 'Mac14,6',
      name: 'MacBook Pro',
      size: '16-inch',
      processor: 'M2 Max',
      year: '2023',
      additional: ''
    },
    {
      key: 'Mac14,10',
      name: 'MacBook Pro',
      size: '16-inch',
      processor: 'M2 Max',
      year: '2023',
      additional: ''
    },
    {
      key: 'Mac14,7',
      name: 'MacBook Pro',
      size: '13-inch',
      processor: 'M2',
      year: '2022',
      additional: ''
    },
    {
      key: 'MacBookPro18,3',
      name: 'MacBook Pro',
      size: '14-inch',
      processor: 'M1 Pro',
      year: '2021',
      additional: ''
    },
    {
      key: 'MacBookPro18,4',
      name: 'MacBook Pro',
      size: '14-inch',
      processor: 'M1 Max',
      year: '2021',
      additional: ''
    },
    {
      key: 'MacBookPro18,1',
      name: 'MacBook Pro',
      size: '16-inch',
      processor: 'M1 Pro',
      year: '2021',
      additional: ''
    },
    {
      key: 'MacBookPro18,2',
      name: 'MacBook Pro',
      size: '16-inch',
      processor: 'M1 Max',
      year: '2021',
      additional: ''
    },
    {
      key: 'MacBookPro17,1',
      name: 'MacBook Pro',
      size: '13-inch',
      processor: 'M1',
      year: '2020',
      additional: ''
    },
    {
      key: 'MacBookPro16,3',
      name: 'MacBook Pro',
      size: '13-inch',
      processor: '',
      year: '2020',
      additional: 'Two Thunderbolt 3 ports'
    },
    {
      key: 'MacBookPro16,2',
      name: 'MacBook Pro',
      size: '13-inch',
      processor: '',
      year: '2020',
      additional: 'Four Thunderbolt 3 ports'
    },
    {
      key: 'MacBookPro16,1',
      name: 'MacBook Pro',
      size: '16-inch',
      processor: '',
      year: '2019',
      additional: ''
    },
    {
      key: 'MacBookPro16,4',
      name: 'MacBook Pro',
      size: '16-inch',
      processor: '',
      year: '2019',
      additional: ''
    },
    {
      key: 'MacBookPro15,3',
      name: 'MacBook Pro',
      size: '15-inch',
      processor: '',
      year: '2019',
      additional: ''
    },
    {
      key: 'MacBookPro15,2',
      name: 'MacBook Pro',
      size: '13-inch',
      processor: '',
      year: '2019',
      additional: ''
    },
    {
      key: 'MacBookPro15,1',
      name: 'MacBook Pro',
      size: '15-inch',
      processor: '',
      year: '2019',
      additional: ''
    },
    {
      key: 'MacBookPro15,4',
      name: 'MacBook Pro',
      size: '13-inch',
      processor: '',
      year: '2019',
      additional: 'Two Thunderbolt 3 ports'
    },
    {
      key: 'MacBookPro15,1',
      name: 'MacBook Pro',
      size: '15-inch',
      processor: '',
      year: '2018',
      additional: ''
    },
    {
      key: 'MacBookPro15,2',
      name: 'MacBook Pro',
      size: '13-inch',
      processor: '',
      year: '2018',
      additional: 'Four Thunderbolt 3 ports'
    },
    {
      key: 'MacBookPro14,1',
      name: 'MacBook Pro',
      size: '13-inch',
      processor: '',
      year: '2017',
      additional: 'Two Thunderbolt 3 ports'
    },
    {
      key: 'MacBookPro14,2',
      name: 'MacBook Pro',
      size: '13-inch',
      processor: '',
      year: '2017',
      additional: 'Four Thunderbolt 3 ports'
    },
    {
      key: 'MacBookPro14,3',
      name: 'MacBook Pro',
      size: '15-inch',
      processor: '',
      year: '2017',
      additional: ''
    },
    {
      key: 'MacBookPro13,1',
      name: 'MacBook Pro',
      size: '13-inch',
      processor: '',
      year: '2016',
      additional: 'Two Thunderbolt 3 ports'
    },
    {
      key: 'MacBookPro13,2',
      name: 'MacBook Pro',
      size: '13-inch',
      processor: '',
      year: '2016',
      additional: 'Four Thunderbolt 3 ports'
    },
    {
      key: 'MacBookPro13,3',
      name: 'MacBook Pro',
      size: '15-inch',
      processor: '',
      year: '2016',
      additional: ''
    },
    {
      key: 'MacBookPro11,4',
      name: 'MacBook Pro',
      size: '15-inch',
      processor: '',
      year: 'Mid 2015',
      additional: ''
    },
    {
      key: 'MacBookPro11,5',
      name: 'MacBook Pro',
      size: '15-inch',
      processor: '',
      year: 'Mid 2015',
      additional: ''
    },
    {
      key: 'MacBookPro12,1',
      name: 'MacBook Pro',
      size: '13-inch',
      processor: '',
      year: 'Early 2015',
      additional: ''
    },
    {
      key: 'MacBookPro11,2',
      name: 'MacBook Pro',
      size: '15-inch',
      processor: '',
      year: 'Late 2013',
      additional: ''
    },
    {
      key: 'MacBookPro11,3',
      name: 'MacBook Pro',
      size: '15-inch',
      processor: '',
      year: 'Late 2013',
      additional: ''
    },
    {
      key: 'MacBookPro11,1',
      name: 'MacBook Pro',
      size: '13-inch',
      processor: '',
      year: 'Late 2013',
      additional: ''
    },
    {
      key: 'MacBookPro10,1',
      name: 'MacBook Pro',
      size: '15-inch',
      processor: '',
      year: 'Mid 2012',
      additional: ''
    },
    {
      key: 'MacBookPro10,2',
      name: 'MacBook Pro',
      size: '13-inch',
      processor: '',
      year: 'Late 2012',
      additional: ''
    },
    {
      key: 'MacBookPro9,1',
      name: 'MacBook Pro',
      size: '15-inch',
      processor: '',
      year: 'Mid 2012',
      additional: ''
    },
    {
      key: 'MacBookPro9,2',
      name: 'MacBook Pro',
      size: '13-inch',
      processor: '',
      year: 'Mid 2012',
      additional: ''
    },
    {
      key: 'MacBookPro8,3',
      name: 'MacBook Pro',
      size: '17-inch',
      processor: '',
      year: 'Early 2011',
      additional: ''
    },
    {
      key: 'MacBookPro8,2',
      name: 'MacBook Pro',
      size: '15-inch',
      processor: '',
      year: 'Early 2011',
      additional: ''
    },
    {
      key: 'MacBookPro8,1',
      name: 'MacBook Pro',
      size: '13-inch',
      processor: '',
      year: 'Early 2011',
      additional: ''
    },
    {
      key: 'MacBookPro6,1',
      name: 'MacBook Pro',
      size: '17-inch',
      processor: '',
      year: 'Mid 2010',
      additional: ''
    },
    {
      key: 'MacBookPro6,2',
      name: 'MacBook Pro',
      size: '15-inch',
      processor: '',
      year: 'Mid 2010',
      additional: ''
    },
    {
      key: 'MacBookPro7,1',
      name: 'MacBook Pro',
      size: '13-inch',
      processor: '',
      year: 'Mid 2010',
      additional: ''
    },
    {
      key: 'MacBookPro5,2',
      name: 'MacBook Pro',
      size: '17-inch',
      processor: '',
      year: 'Early 2009',
      additional: ''
    },
    {
      key: 'MacBookPro5,3',
      name: 'MacBook Pro',
      size: '15-inch',
      processor: '',
      year: 'Mid 2009',
      additional: ''
    },
    {
      key: 'MacBookPro5,5',
      name: 'MacBook Pro',
      size: '13-inch',
      processor: '',
      year: 'Mid 2009',
      additional: ''
    },
    {
      key: 'MacBookPro5,1',
      name: 'MacBook Pro',
      size: '15-inch',
      processor: '',
      year: 'Late 2008',
      additional: ''
    },
    {
      key: 'MacBookPro4,1',
      name: 'MacBook Pro',
      size: '15-inch',
      processor: '',
      year: 'Early 2008',
      additional: ''
    },
    {
      key: 'MacBook10,1',
      name: 'MacBook',
      size: '12-inch',
      processor: '',
      year: '2017',
      additional: ''
    },
    {
      key: 'MacBook9,1',
      name: 'MacBook',
      size: '12-inch',
      processor: '',
      year: 'Early 2016',
      additional: ''
    },
    {
      key: 'MacBook8,1',
      name: 'MacBook',
      size: '12-inch',
      processor: '',
      year: 'Early 2015',
      additional: ''
    },
    {
      key: 'MacBook7,1',
      name: 'MacBook',
      size: '13-inch',
      processor: '',
      year: 'Mid 2010',
      additional: ''
    },
    {
      key: 'MacBook6,1',
      name: 'MacBook',
      size: '13-inch',
      processor: '',
      year: 'Late 2009',
      additional: ''
    },
    {
      key: 'MacBook5,2',
      name: 'MacBook',
      size: '13-inch',
      processor: '',
      year: 'Early 2009',
      additional: ''
    },
    {
      key: 'Mac14,13',
      name: 'Mac Studio',
      size: '',
      processor: 'M2 Max',
      year: '2023',
      additional: ''
    },
    {
      key: 'Mac14,14',
      name: 'Mac Studio',
      size: '',
      processor: 'M2 Ultra',
      year: '2023',
      additional: ''
    },
    {
      key: 'Mac15,14',
      name: 'Mac Studio',
      size: '',
      processor: 'M3 Ultra',
      year: '2025',
      additional: ''
    },
    {
      key: 'Mac16,9',
      name: 'Mac Studio',
      size: '',
      processor: 'M4 Max',
      year: '2025',
      additional: ''
    },
    {
      key: 'Mac13,1',
      name: 'Mac Studio',
      size: '',
      processor: 'M1 Max',
      year: '2022',
      additional: ''
    },
    {
      key: 'Mac13,2',
      name: 'Mac Studio',
      size: '',
      processor: 'M1 Ultra',
      year: '2022',
      additional: ''
    },
    {
      key: 'Mac16,11',
      name: 'Mac mini',
      size: '',
      processor: 'M4 Pro',
      year: '2024',
      additional: ''
    },
    {
      key: 'Mac16,10',
      name: 'Mac mini',
      size: '',
      processor: 'M4',
      year: '2024',
      additional: ''
    },
    {
      key: 'Mac14,3',
      name: 'Mac mini',
      size: '',
      processor: 'M2',
      year: '2023',
      additional: ''
    },
    {
      key: 'Mac14,12',
      name: 'Mac mini',
      size: '',
      processor: 'M2 Pro',
      year: '2023',
      additional: ''
    },
    {
      key: 'Macmini9,1',
      name: 'Mac mini',
      size: '',
      processor: 'M1',
      year: '2020',
      additional: ''
    },
    {
      key: 'Macmini8,1',
      name: 'Mac mini',
      size: '',
      processor: '',
      year: 'Late 2018',
      additional: ''
    },
    {
      key: 'Macmini7,1',
      name: 'Mac mini',
      size: '',
      processor: '',
      year: 'Late 2014',
      additional: ''
    },
    {
      key: 'Macmini6,1',
      name: 'Mac mini',
      size: '',
      processor: '',
      year: 'Late 2012',
      additional: ''
    },
    {
      key: 'Macmini6,2',
      name: 'Mac mini',
      size: '',
      processor: '',
      year: 'Late 2012',
      additional: ''
    },
    {
      key: 'Macmini5,1',
      name: 'Mac mini',
      size: '',
      processor: '',
      year: 'Mid 2011',
      additional: ''
    },
    {
      key: 'Macmini5,2',
      name: 'Mac mini',
      size: '',
      processor: '',
      year: 'Mid 2011',
      additional: ''
    },
    {
      key: 'Macmini4,1',
      name: 'Mac mini',
      size: '',
      processor: '',
      year: 'Mid 2010',
      additional: ''
    },
    {
      key: 'Macmini3,1',
      name: 'Mac mini',
      size: '',
      processor: '',
      year: 'Early 2009',
      additional: ''
    },
    {
      key: 'Mac16,3',
      name: 'iMac',
      size: '24-inch',
      processor: 'M4',
      year: '2024',
      additional: 'Four ports'
    },
    {
      key: 'Mac16,2',
      name: 'iMac',
      size: '24-inch',
      processor: 'M4',
      year: '2024',
      additional: 'Two ports'
    },
    {
      key: 'Mac15,5',
      name: 'iMac',
      size: '24-inch',
      processor: 'M3',
      year: '2023',
      additional: 'Four ports'
    },
    {
      key: 'Mac15,4',
      name: 'iMac',
      size: '24-inch',
      processor: 'M3',
      year: '2023',
      additional: 'Two ports'
    },
    {
      key: 'iMac21,1',
      name: 'iMac',
      size: '24-inch',
      processor: 'M1',
      year: '2021',
      additional: ''
    },
    {
      key: 'iMac21,2',
      name: 'iMac',
      size: '24-inch',
      processor: 'M1',
      year: '2021',
      additional: ''
    },
    {
      key: 'iMac20,1',
      name: 'iMac',
      size: '27-inch',
      processor: '',
      year: '2020',
      additional: 'Retina 5K'
    },
    {
      key: 'iMac20,2',
      name: 'iMac',
      size: '27-inch',
      processor: '',
      year: '2020',
      additional: 'Retina 5K'
    },
    {
      key: 'iMac19,1',
      name: 'iMac',
      size: '27-inch',
      processor: '',
      year: '2019',
      additional: 'Retina 5K'
    },
    {
      key: 'iMac19,2',
      name: 'iMac',
      size: '21.5-inch',
      processor: '',
      year: '2019',
      additional: 'Retina 4K'
    },
    {
      key: 'iMacPro1,1',
      name: 'iMac Pro',
      size: '',
      processor: '',
      year: '2017',
      additional: ''
    },
    {
      key: 'iMac18,3',
      name: 'iMac',
      size: '27-inch',
      processor: '',
      year: '2017',
      additional: 'Retina 5K'
    },
    {
      key: 'iMac18,2',
      name: 'iMac',
      size: '21.5-inch',
      processor: '',
      year: '2017',
      additional: 'Retina 4K'
    },
    {
      key: 'iMac18,1',
      name: 'iMac',
      size: '21.5-inch',
      processor: '',
      year: '2017',
      additional: ''
    },
    {
      key: 'iMac17,1',
      name: 'iMac',
      size: '27-inch',
      processor: '',
      year: 'Late 2015',
      additional: 'Retina 5K'
    },
    {
      key: 'iMac16,2',
      name: 'iMac',
      size: '21.5-inch',
      processor: '',
      year: 'Late 2015',
      additional: 'Retina 4K'
    },
    {
      key: 'iMac16,1',
      name: 'iMac',
      size: '21.5-inch',
      processor: '',
      year: 'Late 2015',
      additional: ''
    },
    {
      key: 'iMac15,1',
      name: 'iMac',
      size: '27-inch',
      processor: '',
      year: 'Late 2014',
      additional: 'Retina 5K'
    },
    {
      key: 'iMac14,4',
      name: 'iMac',
      size: '21.5-inch',
      processor: '',
      year: 'Mid 2014',
      additional: ''
    },
    {
      key: 'iMac14,2',
      name: 'iMac',
      size: '27-inch',
      processor: '',
      year: 'Late 2013',
      additional: ''
    },
    {
      key: 'iMac14,1',
      name: 'iMac',
      size: '21.5-inch',
      processor: '',
      year: 'Late 2013',
      additional: ''
    },
    {
      key: 'iMac13,2',
      name: 'iMac',
      size: '27-inch',
      processor: '',
      year: 'Late 2012',
      additional: ''
    },
    {
      key: 'iMac13,1',
      name: 'iMac',
      size: '21.5-inch',
      processor: '',
      year: 'Late 2012',
      additional: ''
    },
    {
      key: 'iMac12,2',
      name: 'iMac',
      size: '27-inch',
      processor: '',
      year: 'Mid 2011',
      additional: ''
    },
    {
      key: 'iMac12,1',
      name: 'iMac',
      size: '21.5-inch',
      processor: '',
      year: 'Mid 2011',
      additional: ''
    },
    {
      key: 'iMac11,3',
      name: 'iMac',
      size: '27-inch',
      processor: '',
      year: 'Mid 2010',
      additional: ''
    },
    {
      key: 'iMac11,2',
      name: 'iMac',
      size: '21.5-inch',
      processor: '',
      year: 'Mid 2010',
      additional: ''
    },
    {
      key: 'iMac10,1',
      name: 'iMac',
      size: '21.5-inch',
      processor: '',
      year: 'Late 2009',
      additional: ''
    },
    {
      key: 'iMac9,1',
      name: 'iMac',
      size: '20-inch',
      processor: '',
      year: 'Early 2009',
      additional: ''
    },
    {
      key: 'Mac14,8',
      name: 'Mac Pro',
      size: '',
      processor: '',
      year: '2023',
      additional: ''
    },
    {
      key: 'Mac14,8',
      name: 'Mac Pro',
      size: '',
      processor: '',
      year: '2023',
      additional: 'Rack'
    },
    {
      key: 'MacPro7,1',
      name: 'Mac Pro',
      size: '',
      processor: '',
      year: '2019',
      additional: ''
    },
    {
      key: 'MacPro7,1',
      name: 'Mac Pro',
      size: '',
      processor: '',
      year: '2019',
      additional: 'Rack'
    },
    {
      key: 'MacPro6,1',
      name: 'Mac Pro',
      size: '',
      processor: '',
      year: 'Late 2013',
      additional: ''
    },
    {
      key: 'MacPro5,1',
      name: 'Mac Pro',
      size: '',
      processor: '',
      year: 'Mid 2012',
      additional: ''
    },
    {
      key: 'MacPro5,1',
      name: 'Mac Pro Server',
      size: '',
      processor: '',
      year: 'Mid 2012',
      additional: 'Server'
    },
    {
      key: 'MacPro5,1',
      name: 'Mac Pro',
      size: '',
      processor: '',
      year: 'Mid 2010',
      additional: ''
    },
    {
      key: 'MacPro5,1',
      name: 'Mac Pro Server',
      size: '',
      processor: '',
      year: 'Mid 2010',
      additional: 'Server'
    },
    {
      key: 'MacPro4,1',
      name: 'Mac Pro',
      size: '',
      processor: '',
      year: 'Early 2009',
      additional: ''
    }
  ];

  const list = appleModelIds.filter((model) => model.key === key);
  if (list.length === 0) {
    return {
      key: key,
      model: 'Apple',
      version: 'Unknown'
    };
  }
  const features = [];
  if (list[0].size) {
    features.push(list[0].size);
  }
  if (list[0].processor) {
    features.push(list[0].processor);
  }
  if (list[0].year) {
    features.push(list[0].year);
  }
  if (list[0].additional) {
    features.push(list[0].additional);
  }
  return {
    key: key,
    model: list[0].name,
    version: list[0].name + ' (' + features.join(', ') + ')'
  };
};

export const getAppleChassisType = (model: string) => {
  model = model.toLowerCase();
  if (model.indexOf('macbookair') >= 0 || model.indexOf('macbook air') >= 0) {
    return 'Notebook';
  }
  if (model.indexOf('macbookpro') >= 0 || model.indexOf('macbook pro') >= 0) {
    return 'Notebook';
  }
  if (model.indexOf('macbook') >= 0) {
    return 'Notebook';
  }
  if (model.indexOf('macmini') >= 0 || model.indexOf('mac mini') >= 0) {
    return 'Desktop';
  }
  if (model.indexOf('imac') >= 0) {
    return 'Desktop';
  }
  if (model.indexOf('macstudio') >= 0 || model.indexOf('mac studio') >= 0) {
    return 'Desktop';
  }
  if (model.indexOf('macpro') >= 0 || model.indexOf('mac pro') >= 0) {
    return 'Tower';
  }
  return 'Other';
};

export const bluetoothVendors: { [index: number]: any } = {
  0: 'Ericsson Technology Licensing',
  1: 'Nokia Mobile Phones',
  2: 'Intel Corp.',
  3: 'IBM Corp.',
  4: 'Toshiba Corp.',
  5: '3Com',
  6: 'Microsoft',
  7: 'Lucent',
  8: 'Motorola',
  9: 'Infineon Technologies AG',
  10: 'Cambridge Silicon Radio',
  11: 'Silicon Wave',
  12: 'Digianswer A/S',
  13: 'Texas Instruments Inc.',
  14: 'Ceva, Inc. (formerly Parthus Technologies, Inc.)',
  15: 'Broadcom Corporation',
  16: 'Mitel Semiconductor',
  17: 'Widcomm, Inc',
  18: 'Zeevo, Inc.',
  19: 'Atmel Corporation',
  20: 'Mitsubishi Electric Corporation',
  21: 'RTX Telecom A/S',
  22: 'KC Technology Inc.',
  23: 'NewLogic',
  24: 'Transilica, Inc.',
  25: 'Rohde & Schwarz GmbH & Co. KG',
  26: 'TTPCom Limited',
  27: 'Signia Technologies, Inc.',
  28: 'Conexant Systems Inc.',
  29: 'Qualcomm',
  30: 'Inventel',
  31: 'AVM Berlin',
  32: 'BandSpeed, Inc.',
  33: 'Mansella Ltd',
  34: 'NEC Corporation',
  35: 'WavePlus Technology Co., Ltd.',
  36: 'Alcatel',
  37: 'NXP Semiconductors (formerly Philips Semiconductors)',
  38: 'C Technologies',
  39: 'Open Interface',
  40: 'R F Micro Devices',
  41: 'Hitachi Ltd',
  42: 'Symbol Technologies, Inc.',
  43: 'Tenovis',
  44: 'Macronix International Co. Ltd.',
  45: 'GCT Semiconductor',
  46: 'Norwood Systems',
  47: 'MewTel Technology Inc.',
  48: 'ST Microelectronics',
  49: 'Synopsis',
  50: 'Red-M (Communications) Ltd',
  51: 'Commil Ltd',
  52: 'Computer Access Technology Corporation (CATC)',
  53: 'Eclipse (HQ Espana) S.L.',
  54: 'Renesas Electronics Corporation',
  55: 'Mobilian Corporation',
  56: 'Terax',
  57: 'Integrated System Solution Corp.',
  58: 'Matsushita Electric Industrial Co., Ltd.',
  59: 'Gennum Corporation',
  60: 'BlackBerry Limited (formerly Research In Motion)',
  61: 'IPextreme, Inc.',
  62: 'Systems and Chips, Inc.',
  63: 'Bluetooth SIG, Inc.',
  64: 'Seiko Epson Corporation',
  65: 'Integrated Silicon Solution Taiwan, Inc.',
  66: 'CONWISE Technology Corporation Ltd',
  67: 'PARROT SA',
  68: 'Socket Mobile',
  69: 'Atheros Communications, Inc.',
  70: 'MediaTek, Inc.',
  71: 'Bluegiga',
  72: 'Marvell Technology Group Ltd.',
  73: '3DSP Corporation',
  74: 'Accel Semiconductor Ltd.',
  75: 'Continental Automotive Systems',
  76: 'Apple, Inc.',
  77: 'Staccato Communications, Inc.',
  78: 'Avago Technologies',
  79: 'APT Licensing Ltd.',
  80: 'SiRF Technology',
  81: 'Tzero Technologies, Inc.',
  82: 'J&M Corporation',
  83: 'Free2move AB',
  84: '3DiJoy Corporation',
  85: 'Plantronics, Inc.',
  86: 'Sony Ericsson Mobile Communications',
  87: 'Harman International Industries, Inc.',
  88: 'Vizio, Inc.',
  89: 'Nordic Semiconductor ASA',
  90: 'EM Microelectronic-Marin SA',
  91: 'Ralink Technology Corporation',
  92: 'Belkin International, Inc.',
  93: 'Realtek Semiconductor Corporation',
  94: 'Stonestreet One, LLC',
  95: 'Wicentric, Inc.',
  96: 'RivieraWaves S.A.S',
  97: 'RDA Microelectronics',
  98: 'Gibson Guitars',
  99: 'MiCommand Inc.',
  100: 'Band XI International, LLC',
  101: 'Hewlett-Packard Company',
  102: '9Solutions Oy',
  103: 'GN Netcom A/S',
  104: 'General Motors',
  105: 'A&D Engineering, Inc.',
  106: 'MindTree Ltd.',
  107: 'Polar Electro OY',
  108: 'Beautiful Enterprise Co., Ltd.',
  109: 'BriarTek, Inc.',
  110: 'Summit Data Communications, Inc.',
  111: 'Sound ID',
  112: 'Monster, LLC',
  113: 'connectBlue AB',
  114: 'ShangHai Super Smart Electronics Co. Ltd.',
  115: 'Group Sense Ltd.',
  116: 'Zomm, LLC',
  117: 'Samsung Electronics Co. Ltd.',
  118: 'Creative Technology Ltd.',
  119: 'Laird Technologies',
  120: 'Nike, Inc.',
  121: 'lesswire AG',
  122: 'MStar Semiconductor, Inc.',
  123: 'Hanlynn Technologies',
  124: 'A & R Cambridge',
  125: 'Seers Technology Co. Ltd',
  126: 'Sports Tracking Technologies Ltd.',
  127: 'Autonet Mobile',
  128: 'DeLorme Publishing Company, Inc.',
  129: 'WuXi Vimicro',
  130: 'Sennheiser Communications A/S',
  131: 'TimeKeeping Systems, Inc.',
  132: 'Ludus Helsinki Ltd.',
  133: 'BlueRadios, Inc.',
  134: 'equinox AG',
  135: 'Garmin International, Inc.',
  136: 'Ecotest',
  137: 'GN ReSound A/S',
  138: 'Jawbone',
  139: 'Topcorn Positioning Systems, LLC',
  140: 'Gimbal Inc. (formerly Qualcomm Labs, Inc. and Qualcomm Retail Solutions, Inc.)',
  141: 'Zscan Software',
  142: 'Quintic Corp.',
  143: 'Stollman E+V GmbH',
  144: 'Funai Electric Co., Ltd.',
  145: 'Advanced PANMOBIL Systems GmbH & Co. KG',
  146: 'ThinkOptics, Inc.',
  147: 'Universal Electronics, Inc.',
  148: 'Airoha Technology Corp.',
  149: 'NEC Lighting, Ltd.',
  150: 'ODM Technology, Inc.',
  151: 'ConnecteDevice Ltd.',
  152: 'zer01.tv GmbH',
  153: 'i.Tech Dynamic Global Distribution Ltd.',
  154: 'Alpwise',
  155: 'Jiangsu Toppower Automotive Electronics Co., Ltd.',
  156: 'Colorfy, Inc.',
  157: 'Geoforce Inc.',
  158: 'Bose Corporation',
  159: 'Suunto Oy',
  160: 'Kensington Computer Products Group',
  161: 'SR-Medizinelektronik',
  162: 'Vertu Corporation Limited',
  163: 'Meta Watch Ltd.',
  164: 'LINAK A/S',
  165: 'OTL Dynamics LLC',
  166: 'Panda Ocean Inc.',
  167: 'Visteon Corporation',
  168: 'ARP Devices Limited',
  169: 'Magneti Marelli S.p.A',
  170: 'CAEN RFID srl',
  171: 'Ingenieur-Systemgruppe Zahn GmbH',
  172: 'Green Throttle Games',
  173: 'Peter Systemtechnik GmbH',
  174: 'Omegawave Oy',
  175: 'Cinetix',
  176: 'Passif Semiconductor Corp',
  177: 'Saris Cycling Group, Inc',
  178: 'Bekey A/S',
  179: 'Clarinox Technologies Pty. Ltd.',
  180: 'BDE Technology Co., Ltd.',
  181: 'Swirl Networks',
  182: 'Meso international',
  183: 'TreLab Ltd',
  184: 'Qualcomm Innovation Center, Inc. (QuIC)',
  185: 'Johnson Controls, Inc.',
  186: 'Starkey Laboratories Inc.',
  187: 'S-Power Electronics Limited',
  188: 'Ace Sensor Inc',
  189: 'Aplix Corporation',
  190: 'AAMP of America',
  191: 'Stalmart Technology Limited',
  192: 'AMICCOM Electronics Corporation',
  193: 'Shenzhen Excelsecu Data Technology Co.,Ltd',
  194: 'Geneq Inc.',
  195: 'adidas AG',
  196: 'LG Electronics',
  197: 'Onset Computer Corporation',
  198: 'Selfly BV',
  199: 'Quuppa Oy.',
  200: 'GeLo Inc',
  201: 'Evluma',
  202: 'MC10',
  203: 'Binauric SE',
  204: 'Beats Electronics',
  205: 'Microchip Technology Inc.',
  206: 'Elgato Systems GmbH',
  207: 'ARCHOS SA',
  208: 'Dexcom, Inc.',
  209: 'Polar Electro Europe B.V.',
  210: 'Dialog Semiconductor B.V.',
  211: 'Taixingbang Technology (HK) Co,. LTD.',
  212: 'Kawantech',
  213: 'Austco Communication Systems',
  214: 'Timex Group USA, Inc.',
  215: 'Qualcomm Technologies, Inc.',
  216: 'Qualcomm Connected Experiences, Inc.',
  217: 'Voyetra Turtle Beach',
  218: 'txtr GmbH',
  219: 'Biosentronics',
  220: 'Procter & Gamble',
  221: 'Hosiden Corporation',
  222: 'Muzik LLC',
  223: 'Misfit Wearables Corp',
  224: 'Google',
  225: 'Danlers Ltd',
  226: 'Semilink Inc',
  227: 'inMusic Brands, Inc',
  228: 'L.S. Research Inc.',
  229: 'Eden Software Consultants Ltd.',
  230: 'Freshtemp',
  231: 'KS Technologies',
  232: 'ACTS Technologies',
  233: 'Vtrack Systems',
  234: 'Nielsen-Kellerman Company',
  235: 'Server Technology, Inc.',
  236: 'BioResearch Associates',
  237: 'Jolly Logic, LLC',
  238: 'Above Average Outcomes, Inc.',
  239: 'Bitsplitters GmbH',
  240: 'PayPal, Inc.',
  241: 'Witron Technology Limited',
  242: 'Aether Things Inc. (formerly Morse Project Inc.)',
  243: 'Kent Displays Inc.',
  244: 'Nautilus Inc.',
  245: 'Smartifier Oy',
  246: 'Elcometer Limited',
  247: 'VSN Technologies Inc.',
  248: 'AceUni Corp., Ltd.',
  249: 'StickNFind',
  250: 'Crystal Code AB',
  251: 'KOUKAAM a.s.',
  252: 'Delphi Corporation',
  253: 'ValenceTech Limited',
  254: 'Reserved',
  255: 'Typo Products, LLC',
  256: 'TomTom International BV',
  257: 'Fugoo, Inc',
  258: 'Keiser Corporation',
  259: 'Bang & Olufsen A/S',
  260: 'PLUS Locations Systems Pty Ltd',
  261: 'Ubiquitous Computing Technology Corporation',
  262: 'Innovative Yachtter Solutions',
  263: 'William Demant Holding A/S',
  264: 'Chicony Electronics Co., Ltd.',
  265: 'Atus BV',
  266: 'Codegate Ltd.',
  267: 'ERi, Inc.',
  268: 'Transducers Direct, LLC',
  269: 'Fujitsu Ten Limited',
  270: 'Audi AG',
  271: 'HiSilicon Technologies Co., Ltd.',
  272: 'Nippon Seiki Co., Ltd.',
  273: 'Steelseries ApS',
  274: 'vyzybl Inc.',
  275: 'Openbrain Technologies, Co., Ltd.',
  276: 'Xensr',
  277: 'e.solutions',
  278: '1OAK Technologies',
  279: 'Wimoto Technologies Inc',
  280: 'Radius Networks, Inc.',
  281: 'Wize Technology Co., Ltd.',
  282: 'Qualcomm Labs, Inc.',
  283: 'Aruba Networks',
  284: 'Baidu',
  285: 'Arendi AG',
  286: 'Skoda Auto a.s.',
  287: 'Volkswagon AG',
  288: 'Porsche AG',
  289: 'Sino Wealth Electronic Ltd.',
  290: 'AirTurn, Inc.',
  291: 'Kinsa, Inc.',
  292: 'HID Global',
  293: 'SEAT es',
  294: 'Promethean Ltd.',
  295: 'Salutica Allied Solutions',
  296: 'GPSI Group Pty Ltd',
  297: 'Nimble Devices Oy',
  298: 'Changzhou Yongse Infotech Co., Ltd',
  299: 'SportIQ',
  300: 'TEMEC Instruments B.V.',
  301: 'Sony Corporation',
  302: 'ASSA ABLOY',
  303: 'Clarion Co., Ltd.',
  304: 'Warehouse Innovations',
  305: 'Cypress Semiconductor Corporation',
  306: 'MADS Inc',
  307: 'Blue Maestro Limited',
  308: 'Resolution Products, Inc.',
  309: 'Airewear LLC',
  310: 'Seed Labs, Inc. (formerly ETC sp. z.o.o.)',
  311: 'Prestigio Plaza Ltd.',
  312: 'NTEO Inc.',
  313: 'Focus Systems Corporation',
  314: 'Tencent Holdings Limited',
  315: 'Allegion',
  316: 'Murata Manufacuring Co., Ltd.',
  318: 'Nod, Inc.',
  319: 'B&B Manufacturing Company',
  320: 'Alpine Electronics (China) Co., Ltd',
  321: 'FedEx Services',
  322: 'Grape Systems Inc.',
  323: 'Bkon Connect',
  324: 'Lintech GmbH',
  325: 'Novatel Wireless',
  326: 'Ciright',
  327: 'Mighty Cast, Inc.',
  328: 'Ambimat Electronics',
  329: 'Perytons Ltd.',
  330: 'Tivoli Audio, LLC',
  331: 'Master Lock',
  332: 'Mesh-Net Ltd',
  333: 'Huizhou Desay SV Automotive CO., LTD.',
  334: 'Tangerine, Inc.',
  335: 'B&W Group Ltd.',
  336: 'Pioneer Corporation',
  337: 'OnBeep',
  338: 'Vernier Software & Technology',
  339: 'ROL Ergo',
  340: 'Pebble Technology',
  341: 'NETATMO',
  342: 'Accumulate AB',
  343: 'Anhui Huami Information Technology Co., Ltd.',
  344: 'Inmite s.r.o.',
  345: 'ChefSteps, Inc.',
  346: 'micas AG',
  347: 'Biomedical Research Ltd.',
  348: 'Pitius Tec S.L.',
  349: 'Estimote, Inc.',
  350: 'Unikey Technologies, Inc.',
  351: 'Timer Cap Co.',
  352: 'AwoX',
  353: 'yikes',
  354: 'MADSGlobal NZ Ltd.',
  355: 'PCH International',
  356: 'Qingdao Yeelink Information Technology Co., Ltd.',
  357: 'Milwaukee Tool (formerly Milwaukee Electric Tools)',
  358: 'MISHIK Pte Ltd',
  359: 'Bayer HealthCare',
  360: 'Spicebox LLC',
  361: 'emberlight',
  362: 'Cooper-Atkins Corporation',
  363: 'Qblinks',
  364: 'MYSPHERA',
  365: 'LifeScan Inc',
  366: 'Volantic AB',
  367: 'Podo Labs, Inc',
  368: 'Roche Diabetes Care AG',
  369: 'Amazon Fulfillment Service',
  370: 'Connovate Technology Private Limited',
  371: 'Kocomojo, LLC',
  372: 'Everykey LLC',
  373: 'Dynamic Controls',
  374: 'SentriLock',
  375: 'I-SYST inc.',
  376: 'CASIO COMPUTER CO., LTD.',
  377: 'LAPIS Semiconductor Co., Ltd.',
  378: 'Telemonitor, Inc.',
  379: 'taskit GmbH',
  380: 'Daimler AG',
  381: 'BatAndCat',
  382: 'BluDotz Ltd',
  383: 'XTel ApS',
  384: 'Gigaset Communications GmbH',
  385: 'Gecko Health Innovations, Inc.',
  386: 'HOP Ubiquitous',
  387: 'To Be Assigned',
  388: 'Nectar',
  389: 'bel’apps LLC',
  390: 'CORE Lighting Ltd',
  391: 'Seraphim Sense Ltd',
  392: 'Unico RBC',
  393: 'Physical Enterprises Inc.',
  394: 'Able Trend Technology Limited',
  395: 'Konica Minolta, Inc.',
  396: 'Wilo SE',
  397: 'Extron Design Services',
  398: 'Fitbit, Inc.',
  399: 'Fireflies Systems',
  400: 'Intelletto Technologies Inc.',
  401: 'FDK CORPORATION',
  402: 'Cloudleaf, Inc',
  403: 'Maveric Automation LLC',
  404: 'Acoustic Stream Corporation',
  405: 'Zuli',
  406: 'Paxton Access Ltd',
  407: 'WiSilica Inc',
  408: 'Vengit Limited',
  409: 'SALTO SYSTEMS S.L.',
  410: 'TRON Forum (formerly T-Engine Forum)',
  411: 'CUBETECH s.r.o.',
  412: 'Cokiya Incorporated',
  413: 'CVS Health',
  414: 'Ceruus',
  415: 'Strainstall Ltd',
  416: 'Channel Enterprises (HK) Ltd.',
  417: 'FIAMM',
  418: 'GIGALANE.CO.,LTD',
  419: 'EROAD',
  420: 'Mine Safety Appliances',
  421: 'Icon Health and Fitness',
  422: 'Asandoo GmbH',
  423: 'ENERGOUS CORPORATION',
  424: 'Taobao',
  425: 'Canon Inc.',
  426: 'Geophysical Technology Inc.',
  427: 'Facebook, Inc.',
  428: 'Nipro Diagnostics, Inc.',
  429: 'FlightSafety International',
  430: 'Earlens Corporation',
  431: 'Sunrise Micro Devices, Inc.',
  432: 'Star Micronics Co., Ltd.',
  433: 'Netizens Sp. z o.o.',
  434: 'Nymi Inc.',
  435: 'Nytec, Inc.',
  436: 'Trineo Sp. z o.o.',
  437: 'Nest Labs Inc.',
  438: 'LM Technologies Ltd',
  439: 'General Electric Company',
  440: 'i+D3 S.L.',
  441: 'HANA Micron',
  442: 'Stages Cycling LLC',
  443: 'Cochlear Bone Anchored Solutions AB',
  444: 'SenionLab AB',
  445: 'Syszone Co., Ltd',
  446: 'Pulsate Mobile Ltd.',
  447: 'Hong Kong HunterSun Electronic Limited',
  448: 'pironex GmbH',
  449: 'BRADATECH Corp.',
  450: 'Transenergooil AG',
  451: 'Bunch',
  452: 'DME Microelectronics',
  453: 'Bitcraze AB',
  454: 'HASWARE Inc.',
  455: 'Abiogenix Inc.',
  456: 'Poly-Control ApS',
  457: 'Avi-on',
  458: 'Laerdal Medical AS',
  459: 'Fetch My Pet',
  460: 'Sam Labs Ltd.',
  461: 'Chengdu Synwing Technology Ltd',
  462: 'HOUWA SYSTEM DESIGN, k.k.',
  463: 'BSH',
  464: 'Primus Inter Pares Ltd',
  465: 'August',
  466: 'Gill Electronics',
  467: 'Sky Wave Design',
  468: 'Newlab S.r.l.',
  469: 'ELAD srl',
  470: 'G-wearables inc.',
  471: 'Squadrone Systems Inc.',
  472: 'Code Corporation',
  473: 'Savant Systems LLC',
  474: 'Logitech International SA',
  475: 'Innblue Consulting',
  476: 'iParking Ltd.',
  477: 'Koninklijke Philips Electronics N.V.',
  478: 'Minelab Electronics Pty Limited',
  479: 'Bison Group Ltd.',
  480: 'Widex A/S',
  481: 'Jolla Ltd',
  482: 'Lectronix, Inc.',
  483: 'Caterpillar Inc',
  484: 'Freedom Innovations',
  485: 'Dynamic Devices Ltd',
  486: 'Technology Solutions (UK) Ltd',
  487: 'IPS Group Inc.',
  488: 'STIR',
  489: 'Sano, Inc',
  490: 'Advanced Application Design, Inc.',
  491: 'AutoMap LLC',
  492: 'Spreadtrum Communications Shanghai Ltd',
  493: 'CuteCircuit LTD',
  494: 'Valeo Service',
  495: 'Fullpower Technologies, Inc.',
  496: 'KloudNation',
  497: 'Zebra Technologies Corporation',
  498: 'Itron, Inc.',
  499: 'The University of Tokyo',
  500: 'UTC Fire and Security',
  501: 'Cool Webthings Limited',
  502: 'DJO Global',
  503: 'Gelliner Limited',
  504: 'Anyka (Guangzhou) Microelectronics Technology Co, LTD',
  505: 'Medtronic, Inc.',
  506: 'Gozio, Inc.',
  507: 'Form Lifting, LLC',
  508: 'Wahoo Fitness, LLC',
  509: 'Kontakt Micro-Location Sp. z o.o.',
  510: 'Radio System Corporation',
  511: 'Freescale Semiconductor, Inc.',
  512: 'Verifone Systems PTe Ltd. Taiwan Branch',
  513: 'AR Timing',
  514: 'Rigado LLC',
  515: 'Kemppi Oy',
  516: 'Tapcentive Inc.',
  517: 'Smartbotics Inc.',
  518: 'Otter Products, LLC',
  519: 'STEMP Inc.',
  520: 'LumiGeek LLC',
  521: 'InvisionHeart Inc.',
  522: 'Macnica Inc. ',
  523: 'Jaguar Land Rover Limited',
  524: 'CoroWare Technologies, Inc',
  525: 'Simplo Technology Co., LTD',
  526: 'Omron Healthcare Co., LTD',
  527: 'Comodule GMBH',
  528: 'ikeGPS',
  529: 'Telink Semiconductor Co. Ltd',
  530: 'Interplan Co., Ltd',
  531: 'Wyler AG',
  532: 'IK Multimedia Production srl',
  533: 'Lukoton Experience Oy',
  534: 'MTI Ltd',
  535: 'Tech4home, Lda',
  536: 'Hiotech AB',
  537: 'DOTT Limited',
  538: 'Blue Speck Labs, LLC',
  539: 'Cisco Systems, Inc',
  540: 'Mobicomm Inc',
  541: 'Edamic',
  542: 'Goodnet, Ltd',
  543: 'Luster Leaf Products Inc',
  544: 'Manus Machina BV',
  545: 'Mobiquity Networks Inc',
  546: 'Praxis Dynamics',
  547: 'Philip Morris Products S.A.',
  548: 'Comarch SA',
  549: 'Nestl Nespresso S.A.',
  550: 'Merlinia A/S',
  551: 'LifeBEAM Technologies',
  552: 'Twocanoes Labs, LLC',
  553: 'Muoverti Limited',
  554: 'Stamer Musikanlagen GMBH',
  555: 'Tesla Motors',
  556: 'Pharynks Corporation',
  557: 'Lupine',
  558: 'Siemens AG',
  559: 'Huami (Shanghai) Culture Communication CO., LTD',
  560: 'Foster Electric Company, Ltd',
  561: 'ETA SA',
  562: 'x-Senso Solutions Kft',
  563: 'Shenzhen SuLong Communication Ltd',
  564: 'FengFan (BeiJing) Technology Co, Ltd',
  565: 'Qrio Inc',
  566: 'Pitpatpet Ltd',
  567: 'MSHeli s.r.l.',
  568: 'Trakm8 Ltd',
  569: 'JIN CO, Ltd',
  570: 'Alatech Tehnology',
  571: 'Beijing CarePulse Electronic Technology Co, Ltd',
  572: 'Awarepoint',
  573: 'ViCentra B.V.',
  574: 'Raven Industries',
  575: 'WaveWare Technologies Inc.',
  576: 'Argenox Technologies',
  577: 'Bragi GmbH',
  578: '16Lab Inc',
  579: 'Masimo Corp',
  580: 'Iotera Inc',
  581: 'Endress+Hauser',
  582: 'ACKme Networks, Inc.',
  583: 'FiftyThree Inc.',
  584: 'Parker Hannifin Corp',
  585: 'Transcranial Ltd',
  586: 'Uwatec AG',
  587: 'Orlan LLC',
  588: 'Blue Clover Devices',
  589: 'M-Way Solutions GmbH',
  590: 'Microtronics Engineering GmbH',
  591: 'Schneider Schreibgerte GmbH',
  592: 'Sapphire Circuits LLC',
  593: 'Lumo Bodytech Inc.',
  594: 'UKC Technosolution',
  595: 'Xicato Inc.',
  596: 'Playbrush',
  597: 'Dai Nippon Printing Co., Ltd.',
  598: 'G24 Power Limited',
  599: 'AdBabble Local Commerce Inc.',
  600: 'Devialet SA',
  601: 'ALTYOR',
  602: 'University of Applied Sciences Valais/Haute Ecole Valaisanne',
  603: 'Five Interactive, LLC dba Zendo',
  604: 'NetEaseHangzhouNetwork co.Ltd.',
  605: 'Lexmark International Inc.',
  606: 'Fluke Corporation',
  607: 'Yardarm Technologies',
  608: 'SensaRx',
  609: 'SECVRE GmbH',
  610: 'Glacial Ridge Technologies',
  611: 'Identiv, Inc.',
  612: 'DDS, Inc.',
  613: 'SMK Corporation',
  614: 'Schawbel Technologies LLC',
  615: 'XMI Systems SA',
  616: 'Cerevo',
  617: 'Torrox GmbH & Co KG',
  618: 'Gemalto',
  619: 'DEKA Research & Development Corp.',
  620: 'Domster Tadeusz Szydlowski',
  621: 'Technogym SPA',
  622: 'FLEURBAEY BVBA',
  623: 'Aptcode Solutions',
  624: 'LSI ADL Technology',
  625: 'Animas Corp',
  626: 'Alps Electric Co., Ltd.',
  627: 'OCEASOFT',
  628: 'Motsai Research',
  629: 'Geotab',
  630: 'E.G.O. Elektro-Gertebau GmbH',
  631: 'bewhere inc',
  632: 'Johnson Outdoors Inc',
  633: 'steute Schaltgerate GmbH & Co. KG',
  634: 'Ekomini inc.',
  635: 'DEFA AS',
  636: 'Aseptika Ltd',
  637: 'HUAWEI Technologies Co., Ltd. ( )',
  638: 'HabitAware, LLC',
  639: 'ruwido austria gmbh',
  640: 'ITEC corporation',
  641: 'StoneL',
  642: 'Sonova AG',
  643: 'Maven Machines, Inc.',
  644: 'Synapse Electronics',
  645: 'Standard Innovation Inc.',
  646: 'RF Code, Inc.',
  647: 'Wally Ventures S.L.',
  648: 'Willowbank Electronics Ltd',
  649: 'SK Telecom',
  650: 'Jetro AS',
  651: 'Code Gears LTD',
  652: 'NANOLINK APS',
  653: 'IF, LLC',
  654: 'RF Digital Corp',
  655: 'Church & Dwight Co., Inc',
  656: 'Multibit Oy',
  657: 'CliniCloud Inc',
  658: 'SwiftSensors',
  659: 'Blue Bite',
  660: 'ELIAS GmbH',
  661: 'Sivantos GmbH',
  662: 'Petzl',
  663: 'storm power ltd',
  664: 'EISST Ltd',
  665: 'Inexess Technology Simma KG',
  666: 'Currant, Inc.',
  667: 'C2 Development, Inc.',
  668: 'Blue Sky Scientific, LLC',
  669: 'ALOTTAZS LABS, LLC',
  670: 'Kupson spol. s r.o.',
  671: 'Areus Engineering GmbH',
  672: 'Impossible Camera GmbH',
  673: 'InventureTrack Systems',
  674: 'LockedUp',
  675: 'Itude',
  676: 'Pacific Lock Company',
  677: 'Tendyron Corporation ( )',
  678: 'Robert Bosch GmbH',
  679: 'Illuxtron international B.V.',
  680: 'miSport Ltd.',
  681: 'Chargelib',
  682: 'Doppler Lab',
  683: 'BBPOS Limited',
  684: 'RTB Elektronik GmbH & Co. KG',
  685: 'Rx Networks, Inc.',
  686: 'WeatherFlow, Inc.',
  687: 'Technicolor USA Inc.',
  688: 'Bestechnic(Shanghai),Ltd',
  689: 'Raden Inc',
  690: 'JouZen Oy',
  691: 'CLABER S.P.A.',
  692: 'Hyginex, Inc.',
  693: 'HANSHIN ELECTRIC RAILWAY CO.,LTD.',
  694: 'Schneider Electric',
  695: 'Oort Technologies LLC',
  696: 'Chrono Therapeutics',
  697: 'Rinnai Corporation',
  698: 'Swissprime Technologies AG',
  699: 'Koha.,Co.Ltd',
  700: 'Genevac Ltd',
  701: 'Chemtronics',
  702: 'Seguro Technology Sp. z o.o.',
  703: 'Redbird Flight Simulations',
  704: 'Dash Robotics',
  705: 'LINE Corporation',
  706: 'Guillemot Corporation',
  707: 'Techtronic Power Tools Technology Limited',
  708: 'Wilson Sporting Goods',
  709: 'Lenovo (Singapore) Pte Ltd. ( )',
  710: 'Ayatan Sensors',
  711: 'Electronics Tomorrow Limited',
  712: 'VASCO Data Security International, Inc.',
  713: 'PayRange Inc.',
  714: 'ABOV Semiconductor',
  715: 'AINA-Wireless Inc.',
  716: 'Eijkelkamp Soil & Water',
  717: 'BMA ergonomics b.v.',
  718: 'Teva Branded Pharmaceutical Products R&D, Inc.',
  719: 'Anima',
  720: '3M',
  721: 'Empatica Srl',
  722: 'Afero, Inc.',
  723: 'Powercast Corporation',
  724: 'Secuyou ApS',
  725: 'OMRON Corporation',
  726: 'Send Solutions',
  727: 'NIPPON SYSTEMWARE CO.,LTD.',
  728: 'Neosfar',
  729: 'Fliegl Agrartechnik GmbH',
  730: 'Gilvader',
  731: 'Digi International Inc (R)',
  732: 'DeWalch Technologies, Inc.',
  733: 'Flint Rehabilitation Devices, LLC',
  734: 'Samsung SDS Co., Ltd.',
  735: 'Blur Product Development',
  736: 'University of Michigan',
  737: 'Victron Energy BV',
  738: 'NTT docomo',
  739: 'Carmanah Technologies Corp.',
  740: 'Bytestorm Ltd.',
  741: 'Espressif Incorporated ( () )',
  742: 'Unwire',
  743: 'Connected Yard, Inc.',
  744: 'American Music Environments',
  745: 'Sensogram Technologies, Inc.',
  746: 'Fujitsu Limited',
  747: 'Ardic Technology',
  748: 'Delta Systems, Inc',
  749: 'HTC Corporation',
  750: 'Citizen Holdings Co., Ltd.',
  751: 'SMART-INNOVATION.inc',
  752: 'Blackrat Software',
  753: 'The Idea Cave, LLC',
  754: 'GoPro, Inc.',
  755: 'AuthAir, Inc',
  756: 'Vensi, Inc.',
  757: 'Indagem Tech LLC',
  758: 'Intemo Technologies',
  759: 'DreamVisions co., Ltd.',
  760: 'Runteq Oy Ltd',
  761: 'IMAGINATION TECHNOLOGIES LTD',
  762: 'CoSTAR TEchnologies',
  763: 'Clarius Mobile Health Corp.',
  764: 'Shanghai Frequen Microelectronics Co., Ltd.',
  765: 'Uwanna, Inc.',
  766: 'Lierda Science & Technology Group Co., Ltd.',
  767: 'Silicon Laboratories',
  768: 'World Moto Inc.',
  769: 'Giatec Scientific Inc.',
  770: 'Loop Devices, Inc',
  771: 'IACA electronique',
  772: 'Martians Inc',
  773: 'Swipp ApS',
  774: 'Life Laboratory Inc.',
  775: 'FUJI INDUSTRIAL CO.,LTD.',
  776: 'Surefire, LLC',
  777: 'Dolby Labs',
  778: 'Ellisys',
  779: 'Magnitude Lighting Converters',
  780: 'Hilti AG',
  781: 'Devdata S.r.l.',
  782: 'Deviceworx',
  783: 'Shortcut Labs',
  784: 'SGL Italia S.r.l.',
  785: 'PEEQ DATA',
  786: 'Ducere Technologies Pvt Ltd',
  787: 'DiveNav, Inc.',
  788: 'RIIG AI Sp. z o.o.',
  789: 'Thermo Fisher Scientific',
  790: 'AG Measurematics Pvt. Ltd.',
  791: 'CHUO Electronics CO., LTD.',
  792: 'Aspenta International',
  793: 'Eugster Frismag AG',
  794: 'Amber wireless GmbH',
  795: 'HQ Inc',
  796: 'Lab Sensor Solutions',
  797: 'Enterlab ApS',
  798: 'Eyefi, Inc.',
  799: 'MetaSystem S.p.A.',
  800: 'SONO ELECTRONICS. CO., LTD',
  801: 'Jewelbots',
  802: 'Compumedics Limited',
  803: 'Rotor Bike Components',
  804: 'Astro, Inc.',
  805: 'Amotus Solutions',
  806: 'Healthwear Technologies (Changzhou)Ltd',
  807: 'Essex Electronics',
  808: 'Grundfos A/S',
  809: 'Eargo, Inc.',
  810: 'Electronic Design Lab',
  811: 'ESYLUX',
  812: 'NIPPON SMT.CO.,Ltd',
  813: 'BM innovations GmbH',
  814: 'indoormap',
  815: 'OttoQ Inc',
  816: 'North Pole Engineering',
  817: '3flares Technologies Inc.',
  818: 'Electrocompaniet A.S.',
  819: 'Mul-T-Lock',
  820: 'Corentium AS',
  821: 'Enlighted Inc',
  822: 'GISTIC',
  823: 'AJP2 Holdings, LLC',
  824: 'COBI GmbH',
  825: 'Blue Sky Scientific, LLC',
  826: 'Appception, Inc.',
  827: 'Courtney Thorne Limited',
  828: 'Virtuosys',
  829: 'TPV Technology Limited',
  830: 'Monitra SA',
  831: 'Automation Components, Inc.',
  832: 'Letsense s.r.l.',
  833: 'Etesian Technologies LLC',
  834: 'GERTEC BRASIL LTDA.',
  835: 'Drekker Development Pty. Ltd.',
  836: 'Whirl Inc',
  837: 'Locus Positioning',
  838: 'Acuity Brands Lighting, Inc',
  839: 'Prevent Biometrics',
  840: 'Arioneo',
  841: 'VersaMe',
  842: 'Vaddio',
  843: 'Libratone A/S',
  844: 'HM Electronics, Inc.',
  845: 'TASER International, Inc.',
  846: 'SafeTrust Inc.',
  847: 'Heartland Payment Systems',
  848: 'Bitstrata Systems Inc.',
  849: 'Pieps GmbH',
  850: 'iRiding(Xiamen)Technology Co.,Ltd.',
  851: 'Alpha Audiotronics, Inc.',
  852: 'TOPPAN FORMS CO.,LTD.',
  853: 'Sigma Designs, Inc.',
  854: 'Spectrum Brands, Inc.',
  855: 'Polymap Wireless',
  856: 'MagniWare Ltd.',
  857: 'Novotec Medical GmbH',
  858: 'Medicom Innovation Partner a/s',
  859: 'Matrix Inc.',
  860: 'Eaton Corporation',
  861: 'KYS',
  862: 'Naya Health, Inc.',
  863: 'Acromag',
  864: 'Insulet Corporation',
  865: 'Wellinks Inc.',
  866: 'ON Semiconductor',
  867: 'FREELAP SA',
  868: 'Favero Electronics Srl',
  869: 'BioMech Sensor LLC',
  870: 'BOLTT Sports technologies Private limited',
  871: 'Saphe International',
  872: 'Metormote AB',
  873: 'littleBits',
  874: 'SetPoint Medical',
  875: 'BRControls Products BV',
  876: 'Zipcar',
  877: 'AirBolt Pty Ltd',
  878: 'KeepTruckin Inc',
  879: 'Motiv, Inc.',
  880: 'Wazombi Labs O',
  881: 'ORBCOMM',
  882: 'Nixie Labs, Inc.',
  883: 'AppNearMe Ltd',
  884: 'Holman Industries',
  885: 'Expain AS',
  886: 'Electronic Temperature Instruments Ltd',
  887: 'Plejd AB',
  888: 'Propeller Health',
  889: 'Shenzhen iMCO Electronic Technology Co.,Ltd',
  890: 'Algoria',
  891: 'Apption Labs Inc.',
  892: 'Cronologics Corporation',
  893: 'MICRODIA Ltd.',
  894: 'lulabytes S.L.',
  895: 'Nestec S.A.',
  896: 'LLC MEGA - F service',
  897: 'Sharp Corporation',
  898: 'Precision Outcomes Ltd',
  899: 'Kronos Incorporated',
  900: 'OCOSMOS Co., Ltd.',
  901: 'Embedded Electronic Solutions Ltd. dba e2Solutions',
  902: 'Aterica Inc.',
  903: 'BluStor PMC, Inc.',
  904: 'Kapsch TrafficCom AB',
  905: 'ActiveBlu Corporation',
  906: 'Kohler Mira Limited',
  907: 'Noke',
  908: 'Appion Inc.',
  909: 'Resmed Ltd',
  910: 'Crownstone B.V.',
  911: 'Xiaomi Inc.',
  912: 'INFOTECH s.r.o.',
  913: 'Thingsquare AB',
  914: 'T&D',
  915: 'LAVAZZA S.p.A.',
  916: 'Netclearance Systems, Inc.',
  917: 'SDATAWAY',
  918: 'BLOKS GmbH',
  919: 'LEGO System A/S',
  920: 'Thetatronics Ltd',
  921: 'Nikon Corporation',
  922: 'NeST',
  923: 'South Silicon Valley Microelectronics',
  924: 'ALE International',
  925: 'CareView Communications, Inc.',
  926: 'SchoolBoard Limited',
  927: 'Molex Corporation',
  928: 'IVT Wireless Limited',
  929: 'Alpine Labs LLC',
  930: 'Candura Instruments',
  931: 'SmartMovt Technology Co., Ltd',
  932: 'Token Zero Ltd',
  933: 'ACE CAD Enterprise Co., Ltd. (ACECAD)',
  934: 'Medela, Inc',
  935: 'AeroScout',
  936: 'Esrille Inc.',
  937: 'THINKERLY SRL',
  938: 'Exon Sp. z o.o.',
  939: 'Meizu Technology Co., Ltd.',
  940: 'Smablo LTD',
  941: 'XiQ',
  942: 'Allswell Inc.',
  943: 'Comm-N-Sense Corp DBA Verigo',
  944: 'VIBRADORM GmbH',
  945: 'Otodata Wireless Network Inc.',
  946: 'Propagation Systems Limited',
  947: 'Midwest Instruments & Controls',
  948: 'Alpha Nodus, inc.',
  949: 'petPOMM, Inc',
  950: 'Mattel',
  951: 'Airbly Inc.',
  952: 'A-Safe Limited',
  953: 'FREDERIQUE CONSTANT SA',
  954: 'Maxscend Microelectronics Company Limited',
  955: 'Abbott Diabetes Care',
  956: 'ASB Bank Ltd',
  957: 'amadas',
  958: 'Applied Science, Inc.',
  959: 'iLumi Solutions Inc.',
  960: 'Arch Systems Inc.',
  961: 'Ember Technologies, Inc.',
  962: 'Snapchat Inc',
  963: 'Casambi Technologies Oy',
  964: 'Pico Technology Inc.',
  965: 'St. Jude Medical, Inc.',
  966: 'Intricon',
  967: 'Structural Health Systems, Inc.',
  968: 'Avvel International',
  969: 'Gallagher Group',
  970: 'In2things Automation Pvt. Ltd.',
  971: 'SYSDEV Srl',
  972: 'Vonkil Technologies Ltd',
  973: 'Wynd Technologies, Inc.',
  974: 'CONTRINEX S.A.',
  975: 'MIRA, Inc.',
  976: 'Watteam Ltd',
  977: 'Density Inc.',
  978: 'IOT Pot India Private Limited',
  979: 'Sigma Connectivity AB',
  980: 'PEG PEREGO SPA',
  981: 'Wyzelink Systems Inc.',
  982: 'Yota Devices LTD',
  983: 'FINSECUR',
  984: 'Zen-Me Labs Ltd',
  985: '3IWare Co., Ltd.',
  986: 'EnOcean GmbH',
  987: 'Instabeat, Inc',
  988: 'Nima Labs',
  989: 'Andreas Stihl AG & Co. KG',
  990: 'Nathan Rhoades LLC',
  991: 'Grob Technologies, LLC',
  992: 'Actions (Zhuhai) Technology Co., Limited',
  993: 'SPD Development Company Ltd',
  994: 'Sensoan Oy',
  995: 'Qualcomm Life Inc',
  996: 'Chip-ing AG',
  997: 'ffly4u',
  998: 'IoT Instruments Oy',
  999: 'TRUE Fitness Technology',
  1000: 'Reiner Kartengeraete GmbH & Co. KG.',
  1001: 'SHENZHEN LEMONJOY TECHNOLOGY CO., LTD.',
  1002: 'Hello Inc.',
  1003: 'Evollve Inc.',
  1004: 'Jigowatts Inc.',
  1005: 'BASIC MICRO.COM,INC.',
  1006: 'CUBE TECHNOLOGIES',
  1007: 'foolography GmbH',
  1008: 'CLINK',
  1009: 'Hestan Smart Cooking Inc.',
  1010: 'WindowMaster A/S',
  1011: 'Flowscape AB',
  1012: 'PAL Technologies Ltd',
  1013: 'WHERE, Inc.',
  1014: 'Iton Technology Corp.',
  1015: 'Owl Labs Inc.',
  1016: 'Rockford Corp.',
  1017: 'Becon Technologies Co.,Ltd.',
  1018: 'Vyassoft Technologies Inc',
  1019: 'Nox Medical',
  1020: 'Kimberly-Clark',
  1021: 'Trimble Navigation Ltd.',
  1022: 'Littelfuse',
  1023: 'Withings',
  1024: 'i-developer IT Beratung UG',
  1026: 'Sears Holdings Corporation',
  1027: 'Gantner Electronic GmbH',
  1028: 'Authomate Inc',
  1029: 'Vertex International, Inc.',
  1030: 'Airtago',
  1031: 'Swiss Audio SA',
  1032: 'ToGetHome Inc.',
  1033: 'AXIS',
  1034: 'Openmatics',
  1035: 'Jana Care Inc.',
  1036: 'Senix Corporation',
  1037: 'NorthStar Battery Company, LLC',
  1038: 'SKF (U.K.) Limited',
  1039: 'CO-AX Technology, Inc.',
  1040: 'Fender Musical Instruments',
  1041: 'Luidia Inc',
  1042: 'SEFAM',
  1043: 'Wireless Cables Inc',
  1044: 'Lightning Protection International Pty Ltd',
  1045: 'Uber Technologies Inc',
  1046: 'SODA GmbH',
  1047: 'Fatigue Science',
  1048: 'Alpine Electronics Inc.',
  1049: 'Novalogy LTD',
  1050: 'Friday Labs Limited',
  1051: 'OrthoAccel Technologies',
  1052: 'WaterGuru, Inc.',
  1053: 'Benning Elektrotechnik und Elektronik GmbH & Co. KG',
  1054: 'Dell Computer Corporation',
  1055: 'Kopin Corporation',
  1056: 'TecBakery GmbH',
  1057: 'Backbone Labs, Inc.',
  1058: 'DELSEY SA',
  1059: 'Chargifi Limited',
  1060: 'Trainesense Ltd.',
  1061: 'Unify Software and Solutions GmbH & Co. KG',
  1062: 'Husqvarna AB',
  1063: 'Focus fleet and fuel management inc',
  1064: 'SmallLoop, LLC',
  1065: 'Prolon Inc.',
  1066: 'BD Medical',
  1067: 'iMicroMed Incorporated',
  1068: 'Ticto N.V.',
  1069: 'Meshtech AS',
  1070: 'MemCachier Inc.',
  1071: 'Danfoss A/S',
  1072: 'SnapStyk Inc.',
  1073: 'Amyway Corporation',
  1074: 'Silk Labs, Inc.',
  1075: 'Pillsy Inc.',
  1076: 'Hatch Baby, Inc.',
  1077: 'Blocks Wearables Ltd.',
  1078: 'Drayson Technologies (Europe) Limited',
  1079: 'eBest IOT Inc.',
  1080: 'Helvar Ltd',
  1081: 'Radiance Technologies',
  1082: 'Nuheara Limited',
  1083: 'Appside co., ltd.',
  1084: 'DeLaval',
  1085: 'Coiler Corporation',
  1086: 'Thermomedics, Inc.',
  1087: 'Tentacle Sync GmbH',
  1088: 'Valencell, Inc.',
  1089: 'iProtoXi Oy',
  1090: 'SECOM CO., LTD.',
  1091: 'Tucker International LLC',
  1092: 'Metanate Limited',
  1093: 'Kobian Canada Inc.',
  1094: 'NETGEAR, Inc.',
  1095: 'Fabtronics Australia Pty Ltd',
  1096: 'Grand Centrix GmbH',
  1097: '1UP USA.com llc',
  1098: 'SHIMANO INC.',
  1099: 'Nain Inc.',
  1100: 'LifeStyle Lock, LLC',
  1101: 'VEGA Grieshaber KG',
  1102: 'Xtrava Inc.',
  1103: 'TTS Tooltechnic Systems AG & Co. KG',
  1104: 'Teenage Engineering AB',
  1105: 'Tunstall Nordic AB',
  1106: 'Svep Design Center AB',
  1107: 'GreenPeak Technologies BV',
  1108: 'Sphinx Electronics GmbH & Co KG',
  1109: 'Atomation',
  1110: 'Nemik Consulting Inc',
  1111: 'RF INNOVATION',
  1112: 'Mini Solution Co., Ltd.',
  1113: 'Lumenetix, Inc',
  1114: '2048450 Ontario Inc',
  1115: 'SPACEEK LTD',
  1116: 'Delta T Corporation',
  1117: 'Boston Scientific Corporation',
  1118: 'Nuviz, Inc.',
  1119: 'Real Time Automation, Inc.',
  1120: 'Kolibree',
  1121: 'vhf elektronik GmbH',
  1122: 'Bonsai Systems GmbH',
  1123: 'Fathom Systems Inc.',
  1124: 'Bellman & Symfon',
  1125: 'International Forte Group LLC',
  1126: 'CycleLabs Solutions inc.',
  1127: 'Codenex Oy',
  1128: 'Kynesim Ltd',
  1129: 'Palago AB',
  1130: 'INSIGMA INC.',
  1131: 'PMD Solutions',
  1132: 'Qingdao Realtime Technology Co., Ltd.',
  1133: 'BEGA Gantenbrink-Leuchten KG',
  1134: 'Pambor Ltd.',
  65535: 'SPECIAL USE/DEFAULT'
};

export const parseBluetoothVendor = (str: string) => {
  const id = parseInt(str);
  !isNaN(id) ? bluetoothVendors[id] || 'Unknown' : null;
};
