import type { BodyInit } from 'undici-types';

type resolveFn<Type> = (returnValue: Type) => void;

import util from 'node:util';

const encodeHTML = (str?: string | null): string => typeof str === 'string' ? str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/ (?= )|(?<= ) |^ | $/gm, '&nbsp;').replace(/\r\n|\r|\n/g, '<br />') : '';

export const GET = (req: Request): Promise<Response> => new Promise(async (resolve: resolveFn<Response>): Promise<void> => {
  const params = new URL(req.url).searchParams;
  try {
    const headers = new Headers(req.headers), respHeaders = new Headers();
    [...headers.keys()].filter(name => ['connection', 'host', 'forwarded', 'content-length', 'if-none-match', 'access-control-max-age'].includes(name) || name.startsWith('x-') || name.startsWith('cf-') || name.startsWith('access-control-allow-')).forEach(name => headers.delete(name));
    const requestUrl = new URL(params.get('url')!);
    headers.set('Origin', requestUrl.origin);
    const referrer = new URL(req.headers.get('referer') ?? requestUrl);
    referrer.host = requestUrl.host;
    headers.set('Referer', referrer.href);
    [...params.entries()].filter(([name]) => name !== 'url').forEach(([name, value]) => headers.set(name, value));
    
    let body: BodyInit = null;
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      body = req.body;
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
    resolve(new Response(`<!DOCTYPE html>An error occurred while requesting ${encodeHTML(params.get('url'))}:<pre>${encodeHTML(util.inspect(e, { depth: Infinity }))}</pre>`, { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }));
  }
});
export const HEAD = GET, OPTIONS = GET, POST = GET, PUT = GET, DELETE = GET, PATCH = GET;
