export default async (req, res) => {
  try { 
    const { headers } = req;
    Object.keys(headers).forEach(name => (['connection', 'host', 'forwarded', 'if-none-match'].includes(name) || name.startsWith('x-') || name.startsWith('cf-') || name.startsWith('access-control-')) && delete headers[name]);
    const requestedUrl = new URL(req.query.url);
    headers.origin = requestedUrl.origin;
    const referrer = new URL(req.headers.referer || req.query.url);
    referrer.host = requestedUrl.host;
    headers.referer = referrer.href;
    Object.keys(req.query).forEach(name => name !== 'url' && (headers[name] = req.query[name]));
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
    ['Content-Disposition', 'Content-Range'].forEach(h => resp.headers.has(h) && res.setHeader(h, resp.headers.get(h)));
    resp.headers.forEach((value, name) => res.setHeader('X-Http-' + name, value));
    res.send(Buffer.from(await resp.arrayBuffer()));
  } catch (e) {
    res.status(500).send(`Error<br /><pre>${e.stack.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/ (?= )|(?<= ) |^ | $/gm, '&nbsp;').replace(/\n/g, '<br />')}</pre>`);
  }
};
