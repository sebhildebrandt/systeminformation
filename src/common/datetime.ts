export const nanoSeconds = () => {
  const time = process.hrtime();
  if (!Array.isArray(time) || time.length !== 2) {
    return 0;
  }
  return +time[0] * 1e9 + +time[1];
};

const detectSplit = (str: string) => {
  let seperator = '';
  let part = 0;
  str.split('').forEach((element) => {
    if (element >= '0' && element <= '9') {
      if (part === 1) {
        part++;
      }
    } else {
      if (part === 0) {
        part++;
      }
      if (part === 1) {
        seperator += element;
      }
    }
  });
  return seperator;
};

export const parseTime = (t: string, pmDesignator = '') => {
  t = t.toUpperCase();
  let hour = 0;
  let min = 0;
  const splitter = detectSplit(t);
  const parts = t.split(splitter);
  if (parts.length >= 2) {
    if (parts[2]) {
      parts[1] += parts[2];
    }
    const p1 = (parts[1] || '').toLowerCase();
    const isPM = p1.indexOf('pm') > -1 || p1.indexOf('p.m.') > -1 || p1.indexOf('p. m.') > -1 || p1.indexOf('n') > -1 || p1.indexOf('ch') > -1 || p1.indexOf('ös') > -1 || (!!pmDesignator && p1.indexOf(pmDesignator) > -1);
    hour = Number.parseInt(parts[0], 10);
    min = Number.parseInt(parts[1], 10);
    hour = isPM && hour < 12 ? hour + 12 : hour;
    return `${(`0${hour}`).slice(-2)}:${(`0${min}`).slice(-2)}`;
  }
  return '00:00';
};

export const parseDateTime = (dt: string, culture: any = {}) => {
  const result = {
    date: '',
    time: ''
  };
  const dateFormat = (culture.dateFormat || '').toLowerCase();
  const pmDesignator = culture.pmDesignator || '';

  let parts = dt.split(' ');
  if (parts[0]) {
    if (parts[0].indexOf('/') >= 0) {
      // Dateformat: mm/dd/yyyy or dd/mm/yyyy or dd/mm/yy or yyyy/mm/dd
      const dtparts = parts[0].split('/');
      if (dtparts.length === 3) {
        if (dtparts[0].length === 4) {
          // Dateformat: yyyy/mm/dd
          result.date = dtparts[0] + '-' + `0${dtparts[1]}`.slice(-2) + '-' + `0${dtparts[2]}`.slice(-2);
        } else if (dtparts[2].length === 2) {
          if (dateFormat.indexOf('/d/') > -1 || dateFormat.indexOf('/dd/') > -1) {
            // Dateformat: mm/dd/yy
            result.date = '20' + dtparts[2] + '-' + ('0' + dtparts[0]).slice(-2) + '-' + ('0' + dtparts[1]).slice(-2);
          } else {
            // Dateformat: dd/mm/yy
            result.date = '20' + dtparts[2] + '-' + ('0' + dtparts[1]).slice(-2) + '-' + ('0' + dtparts[0]).slice(-2);
          }
        } else {
          // Dateformat: mm/dd/yyyy or dd/mm/yyyy
          const isEN =
            dt.toLowerCase().indexOf('pm') > -1 ||
            dt.toLowerCase().indexOf('p.m.') > -1 ||
            dt.toLowerCase().indexOf('p. m.') > -1 ||
            dt.toLowerCase().indexOf('am') > -1 ||
            dt.toLowerCase().indexOf('a.m.') > -1 ||
            dt.toLowerCase().indexOf('a. m.') > -1;
          if ((isEN || dateFormat.indexOf('/d/') > -1 || dateFormat.indexOf('/dd/') > -1) && dateFormat.indexOf('dd/') !== 0) {
            // Dateformat: mm/dd/yyyy
            result.date = dtparts[2] + '-' + ('0' + dtparts[0]).slice(-2) + '-' + ('0' + dtparts[1]).slice(-2);
          } else {
            // Dateformat: dd/mm/yyyy
            result.date = dtparts[2] + '-' + ('0' + dtparts[1]).slice(-2) + '-' + ('0' + dtparts[0]).slice(-2);
          }
        }
      }
    }
    if (parts[0].indexOf('.') >= 0) {
      const dtparts = parts[0].split('.');
      if (dtparts.length === 3) {
        if (dateFormat.indexOf('.d.') > -1 || dateFormat.indexOf('.dd.') > -1) {
          // Dateformat: mm.dd.yyyy
          result.date = dtparts[2] + '-' + ('0' + dtparts[0]).slice(-2) + '-' + ('0' + dtparts[1]).slice(-2);
        } else {
          // Dateformat: dd.mm.yyyy
          result.date = dtparts[2] + '-' + ('0' + dtparts[1]).slice(-2) + '-' + ('0' + dtparts[0]).slice(-2);
        }
      }
    }
    if (parts[0].indexOf('-') >= 0) {
      // Dateformat: yyyy-mm-dd
      const dtparts = parts[0].split('-');
      if (dtparts.length === 3) {
        result.date = dtparts[0] + '-' + ('0' + dtparts[1]).slice(-2) + '-' + ('0' + dtparts[2]).slice(-2);
      }
    }
  }
  if (parts[1]) {
    parts = parts.splice(1);
    const time = parts.join(' ');
    result.time = parseTime(time, pmDesignator);
  }
  return result;
};

