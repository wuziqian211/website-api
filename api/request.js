import util from 'node:util';

const encodeHTML = str => typeof str === 'string' ? str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/ (?= )|(?<= ) |^ | $/gm, '&nbsp;').replace(/\r\n|\r|\n/g, '<br />') : '';

export default async (req, res) => {
  try { 
    const { headers } = req;
    Object.keys(headers).filter(name => ['connection', 'host', 'forwarded', 'if-none-match'].includes(name) || name.startsWith('x-') || name.startsWith('cf-') || name.startsWith('access-control-')).forEach(name => delete headers[name]);
    const requestUrl = new URL(req.query.url);
    headers.origin = requestUrl.origin;
    const referrer = new URL(req.headers.referer || requestUrl);
    referrer.host = requestUrl.host;
    headers.referer = referrer.href;
    Object.keys(req.query).filter(name => name !== 'url').forEach(name => headers[name] = req.query[name]);
    let body;
    if (['POST', 'PUT'].includes(req.method)) {
      switch (req.headers['content-type']?.split(';')[0]) {
        case 'application/json':
          body = JSON.stringify(req.body);
          break;
        case 'application/x-www-form-urlencoded':
          body = new URLSearchParams(req.body);
          break;
        default:
          body = req.body;
      }
    }
    const resp = await fetch(requestUrl, { method: req.method, headers, body, redirect: 'manual' });
    res.status(resp.status);
    if (resp.headers.has('Content-Type')) res.setHeader('Content-Type', resp.headers.get('Content-Type').replace(/text\/html/g, 'text/plain'));
    ['Content-Disposition', 'Content-Range', 'Refresh'].forEach(h => resp.headers.has(h) && res.setHeader(h, resp.headers.get(h)));
    if (resp.headers.has('Location')) {
      const params = new URLSearchParams(req.query);
      params.set('url', new URL(resp.headers.get('Location'), requestUrl));
      res.setHeader('Location', `?${params}`);
    }
    resp.headers.forEach((value, name) => res.setHeader('X-Http-' + name, value));
    res.send(Buffer.from(await resp.arrayBuffer()));
  } catch (e) {
    res.status(500).send(`An error occurred while requesting ${encodeHTML(req.query.url)}:<pre>${encodeHTML(util.inspect(e, { depth: Infinity }))}</pre>`);
  }
};
