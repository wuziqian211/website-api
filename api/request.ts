import type { BodyInit } from 'undici-types';

import util from 'node:util';

const encodeHTML = (str?: string): string => typeof str === 'string' ? str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/ (?= )|(?<= ) |^ | $/gm, '&nbsp;').replace(/\r\n|\r|\n/g, '<br />') : '';

export default {
  async fetch(req: Request): Promise<Response> {
    const { promise, resolve } = Promise.withResolvers<Response>(),
          requestId = req.headers.get('x-vercel-id') ?? crypto.randomUUID(), params = new URL(req.url).searchParams;

    try {
      const requestHeaders = new Headers(), urlParam = params.get('url')?.trim(), responseHeaders = new Headers();
      if (!urlParam) {
        resolve(new Response(`<!DOCTYPE html><title>Request</title><form><label for=url>Request URL:</label> <input type=url name=url id=url placeholder=https:// > <input type=submit value=Request></form>Request ID: <code>${encodeHTML(requestId)}</code>`, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }));
        return promise;
      }

      const requestUrl = new URL(urlParam);
      req.headers.entries()
        .filter(([name]) => !['accept-encoding', 'connection', 'content-length', 'forwarded', 'host', 'if-none-match', 'keep-alive', 'referer', 'te', 'transfer-encoding', 'upgrade', 'access-control-max-age', 'content-security-policy', 'referrer-policy', 'strict-transport-security'].includes(name) && !name.startsWith('x-') && !name.startsWith('cf-') && !name.startsWith('access-control-allow-'))
        .forEach(([name, value]) => requestHeaders.set(name, value));
      requestHeaders.set('Origin', requestUrl.origin);
      if (req.headers.has('Referer')) {
        const referrer = new URL(req.headers.get('Referer')!, requestUrl);
        if (referrer.host !== new URL(req.url).host) requestHeaders.set('Referer', referrer.href);
      }
      params.entries().filter(([name]) => name !== 'url').forEach(([name, value]) => requestHeaders.set(name, value));

      let body: BodyInit = null;
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        body = await req.arrayBuffer();
      }

      const resp = await fetch(requestUrl, { method: req.method, headers: requestHeaders, body, redirect: 'manual', signal: req.signal });

      if (resp.headers.has('Content-Type')) {
        responseHeaders.set('Content-Type', resp.headers.get('Content-Type')!.replace(/text\/html/g, 'text/plain'));
      }
      resp.headers.entries()
        .filter(([name]) => ['accept-ranges', 'content-disposition', 'content-range', 'refresh', 'retry-after', 'www-authenticate'].includes(name))
        .forEach(([name, value]) => responseHeaders.set(name, value));
      if (resp.headers.has('Location')) {
        params.set('url', new URL(resp.headers.get('Location')!, requestUrl).href);
        responseHeaders.set('Location', `?${params.toString()}`);
      }
      resp.headers.entries()
        .filter(([name]) => name !== 'set-cookie')
        .forEach(([name, value]) => responseHeaders.set(`X-Http-${name}`, value));
      resp.headers.getSetCookie().forEach(value => responseHeaders.append('X-Http-Set-Cookie', value));

      resolve(new Response(resp.body, { status: resp.status, headers: responseHeaders }));
    } catch (e) {
      console.error(e);
      resolve(new Response(`<!DOCTYPE html><title>An error occurred</title>An error occurred:<pre>${encodeHTML(Error.isError(e) ? util.inspect(e, { depth: Infinity }) : String(e))}</pre>Request ID: <code>${encodeHTML(requestId)}</code>`, { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }));
    }

    return promise;
  },
};
