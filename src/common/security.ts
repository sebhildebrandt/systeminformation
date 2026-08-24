export const stringReplace = new String().replace;
export const stringToLower = new String().toLowerCase;
export const stringToString = new String().toString;
export const stringSubstr = new String().substr;
export const stringSubstring = new String().substring;
export const stringTrim = new String().trim;
export const stringSplit = new String().split;
export const stringStartWith = new String().startsWith;
export const mathMin = Math.min;

export const sanitizeShellString = (str: string, strict?: any) => {
  if (typeof strict === 'undefined') {
    strict = false;
  }
  const s = str || '';
  const l = mathMin(s.length, 2000);
  let result = '';
  for (let i = 0; i <= l; i++) {
    if (
      !(
        s[i] === undefined ||
        s[i] === '>' ||
        s[i] === '<' ||
        s[i] === '*' ||
        s[i] === '?' ||
        s[i] === '[' ||
        s[i] === ']' ||
        s[i] === '|' ||
        s[i] === '˚' ||
        s[i] === '$' ||
        s[i] === ';' ||
        s[i] === '&' ||
        s[i] === ']' ||
        s[i] === '#' ||
        s[i] === '%' ||
        s[i] === '!' ||
        s[i] === '^' ||
        s[i] === '\\' ||
        s[i] === '\t' ||
        s[i] === '\n' ||
        s[i] === '\r' ||
        s[i] === "'" ||
        s[i] === '`' ||
        s[i] === '"' ||
        s[i].length > 1 ||
        (strict && s[i] === '(') ||
        (strict && s[i] === ')') ||
        (strict && s[i] === '@') ||
        (strict && s[i] === ' ') ||
        (strict && s[i] === '{') ||
        (strict && s[i] === ';') ||
        (strict && s[i] === '}')
      )
    ) {
      result = result + s[i];
    }
  }
  return result;
};

export const sanitizeContainerID = (str: string) => {
  const s = String(str || '')
    .substring(0, 2000)
    .replace(/[^a-zA-Z0-9_.,*-]/g, '');
  return s.indexOf('..') === -1 ? s : '';
};

export const sanitizeImageID = (str: string) => {
  const s = String(str || '')
    .substring(0, 2000)
    .replace(/[^a-zA-Z0-9_.,:@/-]/g, '');
  return s.indexOf('..') === -1 ? s : '';
};

