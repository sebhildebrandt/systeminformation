import http from 'http';
import https from 'https';

export const checkWebsite = (url: string, timeout = 5000) => {
  const client = url.startsWith('https:') || url.indexOf(':443/') > 0 || url.indexOf(':8443/') > 0 ? https : http;
  const t = Date.now();
  return new Promise((resolve) => {
    const request = client
      .get(url, (res: any) => {
        res.on('data', () => {});
        res.on('end', () => {
          resolve({
            url,
            statusCode: res.statusCode,
            ok: res.statusCode >= 200 && res.statusCode <= 399,
            message: res.statusMessage,
            ms: Date.now() - t
          });
        });
      })
      .on('error', (e: any) => {
        resolve({
          url,
          statusCode: 404,
          ok: false,
          message: e.message,
          ms: Date.now() - t
        });
      })
      .setTimeout(timeout, () => {
        request.destroy();
        resolve({
          url,
          statusCode: 408,
          ok: false,
          message: 'Request Timeout',
          ms: Date.now() - t
        });
      });
  });
};
