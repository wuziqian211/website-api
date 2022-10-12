import fetch from 'node-fetch';
export default async (req, res) => {
  try { 
    let { headers } = req;
    delete headers.host;
    delete headers.forwarded;
    delete headers['if-none-match'];
    for (const name in headers) {
      if (name.startsWith('x-')) delete headers[name];
    }
    const u = new URL(req.query.url);
    headers.origin = u.origin;
    let t = new URL(req.headers.referer || req.query.url);
    t.host = u.host;
    headers.referer = t.href;
    for (const name in req.query) {
      if (name !== 'url') headers[name] = req.query[name];
    }
    let body;
    if (req.method === 'POST' || req.method === 'PUT') {
      switch (req.headers['content-type']) {
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
    const resp = await fetch(req.query.url, { method: req.method, headers, body });
    res.status(resp.status);
    if (resp.headers.has('Content-Type')) res.setHeader('Content-Type', resp.headers.get('Content-Type').replace(/text\/html/g, 'text/plain'));
    for (const h of ['Content-Disposition', 'Content-Range']) {
      if (resp.headers.has(h)) res.setHeader(h, resp.headers.get(h));
    }
    for (const [name, value] of resp.headers) res.setHeader('X-Http-' + name, value);
    res.send(Buffer.from(await resp.arrayBuffer()));
  } catch (e) {
    res.status(500).send(`Error<br /><pre>${e.stack.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/ (?= )|(?<= ) |^ | $/gm, '&nbsp;').replace(/\n/g, '<br />')}</pre>`);
  }
};