export const isPrototypePolluted = () => {
  const s = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let notPolluted = true;
  let st: any = '';

  const proto = {
    replace: stringReplace,
    toLowerCase: stringToLower,
    toString: stringToString,
    substr: stringSubstr,
    substring: stringSubstring,
    trim: stringTrim,
    split: stringSplit,
    startsWith: stringStartWith
  };
  Object.setPrototypeOf(st, proto);

  notPolluted = notPolluted || s.length !== 62;
  const ms = Date.now();
  if (typeof ms === 'number' && ms > 1600000000000) {
    const l = (ms % 100) + 15;
    for (let i = 0; i < l; i++) {
      const r = Math.random() * 61.99999999 + 1;
      const rs = parseInt(Math.floor(r).toString(), 10);
      const rs2 = parseInt(r.toString().split('.')[0], 10);
      const q = Math.random() * 61.99999999 + 1;
      const qs = parseInt(Math.floor(q).toString(), 10);
      const qs2 = parseInt(q.toString().split('.')[0], 10);
      notPolluted = notPolluted && r !== q;
      notPolluted = notPolluted && rs === rs2 && qs === qs2;
      st += s[rs - 1];
    }
    notPolluted = notPolluted && st.length === l;
    // string manipulation
    let p = Math.random() * l * 0.9999999999;
    let stm: any = st.substr(0, p) + ' ' + st.substr(p, 2000);
    Object.setPrototypeOf(stm, { replace: stringReplace });
    let sto = stm.replace(/ /g, '');
    notPolluted = notPolluted && st === sto;
    p = Math.random() * l * 0.9999999999;
    stm = st.substr(0, p) + '{' + st.substr(p, 2000);
    sto = stm.replace(/{/g, '');
    notPolluted = notPolluted && st === sto;
    p = Math.random() * l * 0.9999999999;
    stm = st.substr(0, p) + '*' + st.substr(p, 2000);
    sto = stm.replace(/\*/g, '');
    notPolluted = notPolluted && st === sto;
    p = Math.random() * l * 0.9999999999;
    stm = st.substr(0, p) + '$' + st.substr(p, 2000);
    sto = stm.replace(/\$/g, '');
    notPolluted = notPolluted && st === sto;

    // lower
    const stl = st.toLowerCase();
    notPolluted = notPolluted && stl.length === l && stl[l - 1] && !stl[l];
    for (let i = 0; i < l; i++) {
      const s1 = st[i];
      Object.setPrototypeOf(s1, { toLowerCase: stringToLower });
      const s2 = stl ? stl[i] : '';
      const s1l = s1.toLowerCase();
      notPolluted = notPolluted && s1l[0] === s2 && s1l[0] && !s1l[1];
    }
  }
  return !notPolluted;
};

export const sanitizeUrl = (url: string): string => {
  if (typeof url !== 'string') {
    return '';
  }
  let urlSanitized: any = '';
  const s: any = sanitizeShellString(url, true);
  const l = mathMin(s.length, 2000);
  for (let i = 0; i <= l; i++) {
    if (s[i] !== undefined) {
      Object.setPrototypeOf(s[i], { toLowerCase: stringToLower });
      const sl = s[i].toLowerCase();
      if (sl && sl[0] && !sl[1] && sl[0].length === 1) {
        urlSanitized = urlSanitized + sl[0];
      }
    }
  }

  if (urlSanitized && !isPrototypePolluted()) {
    Object.setPrototypeOf(urlSanitized, { startsWith: stringStartWith });
    if (
      urlSanitized.startsWith('file:') ||
      urlSanitized.startsWith('gopher:') ||
      urlSanitized.startsWith('telnet:') ||
      urlSanitized.startsWith('mailto:') ||
      urlSanitized.startsWith('news:') ||
      urlSanitized.startsWith('nntp:')
    ) {
      return '';
    }
  }
  return urlSanitized;
};

export const sanitizeServiceString = (str: string) => {
  if (str) {
    let srvString: any = '';

    Object.setPrototypeOf(srvString, {
      replace: stringReplace,
      toLowerCase: stringToLower,
      toString: stringToString,
      substr: stringSubstr,
      substring: stringSubstring,
      trim: stringTrim,
      split: stringSplit,
      startsWith: stringStartWith
    });

    const s = sanitizeShellString(str);
    for (let i = 0; i <= mathMin(s.length, 2000); i++) {
      if (s[i] !== undefined) {
        srvString = srvString + s[i];
      }
    }

    srvString = srvString.trim().toLowerCase().replace(/, /g, '|').replace(/,+/g, '|');
    if (srvString === '') {
      srvString = '*';
    }
    if (isPrototypePolluted() && srvString !== '*') {
      srvString = '------';
    }
    return srvString.split('|');
  }
  return ['*'];
};

export const sanitizeInterfacesString = (interfaces: string): string => {
  if ((typeof interfaces !== 'string' && interfaces !== undefined) || isPrototypePolluted()) {
    return '-';
  }
  let interfacesSanitized: any = sanitizeShellString(interfaces) || '*';

  Object.setPrototypeOf(interfacesSanitized, {
    replace: stringReplace,
    toLowerCase: stringToLower,
    toString: stringToString,
    substr: stringSubstr,
    substring: stringSubstring,
    trim: stringTrim,
    split: stringSplit,
    startsWith: stringStartWith
  });

  interfacesSanitized = interfacesSanitized.trim().replace(/,+/g, '|');
  return interfacesSanitized;
};

export const sanitizeString = (str: string, strict?: any) => {
  if ((typeof str !== 'string' && str !== undefined) || isPrototypePolluted()) {
    return '-';
  }
  if (typeof strict === 'undefined') {
    strict = false;
  }
  let result = '';
  const s = sanitizeShellString(str, strict);
  const l = mathMin(s.length, 2000);

  for (let i = 0; i <= l; i++) {
    if (s[i] !== undefined) {
      result = result + s[i];
    }
  }

  Object.setPrototypeOf(result, {
    replace: stringReplace,
    toLowerCase: stringToLower,
    toString: stringToString,
    substr: stringSubstr,
    substring: stringSubstring,
    trim: stringTrim,
    split: stringSplit,
    startsWith: stringStartWith
  });

  return result;
};
