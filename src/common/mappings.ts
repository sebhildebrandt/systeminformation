import { PLATFORM, WINDOWS } from './const';
import { CpuBrandObject } from './types';

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
  0x0000: 'Ericsson Technology Licensing',
  0x0001: 'Nokia Mobile Phones',
  0x0002: 'Intel Corp.',
  0x0003: 'IBM Corp.',
  0x0004: 'Toshiba Corp.',
  0x0005: '3Com',
  0x0006: 'Microsoft',
  0x0007: 'Lucent',
  0x0008: 'Motorola',
  0x0009: 'Infineon Technologies AG',
  0x000a: 'Cambridge Silicon Radio',
  0x000b: 'Silicon Wave',
  0x000c: 'Digianswer A/S',
  0x000d: 'Texas Instruments Inc.',
  0x000e: 'Ceva, Inc. (formerly Parthus Technologies, Inc.)',
  0x000f: 'Broadcom Corporation',
  0x0010: 'Mitel Semiconductor',
  0x0011: 'Widcomm, Inc',
  0x0012: 'Zeevo, Inc.',
  0x0013: 'Atmel Corporation',
  0x0014: 'Mitsubishi Electric Corporation',
  0x0015: 'RTX Telecom A/S',
  0x0016: 'KC Technology Inc.',
  0x0017: 'NewLogic',
  0x0018: 'Transilica, Inc.',
  0x0019: 'Rohde & Schwarz GmbH & Co. KG',
  0x001a: 'TTPCom Limited',
  0x001b: 'Signia Technologies, Inc.',
  0x001c: 'Conexant Systems Inc.',
  0x001d: 'Qualcomm',
  0x001e: 'Inventel',
  0x001f: 'AVM Berlin',
  0x0020: 'BandSpeed, Inc.',
  0x0021: 'Mansella Ltd',
  0x0022: 'NEC Corporation',
  0x0023: 'WavePlus Technology Co., Ltd.',
  0x0024: 'Alcatel',
  0x0025: 'NXP Semiconductors (formerly Philips Semiconductors)',
  0x0026: 'C Technologies',
  0x0027: 'Open Interface',
  0x0028: 'R F Micro Devices',
  0x0029: 'Hitachi Ltd',
  0x002a: 'Symbol Technologies, Inc.',
  0x002b: 'Tenovis',
  0x002c: 'Macronix International Co. Ltd.',
  0x002d: 'GCT Semiconductor',
  0x002e: 'Norwood Systems',
  0x002f: 'MewTel Technology Inc.',
  0x0030: 'ST Microelectronics',
  0x0031: 'Synopsis',
  0x0032: 'Red-M (Communications) Ltd',
  0x0033: 'Commil Ltd',
  0x0034: 'Computer Access Technology Corporation (CATC)',
  0x0035: 'Eclipse (HQ Espana) S.L.',
  0x0036: 'Renesas Electronics Corporation',
  0x0037: 'Mobilian Corporation',
  0x0038: 'Terax',
  0x0039: 'Integrated System Solution Corp.',
  0x003a: 'Matsushita Electric Industrial Co., Ltd.',
  0x003b: 'Gennum Corporation',
  0x003c: 'BlackBerry Limited (formerly Research In Motion)',
  0x003d: 'IPextreme, Inc.',
  0x003e: 'Systems and Chips, Inc.',
  0x003f: 'Bluetooth SIG, Inc.',
  0x0040: 'Seiko Epson Corporation',
  0x0041: 'Integrated Silicon Solution Taiwan, Inc.',
  0x0042: 'CONWISE Technology Corporation Ltd',
  0x0043: 'PARROT SA',
  0x0044: 'Socket Mobile',
  0x0045: 'Atheros Communications, Inc.',
  0x0046: 'MediaTek, Inc.',
  0x0047: 'Bluegiga',
  0x0048: 'Marvell Technology Group Ltd.',
  0x0049: '3DSP Corporation',
  0x004a: 'Accel Semiconductor Ltd.',
  0x004b: 'Continental Automotive Systems',
  0x004c: 'Apple, Inc.',
  0x004d: 'Staccato Communications, Inc.',
  0x004e: 'Avago Technologies',
  0x004f: 'APT Licensing Ltd.',
  0x0050: 'SiRF Technology',
  0x0051: 'Tzero Technologies, Inc.',
  0x0052: 'J&M Corporation',
  0x0053: 'Free2move AB',
  0x0054: '3DiJoy Corporation',
  0x0055: 'Plantronics, Inc.',
  0x0056: 'Sony Ericsson Mobile Communications',
  0x0057: 'Harman International Industries, Inc.',
  0x0058: 'Vizio, Inc.',
  0x0059: 'Nordic Semiconductor ASA',
  0x005a: 'EM Microelectronic-Marin SA',
  0x005b: 'Ralink Technology Corporation',
  0x005c: 'Belkin International, Inc.',
  0x005d: 'Realtek Semiconductor Corporation',
  0x005e: 'Stonestreet One, LLC',
  0x005f: 'Wicentric, Inc.',
  0x0060: 'RivieraWaves S.A.S',
  0x0061: 'RDA Microelectronics',
  0x0062: 'Gibson Guitars',
  0x0063: 'MiCommand Inc.',
  0x0064: 'Band XI International, LLC',
  0x0065: 'Hewlett-Packard Company',
  0x0066: '9Solutions Oy',
  0x0067: 'GN Netcom A/S',
  0x0068: 'General Motors',
  0x0069: 'A&D Engineering, Inc.',
  0x006a: 'MindTree Ltd.',
  0x006b: 'Polar Electro OY',
  0x006c: 'Beautiful Enterprise Co., Ltd.',
  0x006d: 'BriarTek, Inc.',
  0x006e: 'Summit Data Communications, Inc.',
  0x006f: 'Sound ID',
  0x0070: 'Monster, LLC',
  0x0071: 'connectBlue AB',
  0x0072: 'ShangHai Super Smart Electronics Co. Ltd.',
  0x0073: 'Group Sense Ltd.',
  0x0074: 'Zomm, LLC',
  0x0075: 'Samsung Electronics Co. Ltd.',
  0x0076: 'Creative Technology Ltd.',
  0x0077: 'Laird Technologies',
  0x0078: 'Nike, Inc.',
  0x0079: 'lesswire AG',
  0x007a: 'MStar Semiconductor, Inc.',
  0x007b: 'Hanlynn Technologies',
  0x007c: 'A & R Cambridge',
  0x007d: 'Seers Technology Co. Ltd',
  0x007e: 'Sports Tracking Technologies Ltd.',
  0x007f: 'Autonet Mobile',
  0x0080: 'DeLorme Publishing Company, Inc.',
  0x0081: 'WuXi Vimicro',
  0x0082: 'Sennheiser Communications A/S',
  0x0083: 'TimeKeeping Systems, Inc.',
  0x0084: 'Ludus Helsinki Ltd.',
  0x0085: 'BlueRadios, Inc.',
  0x0086: 'equinox AG',
  0x0087: 'Garmin International, Inc.',
  0x0088: 'Ecotest',
  0x0089: 'GN ReSound A/S',
  0x008a: 'Jawbone',
  0x008b: 'Topcorn Positioning Systems, LLC',
  0x008c: 'Gimbal Inc. (formerly Qualcomm Labs, Inc. and Qualcomm Retail Solutions, Inc.)',
  0x008d: 'Zscan Software',
  0x008e: 'Quintic Corp.',
  0x008f: 'Stollman E+V GmbH',
  0x0090: 'Funai Electric Co., Ltd.',
  0x0091: 'Advanced PANMOBIL Systems GmbH & Co. KG',
  0x0092: 'ThinkOptics, Inc.',
  0x0093: 'Universal Electronics, Inc.',
  0x0094: 'Airoha Technology Corp.',
  0x0095: 'NEC Lighting, Ltd.',
  0x0096: 'ODM Technology, Inc.',
  0x0097: 'ConnecteDevice Ltd.',
  0x0098: 'zer01.tv GmbH',
  0x0099: 'i.Tech Dynamic Global Distribution Ltd.',
  0x009a: 'Alpwise',
  0x009b: 'Jiangsu Toppower Automotive Electronics Co., Ltd.',
  0x009c: 'Colorfy, Inc.',
  0x009d: 'Geoforce Inc.',
  0x009e: 'Bose Corporation',
  0x009f: 'Suunto Oy',
  0x00a0: 'Kensington Computer Products Group',
  0x00a1: 'SR-Medizinelektronik',
  0x00a2: 'Vertu Corporation Limited',
  0x00a3: 'Meta Watch Ltd.',
  0x00a4: 'LINAK A/S',
  0x00a5: 'OTL Dynamics LLC',
  0x00a6: 'Panda Ocean Inc.',
  0x00a7: 'Visteon Corporation',
  0x00a8: 'ARP Devices Limited',
  0x00a9: 'Magneti Marelli S.p.A',
  0x00aa: 'CAEN RFID srl',
  0x00ab: 'Ingenieur-Systemgruppe Zahn GmbH',
  0x00ac: 'Green Throttle Games',
  0x00ad: 'Peter Systemtechnik GmbH',
  0x00ae: 'Omegawave Oy',
  0x00af: 'Cinetix',
  0x00b0: 'Passif Semiconductor Corp',
  0x00b1: 'Saris Cycling Group, Inc',
  0x00b2: 'Bekey A/S',
  0x00b3: 'Clarinox Technologies Pty. Ltd.',
  0x00b4: 'BDE Technology Co., Ltd.',
  0x00b5: 'Swirl Networks',
  0x00b6: 'Meso international',
  0x00b7: 'TreLab Ltd',
  0x00b8: 'Qualcomm Innovation Center, Inc. (QuIC)',
  0x00b9: 'Johnson Controls, Inc.',
  0x00ba: 'Starkey Laboratories Inc.',
  0x00bb: 'S-Power Electronics Limited',
  0x00bc: 'Ace Sensor Inc',
  0x00bd: 'Aplix Corporation',
  0x00be: 'AAMP of America',
  0x00bf: 'Stalmart Technology Limited',
  0x00c0: 'AMICCOM Electronics Corporation',
  0x00c1: 'Shenzhen Excelsecu Data Technology Co.,Ltd',
  0x00c2: 'Geneq Inc.',
  0x00c3: 'adidas AG',
  0x00c4: 'LG Electronics',
  0x00c5: 'Onset Computer Corporation',
  0x00c6: 'Selfly BV',
  0x00c7: 'Quuppa Oy.',
  0x00c8: 'GeLo Inc',
  0x00c9: 'Evluma',
  0x00ca: 'MC10',
  0x00cb: 'Binauric SE',
  0x00cc: 'Beats Electronics',
  0x00cd: 'Microchip Technology Inc.',
  0x00ce: 'Elgato Systems GmbH',
  0x00cf: 'ARCHOS SA',
  0x00d0: 'Dexcom, Inc.',
  0x00d1: 'Polar Electro Europe B.V.',
  0x00d2: 'Dialog Semiconductor B.V.',
  0x00d3: 'Taixingbang Technology (HK) Co,. LTD.',
  0x00d4: 'Kawantech',
  0x00d5: 'Austco Communication Systems',
  0x00d6: 'Timex Group USA, Inc.',
  0x00d7: 'Qualcomm Technologies, Inc.',
  0x00d8: 'Qualcomm Connected Experiences, Inc.',
  0x00d9: 'Voyetra Turtle Beach',
  0x00da: 'txtr GmbH',
  0x00db: 'Biosentronics',
  0x00dc: 'Procter & Gamble',
  0x00dd: 'Hosiden Corporation',
  0x00de: 'Muzik LLC',
  0x00df: 'Misfit Wearables Corp',
  0x00e0: 'Google',
  0x00e1: 'Danlers Ltd',
  0x00e2: 'Semilink Inc',
  0x00e3: 'inMusic Brands, Inc',
  0x00e4: 'L.S. Research Inc.',
  0x00e5: 'Eden Software Consultants Ltd.',
  0x00e6: 'Freshtemp',
  0x00e7: 'KS Technologies',
  0x00e8: 'ACTS Technologies',
  0x00e9: 'Vtrack Systems',
  0x00ea: 'Nielsen-Kellerman Company',
  0x00eb: 'Server Technology, Inc.',
  0x00ec: 'BioResearch Associates',
  0x00ed: 'Jolly Logic, LLC',
  0x00ee: 'Above Average Outcomes, Inc.',
  0x00ef: 'Bitsplitters GmbH',
  0x00f0: 'PayPal, Inc.',
  0x00f1: 'Witron Technology Limited',
  0x00f2: 'Aether Things Inc. (formerly Morse Project Inc.)',
  0x00f3: 'Kent Displays Inc.',
  0x00f4: 'Nautilus Inc.',
  0x00f5: 'Smartifier Oy',
  0x00f6: 'Elcometer Limited',
  0x00f7: 'VSN Technologies Inc.',
  0x00f8: 'AceUni Corp., Ltd.',
  0x00f9: 'StickNFind',
  0x00fa: 'Crystal Code AB',
  0x00fb: 'KOUKAAM a.s.',
  0x00fc: 'Delphi Corporation',
  0x00fd: 'ValenceTech Limited',
  0x00fe: 'Reserved',
  0x00ff: 'Typo Products, LLC',
  0x0100: 'TomTom International BV',
  0x0101: 'Fugoo, Inc',
  0x0102: 'Keiser Corporation',
  0x0103: 'Bang & Olufsen A/S',
  0x0104: 'PLUS Locations Systems Pty Ltd',
  0x0105: 'Ubiquitous Computing Technology Corporation',
  0x0106: 'Innovative Yachtter Solutions',
  0x0107: 'William Demant Holding A/S',
  0x0108: 'Chicony Electronics Co., Ltd.',
  0x0109: 'Atus BV',
  0x010a: 'Codegate Ltd.',
  0x010b: 'ERi, Inc.',
  0x010c: 'Transducers Direct, LLC',
  0x010d: 'Fujitsu Ten Limited',
  0x010e: 'Audi AG',
  0x010f: 'HiSilicon Technologies Co., Ltd.',
  0x0110: 'Nippon Seiki Co., Ltd.',
  0x0111: 'Steelseries ApS',
  0x0112: 'vyzybl Inc.',
  0x0113: 'Openbrain Technologies, Co., Ltd.',
  0x0114: 'Xensr',
  0x0115: 'e.solutions',
  0x0116: '1OAK Technologies',
  0x0117: 'Wimoto Technologies Inc',
  0x0118: 'Radius Networks, Inc.',
  0x0119: 'Wize Technology Co., Ltd.',
  0x011a: 'Qualcomm Labs, Inc.',
  0x011b: 'Aruba Networks',
  0x011c: 'Baidu',
  0x011d: 'Arendi AG',
  0x011e: 'Skoda Auto a.s.',
  0x011f: 'Volkswagon AG',
  0x0120: 'Porsche AG',
  0x0121: 'Sino Wealth Electronic Ltd.',
  0x0122: 'AirTurn, Inc.',
  0x0123: 'Kinsa, Inc.',
  0x0124: 'HID Global',
  0x0125: 'SEAT es',
  0x0126: 'Promethean Ltd.',
  0x0127: 'Salutica Allied Solutions',
  0x0128: 'GPSI Group Pty Ltd',
  0x0129: 'Nimble Devices Oy',
  0x012a: 'Changzhou Yongse Infotech Co., Ltd',
  0x012b: 'SportIQ',
  0x012c: 'TEMEC Instruments B.V.',
  0x012d: 'Sony Corporation',
  0x012e: 'ASSA ABLOY',
  0x012f: 'Clarion Co., Ltd.',
  0x0130: 'Warehouse Innovations',
  0x0131: 'Cypress Semiconductor Corporation',
  0x0132: 'MADS Inc',
  0x0133: 'Blue Maestro Limited',
  0x0134: 'Resolution Products, Inc.',
  0x0135: 'Airewear LLC',
  0x0136: 'Seed Labs, Inc. (formerly ETC sp. z.o.o.)',
  0x0137: 'Prestigio Plaza Ltd.',
  0x0138: 'NTEO Inc.',
  0x0139: 'Focus Systems Corporation',
  0x013a: 'Tencent Holdings Limited',
  0x013b: 'Allegion',
  0x013c: 'Murata Manufacuring Co., Ltd.',
  0x013e: 'Nod, Inc.',
  0x013f: 'B&B Manufacturing Company',
  0x0140: 'Alpine Electronics (China) Co., Ltd',
  0x0141: 'FedEx Services',
  0x0142: 'Grape Systems Inc.',
  0x0143: 'Bkon Connect',
  0x0144: 'Lintech GmbH',
  0x0145: 'Novatel Wireless',
  0x0146: 'Ciright',
  0x0147: 'Mighty Cast, Inc.',
  0x0148: 'Ambimat Electronics',
  0x0149: 'Perytons Ltd.',
  0x014a: 'Tivoli Audio, LLC',
  0x014b: 'Master Lock',
  0x014c: 'Mesh-Net Ltd',
  0x014d: 'Huizhou Desay SV Automotive CO., LTD.',
  0x014e: 'Tangerine, Inc.',
  0x014f: 'B&W Group Ltd.',
  0x0150: 'Pioneer Corporation',
  0x0151: 'OnBeep',
  0x0152: 'Vernier Software & Technology',
  0x0153: 'ROL Ergo',
  0x0154: 'Pebble Technology',
  0x0155: 'NETATMO',
  0x0156: 'Accumulate AB',
  0x0157: 'Anhui Huami Information Technology Co., Ltd.',
  0x0158: 'Inmite s.r.o.',
  0x0159: 'ChefSteps, Inc.',
  0x015a: 'micas AG',
  0x015b: 'Biomedical Research Ltd.',
  0x015c: 'Pitius Tec S.L.',
  0x015d: 'Estimote, Inc.',
  0x015e: 'Unikey Technologies, Inc.',
  0x015f: 'Timer Cap Co.',
  0x0160: 'AwoX',
  0x0161: 'yikes',
  0x0162: 'MADSGlobal NZ Ltd.',
  0x0163: 'PCH International',
  0x0164: 'Qingdao Yeelink Information Technology Co., Ltd.',
  0x0165: 'Milwaukee Tool (formerly Milwaukee Electric Tools)',
  0x0166: 'MISHIK Pte Ltd',
  0x0167: 'Bayer HealthCare',
  0x0168: 'Spicebox LLC',
  0x0169: 'emberlight',
  0x016a: 'Cooper-Atkins Corporation',
  0x016b: 'Qblinks',
  0x016c: 'MYSPHERA',
  0x016d: 'LifeScan Inc',
  0x016e: 'Volantic AB',
  0x016f: 'Podo Labs, Inc',
  0x0170: 'Roche Diabetes Care AG',
  0x0171: 'Amazon Fulfillment Service',
  0x0172: 'Connovate Technology Private Limited',
  0x0173: 'Kocomojo, LLC',
  0x0174: 'Everykey LLC',
  0x0175: 'Dynamic Controls',
  0x0176: 'SentriLock',
  0x0177: 'I-SYST inc.',
  0x0178: 'CASIO COMPUTER CO., LTD.',
  0x0179: 'LAPIS Semiconductor Co., Ltd.',
  0x017a: 'Telemonitor, Inc.',
  0x017b: 'taskit GmbH',
  0x017c: 'Daimler AG',
  0x017d: 'BatAndCat',
  0x017e: 'BluDotz Ltd',
  0x017f: 'XTel ApS',
  0x0180: 'Gigaset Communications GmbH',
  0x0181: 'Gecko Health Innovations, Inc.',
  0x0182: 'HOP Ubiquitous',
  0x0183: 'To Be Assigned',
  0x0184: 'Nectar',
  0x0185: 'bel’apps LLC',
  0x0186: 'CORE Lighting Ltd',
  0x0187: 'Seraphim Sense Ltd',
  0x0188: 'Unico RBC',
  0x0189: 'Physical Enterprises Inc.',
  0x018a: 'Able Trend Technology Limited',
  0x018b: 'Konica Minolta, Inc.',
  0x018c: 'Wilo SE',
  0x018d: 'Extron Design Services',
  0x018e: 'Fitbit, Inc.',
  0x018f: 'Fireflies Systems',
  0x0190: 'Intelletto Technologies Inc.',
  0x0191: 'FDK CORPORATION',
  0x0192: 'Cloudleaf, Inc',
  0x0193: 'Maveric Automation LLC',
  0x0194: 'Acoustic Stream Corporation',
  0x0195: 'Zuli',
  0x0196: 'Paxton Access Ltd',
  0x0197: 'WiSilica Inc',
  0x0198: 'Vengit Limited',
  0x0199: 'SALTO SYSTEMS S.L.',
  0x019a: 'TRON Forum (formerly T-Engine Forum)',
  0x019b: 'CUBETECH s.r.o.',
  0x019c: 'Cokiya Incorporated',
  0x019d: 'CVS Health',
  0x019e: 'Ceruus',
  0x019f: 'Strainstall Ltd',
  0x01a0: 'Channel Enterprises (HK) Ltd.',
  0x01a1: 'FIAMM',
  0x01a2: 'GIGALANE.CO.,LTD',
  0x01a3: 'EROAD',
  0x01a4: 'Mine Safety Appliances',
  0x01a5: 'Icon Health and Fitness',
  0x01a6: 'Asandoo GmbH',
  0x01a7: 'ENERGOUS CORPORATION',
  0x01a8: 'Taobao',
  0x01a9: 'Canon Inc.',
  0x01aa: 'Geophysical Technology Inc.',
  0x01ab: 'Facebook, Inc.',
  0x01ac: 'Nipro Diagnostics, Inc.',
  0x01ad: 'FlightSafety International',
  0x01ae: 'Earlens Corporation',
  0x01af: 'Sunrise Micro Devices, Inc.',
  0x01b0: 'Star Micronics Co., Ltd.',
  0x01b1: 'Netizens Sp. z o.o.',
  0x01b2: 'Nymi Inc.',
  0x01b3: 'Nytec, Inc.',
  0x01b4: 'Trineo Sp. z o.o.',
  0x01b5: 'Nest Labs Inc.',
  0x01b6: 'LM Technologies Ltd',
  0x01b7: 'General Electric Company',
  0x01b8: 'i+D3 S.L.',
  0x01b9: 'HANA Micron',
  0x01ba: 'Stages Cycling LLC',
  0x01bb: 'Cochlear Bone Anchored Solutions AB',
  0x01bc: 'SenionLab AB',
  0x01bd: 'Syszone Co., Ltd',
  0x01be: 'Pulsate Mobile Ltd.',
  0x01bf: 'Hong Kong HunterSun Electronic Limited',
  0x01c0: 'pironex GmbH',
  0x01c1: 'BRADATECH Corp.',
  0x01c2: 'Transenergooil AG',
  0x01c3: 'Bunch',
  0x01c4: 'DME Microelectronics',
  0x01c5: 'Bitcraze AB',
  0x01c6: 'HASWARE Inc.',
  0x01c7: 'Abiogenix Inc.',
  0x01c8: 'Poly-Control ApS',
  0x01c9: 'Avi-on',
  0x01ca: 'Laerdal Medical AS',
  0x01cb: 'Fetch My Pet',
  0x01cc: 'Sam Labs Ltd.',
  0x01cd: 'Chengdu Synwing Technology Ltd',
  0x01ce: 'HOUWA SYSTEM DESIGN, k.k.',
  0x01cf: 'BSH',
  0x01d0: 'Primus Inter Pares Ltd',
  0x01d1: 'August',
  0x01d2: 'Gill Electronics',
  0x01d3: 'Sky Wave Design',
  0x01d4: 'Newlab S.r.l.',
  0x01d5: 'ELAD srl',
  0x01d6: 'G-wearables inc.',
  0x01d7: 'Squadrone Systems Inc.',
  0x01d8: 'Code Corporation',
  0x01d9: 'Savant Systems LLC',
  0x01da: 'Logitech International SA',
  0x01db: 'Innblue Consulting',
  0x01dc: 'iParking Ltd.',
  0x01dd: 'Koninklijke Philips Electronics N.V.',
  0x01de: 'Minelab Electronics Pty Limited',
  0x01df: 'Bison Group Ltd.',
  0x01e0: 'Widex A/S',
  0x01e1: 'Jolla Ltd',
  0x01e2: 'Lectronix, Inc.',
  0x01e3: 'Caterpillar Inc',
  0x01e4: 'Freedom Innovations',
  0x01e5: 'Dynamic Devices Ltd',
  0x01e6: 'Technology Solutions (UK) Ltd',
  0x01e7: 'IPS Group Inc.',
  0x01e8: 'STIR',
  0x01e9: 'Sano, Inc',
  0x01ea: 'Advanced Application Design, Inc.',
  0x01eb: 'AutoMap LLC',
  0x01ec: 'Spreadtrum Communications Shanghai Ltd',
  0x01ed: 'CuteCircuit LTD',
  0x01ee: 'Valeo Service',
  0x01ef: 'Fullpower Technologies, Inc.',
  0x01f0: 'KloudNation',
  0x01f1: 'Zebra Technologies Corporation',
  0x01f2: 'Itron, Inc.',
  0x01f3: 'The University of Tokyo',
  0x01f4: 'UTC Fire and Security',
  0x01f5: 'Cool Webthings Limited',
  0x01f6: 'DJO Global',
  0x01f7: 'Gelliner Limited',
  0x01f8: 'Anyka (Guangzhou) Microelectronics Technology Co, LTD',
  0x01f9: 'Medtronic, Inc.',
  0x01fa: 'Gozio, Inc.',
  0x01fb: 'Form Lifting, LLC',
  0x01fc: 'Wahoo Fitness, LLC',
  0x01fd: 'Kontakt Micro-Location Sp. z o.o.',
  0x01fe: 'Radio System Corporation',
  0x01ff: 'Freescale Semiconductor, Inc.',
  0x0200: 'Verifone Systems PTe Ltd. Taiwan Branch',
  0x0201: 'AR Timing',
  0x0202: 'Rigado LLC',
  0x0203: 'Kemppi Oy',
  0x0204: 'Tapcentive Inc.',
  0x0205: 'Smartbotics Inc.',
  0x0206: 'Otter Products, LLC',
  0x0207: 'STEMP Inc.',
  0x0208: 'LumiGeek LLC',
  0x0209: 'InvisionHeart Inc.',
  0x020a: 'Macnica Inc. ',
  0x020b: 'Jaguar Land Rover Limited',
  0x020c: 'CoroWare Technologies, Inc',
  0x020d: 'Simplo Technology Co., LTD',
  0x020e: 'Omron Healthcare Co., LTD',
  0x020f: 'Comodule GMBH',
  0x0210: 'ikeGPS',
  0x0211: 'Telink Semiconductor Co. Ltd',
  0x0212: 'Interplan Co., Ltd',
  0x0213: 'Wyler AG',
  0x0214: 'IK Multimedia Production srl',
  0x0215: 'Lukoton Experience Oy',
  0x0216: 'MTI Ltd',
  0x0217: 'Tech4home, Lda',
  0x0218: 'Hiotech AB',
  0x0219: 'DOTT Limited',
  0x021a: 'Blue Speck Labs, LLC',
  0x021b: 'Cisco Systems, Inc',
  0x021c: 'Mobicomm Inc',
  0x021d: 'Edamic',
  0x021e: 'Goodnet, Ltd',
  0x021f: 'Luster Leaf Products Inc',
  0x0220: 'Manus Machina BV',
  0x0221: 'Mobiquity Networks Inc',
  0x0222: 'Praxis Dynamics',
  0x0223: 'Philip Morris Products S.A.',
  0x0224: 'Comarch SA',
  0x0225: 'Nestl Nespresso S.A.',
  0x0226: 'Merlinia A/S',
  0x0227: 'LifeBEAM Technologies',
  0x0228: 'Twocanoes Labs, LLC',
  0x0229: 'Muoverti Limited',
  0x022a: 'Stamer Musikanlagen GMBH',
  0x022b: 'Tesla Motors',
  0x022c: 'Pharynks Corporation',
  0x022d: 'Lupine',
  0x022e: 'Siemens AG',
  0x022f: 'Huami (Shanghai) Culture Communication CO., LTD',
  0x0230: 'Foster Electric Company, Ltd',
  0x0231: 'ETA SA',
  0x0232: 'x-Senso Solutions Kft',
  0x0233: 'Shenzhen SuLong Communication Ltd',
  0x0234: 'FengFan (BeiJing) Technology Co, Ltd',
  0x0235: 'Qrio Inc',
  0x0236: 'Pitpatpet Ltd',
  0x0237: 'MSHeli s.r.l.',
  0x0238: 'Trakm8 Ltd',
  0x0239: 'JIN CO, Ltd',
  0x023a: 'Alatech Tehnology',
  0x023b: 'Beijing CarePulse Electronic Technology Co, Ltd',
  0x023c: 'Awarepoint',
  0x023d: 'ViCentra B.V.',
  0x023e: 'Raven Industries',
  0x023f: 'WaveWare Technologies Inc.',
  0x0240: 'Argenox Technologies',
  0x0241: 'Bragi GmbH',
  0x0242: '16Lab Inc',
  0x0243: 'Masimo Corp',
  0x0244: 'Iotera Inc',
  0x0245: 'Endress+Hauser',
  0x0246: 'ACKme Networks, Inc.',
  0x0247: 'FiftyThree Inc.',
  0x0248: 'Parker Hannifin Corp',
  0x0249: 'Transcranial Ltd',
  0x024a: 'Uwatec AG',
  0x024b: 'Orlan LLC',
  0x024c: 'Blue Clover Devices',
  0x024d: 'M-Way Solutions GmbH',
  0x024e: 'Microtronics Engineering GmbH',
  0x024f: 'Schneider Schreibgerte GmbH',
  0x0250: 'Sapphire Circuits LLC',
  0x0251: 'Lumo Bodytech Inc.',
  0x0252: 'UKC Technosolution',
  0x0253: 'Xicato Inc.',
  0x0254: 'Playbrush',
  0x0255: 'Dai Nippon Printing Co., Ltd.',
  0x0256: 'G24 Power Limited',
  0x0257: 'AdBabble Local Commerce Inc.',
  0x0258: 'Devialet SA',
  0x0259: 'ALTYOR',
  0x025a: 'University of Applied Sciences Valais/Haute Ecole Valaisanne',
  0x025b: 'Five Interactive, LLC dba Zendo',
  0x025c: 'NetEaseHangzhouNetwork co.Ltd.',
  0x025d: 'Lexmark International Inc.',
  0x025e: 'Fluke Corporation',
  0x025f: 'Yardarm Technologies',
  0x0260: 'SensaRx',
  0x0261: 'SECVRE GmbH',
  0x0262: 'Glacial Ridge Technologies',
  0x0263: 'Identiv, Inc.',
  0x0264: 'DDS, Inc.',
  0x0265: 'SMK Corporation',
  0x0266: 'Schawbel Technologies LLC',
  0x0267: 'XMI Systems SA',
  0x0268: 'Cerevo',
  0x0269: 'Torrox GmbH & Co KG',
  0x026a: 'Gemalto',
  0x026b: 'DEKA Research & Development Corp.',
  0x026c: 'Domster Tadeusz Szydlowski',
  0x026d: 'Technogym SPA',
  0x026e: 'FLEURBAEY BVBA',
  0x026f: 'Aptcode Solutions',
  0x0270: 'LSI ADL Technology',
  0x0271: 'Animas Corp',
  0x0272: 'Alps Electric Co., Ltd.',
  0x0273: 'OCEASOFT',
  0x0274: 'Motsai Research',
  0x0275: 'Geotab',
  0x0276: 'E.G.O. Elektro-Gertebau GmbH',
  0x0277: 'bewhere inc',
  0x0278: 'Johnson Outdoors Inc',
  0x0279: 'steute Schaltgerate GmbH & Co. KG',
  0x027a: 'Ekomini inc.',
  0x027b: 'DEFA AS',
  0x027c: 'Aseptika Ltd',
  0x027d: 'HUAWEI Technologies Co., Ltd. ( )',
  0x027e: 'HabitAware, LLC',
  0x027f: 'ruwido austria gmbh',
  0x0280: 'ITEC corporation',
  0x0281: 'StoneL',
  0x0282: 'Sonova AG',
  0x0283: 'Maven Machines, Inc.',
  0x0284: 'Synapse Electronics',
  0x0285: 'Standard Innovation Inc.',
  0x0286: 'RF Code, Inc.',
  0x0287: 'Wally Ventures S.L.',
  0x0288: 'Willowbank Electronics Ltd',
  0x0289: 'SK Telecom',
  0x028a: 'Jetro AS',
  0x028b: 'Code Gears LTD',
  0x028c: 'NANOLINK APS',
  0x028d: 'IF, LLC',
  0x028e: 'RF Digital Corp',
  0x028f: 'Church & Dwight Co., Inc',
  0x0290: 'Multibit Oy',
  0x0291: 'CliniCloud Inc',
  0x0292: 'SwiftSensors',
  0x0293: 'Blue Bite',
  0x0294: 'ELIAS GmbH',
  0x0295: 'Sivantos GmbH',
  0x0296: 'Petzl',
  0x0297: 'storm power ltd',
  0x0298: 'EISST Ltd',
  0x0299: 'Inexess Technology Simma KG',
  0x029a: 'Currant, Inc.',
  0x029b: 'C2 Development, Inc.',
  0x029c: 'Blue Sky Scientific, LLC',
  0x029d: 'ALOTTAZS LABS, LLC',
  0x029e: 'Kupson spol. s r.o.',
  0x029f: 'Areus Engineering GmbH',
  0x02a0: 'Impossible Camera GmbH',
  0x02a1: 'InventureTrack Systems',
  0x02a2: 'LockedUp',
  0x02a3: 'Itude',
  0x02a4: 'Pacific Lock Company',
  0x02a5: 'Tendyron Corporation ( )',
  0x02a6: 'Robert Bosch GmbH',
  0x02a7: 'Illuxtron international B.V.',
  0x02a8: 'miSport Ltd.',
  0x02a9: 'Chargelib',
  0x02aa: 'Doppler Lab',
  0x02ab: 'BBPOS Limited',
  0x02ac: 'RTB Elektronik GmbH & Co. KG',
  0x02ad: 'Rx Networks, Inc.',
  0x02ae: 'WeatherFlow, Inc.',
  0x02af: 'Technicolor USA Inc.',
  0x02b0: 'Bestechnic(Shanghai),Ltd',
  0x02b1: 'Raden Inc',
  0x02b2: 'JouZen Oy',
  0x02b3: 'CLABER S.P.A.',
  0x02b4: 'Hyginex, Inc.',
  0x02b5: 'HANSHIN ELECTRIC RAILWAY CO.,LTD.',
  0x02b6: 'Schneider Electric',
  0x02b7: 'Oort Technologies LLC',
  0x02b8: 'Chrono Therapeutics',
  0x02b9: 'Rinnai Corporation',
  0x02ba: 'Swissprime Technologies AG',
  0x02bb: 'Koha.,Co.Ltd',
  0x02bc: 'Genevac Ltd',
  0x02bd: 'Chemtronics',
  0x02be: 'Seguro Technology Sp. z o.o.',
  0x02bf: 'Redbird Flight Simulations',
  0x02c0: 'Dash Robotics',
  0x02c1: 'LINE Corporation',
  0x02c2: 'Guillemot Corporation',
  0x02c3: 'Techtronic Power Tools Technology Limited',
  0x02c4: 'Wilson Sporting Goods',
  0x02c5: 'Lenovo (Singapore) Pte Ltd. ( )',
  0x02c6: 'Ayatan Sensors',
  0x02c7: 'Electronics Tomorrow Limited',
  0x02c8: 'VASCO Data Security International, Inc.',
  0x02c9: 'PayRange Inc.',
  0x02ca: 'ABOV Semiconductor',
  0x02cb: 'AINA-Wireless Inc.',
  0x02cc: 'Eijkelkamp Soil & Water',
  0x02cd: 'BMA ergonomics b.v.',
  0x02ce: 'Teva Branded Pharmaceutical Products R&D, Inc.',
  0x02cf: 'Anima',
  0x02d0: '3M',
  0x02d1: 'Empatica Srl',
  0x02d2: 'Afero, Inc.',
  0x02d3: 'Powercast Corporation',
  0x02d4: 'Secuyou ApS',
  0x02d5: 'OMRON Corporation',
  0x02d6: 'Send Solutions',
  0x02d7: 'NIPPON SYSTEMWARE CO.,LTD.',
  0x02d8: 'Neosfar',
  0x02d9: 'Fliegl Agrartechnik GmbH',
  0x02da: 'Gilvader',
  0x02db: 'Digi International Inc (R)',
  0x02dc: 'DeWalch Technologies, Inc.',
  0x02dd: 'Flint Rehabilitation Devices, LLC',
  0x02de: 'Samsung SDS Co., Ltd.',
  0x02df: 'Blur Product Development',
  0x02e0: 'University of Michigan',
  0x02e1: 'Victron Energy BV',
  0x02e2: 'NTT docomo',
  0x02e3: 'Carmanah Technologies Corp.',
  0x02e4: 'Bytestorm Ltd.',
  0x02e5: 'Espressif Incorporated ( () )',
  0x02e6: 'Unwire',
  0x02e7: 'Connected Yard, Inc.',
  0x02e8: 'American Music Environments',
  0x02e9: 'Sensogram Technologies, Inc.',
  0x02ea: 'Fujitsu Limited',
  0x02eb: 'Ardic Technology',
  0x02ec: 'Delta Systems, Inc',
  0x02ed: 'HTC Corporation',
  0x02ee: 'Citizen Holdings Co., Ltd.',
  0x02ef: 'SMART-INNOVATION.inc',
  0x02f0: 'Blackrat Software',
  0x02f1: 'The Idea Cave, LLC',
  0x02f2: 'GoPro, Inc.',
  0x02f3: 'AuthAir, Inc',
  0x02f4: 'Vensi, Inc.',
  0x02f5: 'Indagem Tech LLC',
  0x02f6: 'Intemo Technologies',
  0x02f7: 'DreamVisions co., Ltd.',
  0x02f8: 'Runteq Oy Ltd',
  0x02f9: 'IMAGINATION TECHNOLOGIES LTD',
  0x02fa: 'CoSTAR TEchnologies',
  0x02fb: 'Clarius Mobile Health Corp.',
  0x02fc: 'Shanghai Frequen Microelectronics Co., Ltd.',
  0x02fd: 'Uwanna, Inc.',
  0x02fe: 'Lierda Science & Technology Group Co., Ltd.',
  0x02ff: 'Silicon Laboratories',
  0x0300: 'World Moto Inc.',
  0x0301: 'Giatec Scientific Inc.',
  0x0302: 'Loop Devices, Inc',
  0x0303: 'IACA electronique',
  0x0304: 'Martians Inc',
  0x0305: 'Swipp ApS',
  0x0306: 'Life Laboratory Inc.',
  0x0307: 'FUJI INDUSTRIAL CO.,LTD.',
  0x0308: 'Surefire, LLC',
  0x0309: 'Dolby Labs',
  0x030a: 'Ellisys',
  0x030b: 'Magnitude Lighting Converters',
  0x030c: 'Hilti AG',
  0x030d: 'Devdata S.r.l.',
  0x030e: 'Deviceworx',
  0x030f: 'Shortcut Labs',
  0x0310: 'SGL Italia S.r.l.',
  0x0311: 'PEEQ DATA',
  0x0312: 'Ducere Technologies Pvt Ltd',
  0x0313: 'DiveNav, Inc.',
  0x0314: 'RIIG AI Sp. z o.o.',
  0x0315: 'Thermo Fisher Scientific',
  0x0316: 'AG Measurematics Pvt. Ltd.',
  0x0317: 'CHUO Electronics CO., LTD.',
  0x0318: 'Aspenta International',
  0x0319: 'Eugster Frismag AG',
  0x031a: 'Amber wireless GmbH',
  0x031b: 'HQ Inc',
  0x031c: 'Lab Sensor Solutions',
  0x031d: 'Enterlab ApS',
  0x031e: 'Eyefi, Inc.',
  0x031f: 'MetaSystem S.p.A.',
  0x0320: 'SONO ELECTRONICS. CO., LTD',
  0x0321: 'Jewelbots',
  0x0322: 'Compumedics Limited',
  0x0323: 'Rotor Bike Components',
  0x0324: 'Astro, Inc.',
  0x0325: 'Amotus Solutions',
  0x0326: 'Healthwear Technologies (Changzhou)Ltd',
  0x0327: 'Essex Electronics',
  0x0328: 'Grundfos A/S',
  0x0329: 'Eargo, Inc.',
  0x032a: 'Electronic Design Lab',
  0x032b: 'ESYLUX',
  0x032c: 'NIPPON SMT.CO.,Ltd',
  0x032d: 'BM innovations GmbH',
  0x032e: 'indoormap',
  0x032f: 'OttoQ Inc',
  0x0330: 'North Pole Engineering',
  0x0331: '3flares Technologies Inc.',
  0x0332: 'Electrocompaniet A.S.',
  0x0333: 'Mul-T-Lock',
  0x0334: 'Corentium AS',
  0x0335: 'Enlighted Inc',
  0x0336: 'GISTIC',
  0x0337: 'AJP2 Holdings, LLC',
  0x0338: 'COBI GmbH',
  0x0339: 'Blue Sky Scientific, LLC',
  0x033a: 'Appception, Inc.',
  0x033b: 'Courtney Thorne Limited',
  0x033c: 'Virtuosys',
  0x033d: 'TPV Technology Limited',
  0x033e: 'Monitra SA',
  0x033f: 'Automation Components, Inc.',
  0x0340: 'Letsense s.r.l.',
  0x0341: 'Etesian Technologies LLC',
  0x0342: 'GERTEC BRASIL LTDA.',
  0x0343: 'Drekker Development Pty. Ltd.',
  0x0344: 'Whirl Inc',
  0x0345: 'Locus Positioning',
  0x0346: 'Acuity Brands Lighting, Inc',
  0x0347: 'Prevent Biometrics',
  0x0348: 'Arioneo',
  0x0349: 'VersaMe',
  0x034a: 'Vaddio',
  0x034b: 'Libratone A/S',
  0x034c: 'HM Electronics, Inc.',
  0x034d: 'TASER International, Inc.',
  0x034e: 'SafeTrust Inc.',
  0x034f: 'Heartland Payment Systems',
  0x0350: 'Bitstrata Systems Inc.',
  0x0351: 'Pieps GmbH',
  0x0352: 'iRiding(Xiamen)Technology Co.,Ltd.',
  0x0353: 'Alpha Audiotronics, Inc.',
  0x0354: 'TOPPAN FORMS CO.,LTD.',
  0x0355: 'Sigma Designs, Inc.',
  0x0356: 'Spectrum Brands, Inc.',
  0x0357: 'Polymap Wireless',
  0x0358: 'MagniWare Ltd.',
  0x0359: 'Novotec Medical GmbH',
  0x035a: 'Medicom Innovation Partner a/s',
  0x035b: 'Matrix Inc.',
  0x035c: 'Eaton Corporation',
  0x035d: 'KYS',
  0x035e: 'Naya Health, Inc.',
  0x035f: 'Acromag',
  0x0360: 'Insulet Corporation',
  0x0361: 'Wellinks Inc.',
  0x0362: 'ON Semiconductor',
  0x0363: 'FREELAP SA',
  0x0364: 'Favero Electronics Srl',
  0x0365: 'BioMech Sensor LLC',
  0x0366: 'BOLTT Sports technologies Private limited',
  0x0367: 'Saphe International',
  0x0368: 'Metormote AB',
  0x0369: 'littleBits',
  0x036a: 'SetPoint Medical',
  0x036b: 'BRControls Products BV',
  0x036c: 'Zipcar',
  0x036d: 'AirBolt Pty Ltd',
  0x036e: 'KeepTruckin Inc',
  0x036f: 'Motiv, Inc.',
  0x0370: 'Wazombi Labs O',
  0x0371: 'ORBCOMM',
  0x0372: 'Nixie Labs, Inc.',
  0x0373: 'AppNearMe Ltd',
  0x0374: 'Holman Industries',
  0x0375: 'Expain AS',
  0x0376: 'Electronic Temperature Instruments Ltd',
  0x0377: 'Plejd AB',
  0x0378: 'Propeller Health',
  0x0379: 'Shenzhen iMCO Electronic Technology Co.,Ltd',
  0x037a: 'Algoria',
  0x037b: 'Apption Labs Inc.',
  0x037c: 'Cronologics Corporation',
  0x037d: 'MICRODIA Ltd.',
  0x037e: 'lulabytes S.L.',
  0x037f: 'Nestec S.A.',
  0x0380: 'LLC MEGA - F service',
  0x0381: 'Sharp Corporation',
  0x0382: 'Precision Outcomes Ltd',
  0x0383: 'Kronos Incorporated',
  0x0384: 'OCOSMOS Co., Ltd.',
  0x0385: 'Embedded Electronic Solutions Ltd. dba e2Solutions',
  0x0386: 'Aterica Inc.',
  0x0387: 'BluStor PMC, Inc.',
  0x0388: 'Kapsch TrafficCom AB',
  0x0389: 'ActiveBlu Corporation',
  0x038a: 'Kohler Mira Limited',
  0x038b: 'Noke',
  0x038c: 'Appion Inc.',
  0x038d: 'Resmed Ltd',
  0x038e: 'Crownstone B.V.',
  0x038f: 'Xiaomi Inc.',
  0x0390: 'INFOTECH s.r.o.',
  0x0391: 'Thingsquare AB',
  0x0392: 'T&D',
  0x0393: 'LAVAZZA S.p.A.',
  0x0394: 'Netclearance Systems, Inc.',
  0x0395: 'SDATAWAY',
  0x0396: 'BLOKS GmbH',
  0x0397: 'LEGO System A/S',
  0x0398: 'Thetatronics Ltd',
  0x0399: 'Nikon Corporation',
  0x039a: 'NeST',
  0x039b: 'South Silicon Valley Microelectronics',
  0x039c: 'ALE International',
  0x039d: 'CareView Communications, Inc.',
  0x039e: 'SchoolBoard Limited',
  0x039f: 'Molex Corporation',
  0x03a0: 'IVT Wireless Limited',
  0x03a1: 'Alpine Labs LLC',
  0x03a2: 'Candura Instruments',
  0x03a3: 'SmartMovt Technology Co., Ltd',
  0x03a4: 'Token Zero Ltd',
  0x03a5: 'ACE CAD Enterprise Co., Ltd. (ACECAD)',
  0x03a6: 'Medela, Inc',
  0x03a7: 'AeroScout',
  0x03a8: 'Esrille Inc.',
  0x03a9: 'THINKERLY SRL',
  0x03aa: 'Exon Sp. z o.o.',
  0x03ab: 'Meizu Technology Co., Ltd.',
  0x03ac: 'Smablo LTD',
  0x03ad: 'XiQ',
  0x03ae: 'Allswell Inc.',
  0x03af: 'Comm-N-Sense Corp DBA Verigo',
  0x03b0: 'VIBRADORM GmbH',
  0x03b1: 'Otodata Wireless Network Inc.',
  0x03b2: 'Propagation Systems Limited',
  0x03b3: 'Midwest Instruments & Controls',
  0x03b4: 'Alpha Nodus, inc.',
  0x03b5: 'petPOMM, Inc',
  0x03b6: 'Mattel',
  0x03b7: 'Airbly Inc.',
  0x03b8: 'A-Safe Limited',
  0x03b9: 'FREDERIQUE CONSTANT SA',
  0x03ba: 'Maxscend Microelectronics Company Limited',
  0x03bb: 'Abbott Diabetes Care',
  0x03bc: 'ASB Bank Ltd',
  0x03bd: 'amadas',
  0x03be: 'Applied Science, Inc.',
  0x03bf: 'iLumi Solutions Inc.',
  0x03c0: 'Arch Systems Inc.',
  0x03c1: 'Ember Technologies, Inc.',
  0x03c2: 'Snapchat Inc',
  0x03c3: 'Casambi Technologies Oy',
  0x03c4: 'Pico Technology Inc.',
  0x03c5: 'St. Jude Medical, Inc.',
  0x03c6: 'Intricon',
  0x03c7: 'Structural Health Systems, Inc.',
  0x03c8: 'Avvel International',
  0x03c9: 'Gallagher Group',
  0x03ca: 'In2things Automation Pvt. Ltd.',
  0x03cb: 'SYSDEV Srl',
  0x03cc: 'Vonkil Technologies Ltd',
  0x03cd: 'Wynd Technologies, Inc.',
  0x03ce: 'CONTRINEX S.A.',
  0x03cf: 'MIRA, Inc.',
  0x03d0: 'Watteam Ltd',
  0x03d1: 'Density Inc.',
  0x03d2: 'IOT Pot India Private Limited',
  0x03d3: 'Sigma Connectivity AB',
  0x03d4: 'PEG PEREGO SPA',
  0x03d5: 'Wyzelink Systems Inc.',
  0x03d6: 'Yota Devices LTD',
  0x03d7: 'FINSECUR',
  0x03d8: 'Zen-Me Labs Ltd',
  0x03d9: '3IWare Co., Ltd.',
  0x03da: 'EnOcean GmbH',
  0x03db: 'Instabeat, Inc',
  0x03dc: 'Nima Labs',
  0x03dd: 'Andreas Stihl AG & Co. KG',
  0x03de: 'Nathan Rhoades LLC',
  0x03df: 'Grob Technologies, LLC',
  0x03e0: 'Actions (Zhuhai) Technology Co., Limited',
  0x03e1: 'SPD Development Company Ltd',
  0x03e2: 'Sensoan Oy',
  0x03e3: 'Qualcomm Life Inc',
  0x03e4: 'Chip-ing AG',
  0x03e5: 'ffly4u',
  0x03e6: 'IoT Instruments Oy',
  0x03e7: 'TRUE Fitness Technology',
  0x03e8: 'Reiner Kartengeraete GmbH & Co. KG.',
  0x03e9: 'SHENZHEN LEMONJOY TECHNOLOGY CO., LTD.',
  0x03ea: 'Hello Inc.',
  0x03eb: 'Evollve Inc.',
  0x03ec: 'Jigowatts Inc.',
  0x03ed: 'BASIC MICRO.COM,INC.',
  0x03ee: 'CUBE TECHNOLOGIES',
  0x03ef: 'foolography GmbH',
  0x03f0: 'CLINK',
  0x03f1: 'Hestan Smart Cooking Inc.',
  0x03f2: 'WindowMaster A/S',
  0x03f3: 'Flowscape AB',
  0x03f4: 'PAL Technologies Ltd',
  0x03f5: 'WHERE, Inc.',
  0x03f6: 'Iton Technology Corp.',
  0x03f7: 'Owl Labs Inc.',
  0x03f8: 'Rockford Corp.',
  0x03f9: 'Becon Technologies Co.,Ltd.',
  0x03fa: 'Vyassoft Technologies Inc',
  0x03fb: 'Nox Medical',
  0x03fc: 'Kimberly-Clark',
  0x03fd: 'Trimble Navigation Ltd.',
  0x03fe: 'Littelfuse',
  0x03ff: 'Withings',
  0x0400: 'i-developer IT Beratung UG',
  0x0402: 'Sears Holdings Corporation',
  0x0403: 'Gantner Electronic GmbH',
  0x0404: 'Authomate Inc',
  0x0405: 'Vertex International, Inc.',
  0x0406: 'Airtago',
  0x0407: 'Swiss Audio SA',
  0x0408: 'ToGetHome Inc.',
  0x0409: 'AXIS',
  0x040a: 'Openmatics',
  0x040b: 'Jana Care Inc.',
  0x040c: 'Senix Corporation',
  0x040d: 'NorthStar Battery Company, LLC',
  0x040e: 'SKF (U.K.) Limited',
  0x040f: 'CO-AX Technology, Inc.',
  0x0410: 'Fender Musical Instruments',
  0x0411: 'Luidia Inc',
  0x0412: 'SEFAM',
  0x0413: 'Wireless Cables Inc',
  0x0414: 'Lightning Protection International Pty Ltd',
  0x0415: 'Uber Technologies Inc',
  0x0416: 'SODA GmbH',
  0x0417: 'Fatigue Science',
  0x0418: 'Alpine Electronics Inc.',
  0x0419: 'Novalogy LTD',
  0x041a: 'Friday Labs Limited',
  0x041b: 'OrthoAccel Technologies',
  0x041c: 'WaterGuru, Inc.',
  0x041d: 'Benning Elektrotechnik und Elektronik GmbH & Co. KG',
  0x041e: 'Dell Computer Corporation',
  0x041f: 'Kopin Corporation',
  0x0420: 'TecBakery GmbH',
  0x0421: 'Backbone Labs, Inc.',
  0x0422: 'DELSEY SA',
  0x0423: 'Chargifi Limited',
  0x0424: 'Trainesense Ltd.',
  0x0425: 'Unify Software and Solutions GmbH & Co. KG',
  0x0426: 'Husqvarna AB',
  0x0427: 'Focus fleet and fuel management inc',
  0x0428: 'SmallLoop, LLC',
  0x0429: 'Prolon Inc.',
  0x042a: 'BD Medical',
  0x042b: 'iMicroMed Incorporated',
  0x042c: 'Ticto N.V.',
  0x042d: 'Meshtech AS',
  0x042e: 'MemCachier Inc.',
  0x042f: 'Danfoss A/S',
  0x0430: 'SnapStyk Inc.',
  0x0431: 'Amyway Corporation',
  0x0432: 'Silk Labs, Inc.',
  0x0433: 'Pillsy Inc.',
  0x0434: 'Hatch Baby, Inc.',
  0x0435: 'Blocks Wearables Ltd.',
  0x0436: 'Drayson Technologies (Europe) Limited',
  0x0437: 'eBest IOT Inc.',
  0x0438: 'Helvar Ltd',
  0x0439: 'Radiance Technologies',
  0x043a: 'Nuheara Limited',
  0x043b: 'Appside co., ltd.',
  0x043c: 'DeLaval',
  0x043d: 'Coiler Corporation',
  0x043e: 'Thermomedics, Inc.',
  0x043f: 'Tentacle Sync GmbH',
  0x0440: 'Valencell, Inc.',
  0x0441: 'iProtoXi Oy',
  0x0442: 'SECOM CO., LTD.',
  0x0443: 'Tucker International LLC',
  0x0444: 'Metanate Limited',
  0x0445: 'Kobian Canada Inc.',
  0x0446: 'NETGEAR, Inc.',
  0x0447: 'Fabtronics Australia Pty Ltd',
  0x0448: 'Grand Centrix GmbH',
  0x0449: '1UP USA.com llc',
  0x044a: 'SHIMANO INC.',
  0x044b: 'Nain Inc.',
  0x044c: 'LifeStyle Lock, LLC',
  0x044d: 'VEGA Grieshaber KG',
  0x044e: 'Xtrava Inc.',
  0x044f: 'TTS Tooltechnic Systems AG & Co. KG',
  0x0450: 'Teenage Engineering AB',
  0x0451: 'Tunstall Nordic AB',
  0x0452: 'Svep Design Center AB',
  0x0453: 'GreenPeak Technologies BV',
  0x0454: 'Sphinx Electronics GmbH & Co KG',
  0x0455: 'Atomation',
  0x0456: 'Nemik Consulting Inc',
  0x0457: 'RF INNOVATION',
  0x0458: 'Mini Solution Co., Ltd.',
  0x0459: 'Lumenetix, Inc',
  0x045a: '2048450 Ontario Inc',
  0x045b: 'SPACEEK LTD',
  0x045c: 'Delta T Corporation',
  0x045d: 'Boston Scientific Corporation',
  0x045e: 'Nuviz, Inc.',
  0x045f: 'Real Time Automation, Inc.',
  0x0460: 'Kolibree',
  0x0461: 'vhf elektronik GmbH',
  0x0462: 'Bonsai Systems GmbH',
  0x0463: 'Fathom Systems Inc.',
  0x0464: 'Bellman & Symfon',
  0x0465: 'International Forte Group LLC',
  0x0466: 'CycleLabs Solutions inc.',
  0x0467: 'Codenex Oy',
  0x0468: 'Kynesim Ltd',
  0x0469: 'Palago AB',
  0x046a: 'INSIGMA INC.',
  0x046b: 'PMD Solutions',
  0x046c: 'Qingdao Realtime Technology Co., Ltd.',
  0x046d: 'BEGA Gantenbrink-Leuchten KG',
  0x046e: 'Pambor Ltd.',
  0xffff: 'SPECIAL USE/DEFAULT'
};

export const parseBluetoothVendor = (str: string) => {
  const id = parseInt(str);
  !isNaN(id) ? bluetoothVendors[id] || 'Unknown' : null;
};
