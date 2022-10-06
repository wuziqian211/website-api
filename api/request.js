import fetch from 'node-fetch';
export default async (req, res) => {
  let { headers } = req;
  delete headers.host;
  delete headers.forwarded;
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
  if (resp.status === 0) {
    res.status(500).send('Connection Error');
  } else {
    res.status(resp.status).setHeader('Content-Type', resp.headers.get('Content-Type').replace(/text\/html/, 'text/plain')).send(Buffer.from(await resp.arrayBuffer()));
  }
};
