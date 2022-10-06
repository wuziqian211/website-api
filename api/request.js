import fetch from 'node-fetch';
const handler = async (req, res) => {
  let { headers } = req;
  delete headers.host;
  for (const name in headers) {
    if (name.startsWith('x-')) delete headers[name];
  }
  const u = new URL(req.query.url);
  headers.origin = u.origin;
  let t = new URL(req.headers.referer || req.query.url);
  t.host = u.host;
  headers.referer = t.href;
  if (req.url !== '/api/request') {
    await handler({ headers: req.headers, method: req.method, query: { url: t.origin + req.url }, url: '/api/request' }, res);
    return;
  }
  const resp = await fetch(req.query.url, { method: req.method, headers });
  if (resp.status === 0) res.status(404).send('Error Not Found');
  res.status(resp.status).setHeader('Content-Type', resp.headers.get('Content-Type')).send(Buffer.from(await resp.arrayBuffer()));
};
export default handler;
