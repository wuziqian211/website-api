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
    if (req.method === 'POST') {
      if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
        body = new URLSearchParams();
        for (const name in req.body) {
          body.append(name, req.body[name]);
        }
      } else {
        body = req.body;
      }
    }
    console.log(req.query, headers, body);
    const resp = await fetch(req.query.url, { method: req.method, headers, body });
    res.status(resp.status);
    if (resp.headers.get('Content-Type')) res.setHeader('Content-Type', resp.headers.get('Content-Type').replace(/text\/html/, 'text/plain'));
    if (resp.headers.get('Content-Disposition')) res.setHeader('Content-Disposition', resp.headers.get('Content-Disposition'));
    for (const h of resp.headers) res.setHeader('X-Http-' + h[0], h[1]);
    res.send(Buffer.from(await resp.arrayBuffer()));
  } catch (e) {
    res.status(500).send(`Error<br /><pre>${e.stack.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/ (?= )|(?<= ) |^ | $/gm, '&nbsp;').replace(/\n/g, '<br />')}</pre>`);
  }
};
