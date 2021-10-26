'use strict';

export const parseHead = (head: string, rights: number) => {
  let space = (rights > 0);
  let count = 1;
  let from = 0;
  let to = 0;
  const result = [];
  for (let i = 0; i < head.length; i++) {
    if (count <= rights) {
      // if (head[i] === ' ' && !space) {
      if (/\s/.test(head[i]) && !space) {
        to = i - 1;
        result.push({
          from: from,
          to: to + 1,
          cap: head.substring(from, to + 1)
        });
        from = to + 2;
        count++;
      }
      space = head[i] === ' ';
    } else {
      if (!/\s/.test(head[i]) && space) {
        to = i - 1;
        if (from < to) {
          result.push({
            from: from,
            to: to,
            cap: head.substring(from, to)
          });
        }
        from = to + 1;
        count++;
      }
      space = head[i] === ' ';
    }
  }
  to = 1000;
  result.push({
    from: from,
    to: to,
    cap: head.substring(from, to)
  });
  let len = result.length;
  for (let i = 0; i < len; i++) {
    if (result[i].cap.replace(/\s/g, '').length === 0) {
      if (i + 1 < len) {
        result[i].to = result[i + 1].to;
        result[i].cap = result[i].cap + result[i + 1].cap;
        result.splice(i + 1, 1);
        len = len - 1;
      }
    }
  }
  return result;
};