export const parseTimeUnix = (time: string) => {
  let result = time;
  const parts = time.replace(/ +/g, ' ').split(' ');
  if (parts.length === 5) {
    result = parts[4] + '-' + ('0' + ('JANFEBMARAPRMAYJUNJULAUGSEPOCTNOVDEC'.indexOf(parts[1].toUpperCase()) / 3 + 1)).slice(-2) + '-' + ('0' + parts[2]).slice(-2) + ' ' + parts[3];
  }
  return result;
};

export const parseDateUnix = (dtStr: string) => {
  const parts = dtStr.replace(/ +/g, ' ').split(' ');
  const dtMon = parts[0];
  const dtDay = parts.length > 1 ? parts[1] : '1';
  let dt = new Date().toISOString().slice(0, 10);
  try {
    dt = '' + new Date().getFullYear() + '-' + ('0' + ('JANFEBMARAPRMAYJUNJULAUGSEPOCTNOVDEC'.indexOf(dtMon.toUpperCase()) / 3 + 1)).slice(-2) + '-' + ('0' + dtDay).slice(-2);
    if (new Date(dt) > new Date()) {
      dt = '' + (new Date().getFullYear() - 1) + '-' + ('0' + ('JANFEBMARAPRMAYJUNJULAUGSEPOCTNOVDEC'.indexOf(dtMon.toUpperCase()) / 3 + 1)).slice(-2) + '-' + ('0' + dtDay).slice(-2);
    }
  } catch {}
  return dt;
};

export const parseElapsedTime = (etime: string) => {
  let current = new Date();
  current = new Date(current.getTime() - current.getTimezoneOffset() * 60000);

  const elapsed = etime.split('-');

  const timeIndex = elapsed.length - 1;
  const days = timeIndex > 0 ? Number.parseInt(elapsed[timeIndex - 1], 10) : 0;

  const timeStr = elapsed[timeIndex].split(':');
  const hours = timeStr.length === 3 ? Number.parseInt(timeStr[0] || '0', 10) : 0;
  const mins = Number.parseInt(timeStr[timeStr.length === 3 ? 1 : 0] || '0', 10);
  const secs = Number.parseInt(timeStr[timeStr.length === 3 ? 2 : 1] || '0', 10);
  const ms = (((days * 24 + hours) * 60 + mins) * 60 + secs) * 1000;

  let res = new Date(current.getTime());
  let result = res.toISOString().substring(0, 10) + ' ' + res.toISOString().substring(11, 19);
  try {
    res = new Date(current.getTime() - ms);
    result = res.toISOString().substring(0, 10) + ' ' + res.toISOString().substring(11, 19);
  } catch {}
  return result;
};
