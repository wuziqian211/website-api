import type { BodyInit } from 'undici-types';

import util from 'node:util';

const encodeHTML = (str: string | null): string => typeof str === 'string' ? str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/ (?= )|(?<= ) |^ | $/gm, '&nbsp;').replace(/\r\n|\r|\n/g, '<br />') : '';

export const GET = (req: Request): Promise<Response> => new Promise(async resolve => {
  const params = new URL(req.url).searchParams;
  try {
    const headers = new Headers(req.headers), urlParam = params.get('url'), respHeaders = new Headers();
    if (!urlParam) {
      resolve(new Response('<!DOCTYPE html><title>Request</title><form><label for=url>Request URL:</label> <input type=url name=url id=url placeholder="https://"> <input type=submit value=Request></form>', { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }));
      return;
    }
    [...headers.keys()].filter(name => ['connection', 'content-length', 'forwarded', 'host', 'if-none-match', 'access-control-max-age', 'content-security-policy', 'referrer-policy', 'strict-transport-security'].includes(name) || name.startsWith('x-') || name.startsWith('cf-') || name.startsWith('access-control-allow-')).forEach(name => headers.delete(name));
    const requestUrl = new URL(urlParam);
    headers.set('Origin', requestUrl.origin);
    const referrer = new URL(req.headers.get('referer') ?? requestUrl);
    referrer.host = requestUrl.host;
    headers.set('Referer', referrer.href);
    [...params.entries()].filter(([name]) => name !== 'url').forEach(([name, value]) => headers.set(name, value));

    let body: BodyInit = null;
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      body = await req.arrayBuffer();
    }

    const resp = await fetch(requestUrl, { method: req.method, headers, body, redirect: 'manual' });

    if (resp.headers.has('Content-Type')) respHeaders.set('Content-Type', resp.headers.get('Content-Type')!.replace(/text\/html/g, 'text/plain'));
    [...resp.headers.entries()].filter(([name]) => ['Content-Disposition', 'Content-Range', 'Refresh'].includes(name)).forEach(([name, value]) => respHeaders.set(name, value));
    if (resp.headers.has('Location')) {
      params.set('url', new URL(resp.headers.get('Location')!, requestUrl).href);
      respHeaders.set('Location', `?${params.toString()}`);
    }
    resp.headers.forEach((value, name) => respHeaders.set('X-Http-' + name, value));

    resolve(new Response(resp.body, { status: resp.status, headers: respHeaders }));
  } catch (e) {
    resolve(new Response(`<!DOCTYPE html><title>An error occurred</title>An error occurred while requesting "${encodeHTML(params.get('url'))}":<pre>${encodeHTML(util.inspect(e, { depth: Infinity }))}</pre>`, { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }));
  }
});
export const HEAD = GET, OPTIONS = GET, POST = GET, PUT = GET, DELETE = GET, PATCH = GET;
