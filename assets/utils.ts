import type { resolveFn, numericString, url, secondLevelTimestamp, millisecondLevelTimestamp, APIResponse, InternalAPIResponse, NavData } from './types.d.ts';
import type { BodyInit } from 'undici-types';

interface SendHTMLData {
  title: string; // 页面标题
  appleTouchIcon?: url; // 页面图标链接
  newStyle?: boolean; // 是否使用新样式
  imageBackground?: url; // 图片背景链接
  desc?: string; // 页面描述
  body: string; // 页面主体内容
}
interface Component {
  content: string; // 文本内容
  url?: url; // 链接
}
interface WbiKeys {
  imgKey: string;
  subKey: string;
}
interface CachedWbiKeys extends WbiKeys {
  updatedTimestamp: millisecondLevelTimestamp;
}
type ResponseType = 0 | 1 | 2 | 3; // 0：JSON，1：HTML，2：图片，3：视频，下同
type FetchDest = 0 | 1 | 2 | 3;
type Accept = 0 | 1 | 2 | 3;

import util from 'node:util';
import { kv } from '@vercel/kv';
import md5 from 'md5';

let cachedWbiKeys: CachedWbiKeys, timer: NodeJS.Timeout | undefined, startTime: millisecondLevelTimestamp;
const initialize = (req: Request, acceptedResponseTypes: ResponseType[], resolve?: resolveFn<Response>): { params: URLSearchParams; respHeaders: Headers; fetchDest: FetchDest | undefined; responseType: ResponseType } => { // 初始化 API
  startTime = performance.now();
  const params = new URL(req.url).searchParams, accepts: Accept[] = [],
        requestedAccept = req.headers.get('accept')?.toUpperCase(), requestedSecFetchDest = req.headers.get('sec-fetch-dest')?.toUpperCase(),
        requestedResponseType = params.get('type')?.toUpperCase().split('_')[0];
  let acceptAll: boolean | undefined, responseType: ResponseType | undefined, fetchDest: FetchDest | undefined;
  
  if (requestedSecFetchDest) {
    if (requestedSecFetchDest === 'JSON') { // 在 https://fetch.spec.whatwg.org/#destination-table 中提及，但在 MDN 中未提及
      fetchDest = 0;
    } else if (['DOCUMENT', 'FRAME', 'IFRAME'].includes(requestedSecFetchDest)) {
      fetchDest = 1;
    } else if (requestedSecFetchDest === 'IMAGE') {
      fetchDest = 2;
    } else if (requestedSecFetchDest === 'VIDEO') {
      fetchDest = 3;
    }
  }
  if (requestedAccept) {
    if (requestedAccept === '*/*') { // 客户端接受所有类型的数据
      acceptAll = true;
      accepts.push(0, 1, 2, 3);
    } else {
      if (requestedAccept.includes('JSON')) accepts.push(0);
      if (requestedAccept.includes('HTML')) accepts.push(1);
      if (requestedAccept.includes('IMAGE')) accepts.push(2);
      if (requestedAccept.includes('VIDEO')) accepts.push(3);
    }
  }
  
  // 回复数据类型判断优先级：“type”参数＞“Sec-Fetch-Dest”标头＞“Accept”标头
  if (requestedResponseType) { // 先取客户端指定的回复数据类型
    if (acceptedResponseTypes.includes(0) && requestedResponseType === 'JSON') {
      responseType = 0;
    } else if (acceptedResponseTypes.includes(1) && ['HTML', 'PAGE'].includes(requestedResponseType)) {
      responseType = 1;
    } else if (acceptedResponseTypes.includes(2) && ['IMAGE', 'IMG', 'PICTURE', 'PIC'].includes(requestedResponseType)) {
      responseType = 2;
    } else if (acceptedResponseTypes.includes(3) && requestedResponseType === 'VIDEO') {
      responseType = 3;
    }
  }
  if (responseType == undefined && fetchDest != undefined) { // 若客户端未指定回复数据类型或指定的回复数据类型无效，则从客户端指定的请求目标中获取
    if (acceptedResponseTypes.includes(0) && fetchDest === 0) {
      responseType = 0;
    } else if (acceptedResponseTypes.includes(1) && fetchDest === 1) {
      responseType = 1;
    } else if (acceptedResponseTypes.includes(2) && fetchDest === 2) {
      responseType = 2;
    } else if (acceptedResponseTypes.includes(3) && fetchDest === 3) {
      responseType = 3;
    }
  }
  if (responseType == undefined) { // 若上述操作未取到回复数据类型，则取客户端接受的数据类型；若仍未取到，则默认回复 JSON
    if (acceptAll) { // 部分脚本在发送请求时会自动带上“Accept: */*”标头，此时应该回复 JSON
      responseType = 0;
    } else {
      const filteredAccepts = accepts.filter(a => acceptedResponseTypes.includes(a));
      if (filteredAccepts.includes(1)) {
        responseType = 1;
      } else if (filteredAccepts.includes(2)) {
        responseType = 2;
      } else if (filteredAccepts.includes(3)) {
        responseType = 3;
      } else { // 默认回复 JSON
        responseType = 0;
      }
    }
  }
  
  if (resolve) { // API 超时处理
    timer = setTimeout(() => {
      timer = undefined;
      resolve(send504(responseType));
    }, 15000);
  }
  
  return { params, respHeaders: new Headers(), fetchDest, responseType };
};
const getRunningTime = (ts: secondLevelTimestamp): string => `${Math.floor(ts / 86400)} 天 ${Math.floor(ts % 86400 / 3600)} 小时 ${Math.floor(ts % 3600 / 60)} 分钟 ${Math.floor(ts % 60)} 秒`; // 获取网站运行时间
const sendHTML = (status: number, headers: Headers, data: SendHTMLData): Response => { // 发送 HTML 页面到客户端
  if (timer) {
    clearTimeout(timer);
    timer = undefined;
  }
  const execTime = performance.now() - startTime;
  headers.set('Content-Type', 'text/html; charset=utf-8');
  headers.set('X-Api-Exec-Time', execTime.toFixed(3));
  return new Response(`
    <!DOCTYPE html>
    <html lang="zh-CN">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#fff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#222" media="(prefers-color-scheme: dark)" />
        <title>${encodeHTML(data.title)} | wuziqian211's Blog API</title>
        <link rel="stylesheet" href="/assets/style.css" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="${data.appleTouchIcon ?? '/assets/apple-touch-icon.png'}" />
        <link rel="preload" href="/assets/iconfont.woff2" as="font" type="font/woff2" crossorigin />
      </head>
      <body${data.newStyle ? ' class="new-style"' : ''}${data.imageBackground ? ` class="image-background" style="background-image: url(${data.imageBackground});"` : ''}>
        <header>
          <div class="header">
            <div class="left"><a href="/api/">wuziqian211's Blog API</a> <span class="description">${data.desc ?? '一个简单的 API 页面'}</span></div>
            <div class="right"><a target="_blank" rel="noopener external nofollow noreferrer" href="https://github.com/${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}/tree/${process.env.VERCEL_GIT_COMMIT_REF}/#readme">查看使用说明</a> <a href="https://www.yumeharu.top/">返回主站</a></div>
          </div>
        </header>
        <main>${data.body}</main>
        <footer>
          本 API 版权：© 2021 – ${new Date(Date.now() + (new Date().getTimezoneOffset() + 480) * 60000).getFullYear()} wuziqian211<br />
          执行本 API 耗时 <span class="time-taken">${(execTime / 1000).toFixed(3)}</span> s<br />
          本站已稳定运行 <span class="running-time">${getRunningTime(Date.now() / 1000 - 1636816579.737)}</span><br />
          部署于 <a target="_blank" rel="noopener external nofollow noreferrer" href="https://vercel.com/">Vercel</a>
        </footer>
        <script src="/assets/main.js"></script>
      </body>
    </html>`.replace(/<br \/>[ \r\n]*(?=<\/)/g, '').replace(/[ \r\n]+/g, ' ').trim(), { status, headers });
};
const sendJSON = (status: number, headers: Headers, data: InternalAPIResponse<unknown>): Response => { // 发送 JSON 数据到客户端
  if (timer) {
    clearTimeout(timer);
    timer = undefined;
  }
  const execTime = performance.now() - startTime;
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('X-Api-Exec-Time', execTime.toFixed(3));
  headers.set('X-Api-Status-Code', data.code.toString());
  return Response.json({ ...data, extInfo: { ...data.extInfo, apiExecTime: execTime } }, { status, headers });
};
const send = (status: number, headers: Headers, data: BodyInit): Response => { // 发送其他数据到客户端
  if (timer) {
    clearTimeout(timer);
    timer = undefined;
  }
  headers.set('X-Api-Exec-Time', (performance.now() - startTime).toFixed(3));
  return new Response(data, { status, headers });
};
const send404 = (responseType: ResponseType, noCache?: boolean): Response => {
  const headers = new Headers();
  if (responseType === 1) {
    if (!noCache) headers.set('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return sendHTML(404, headers, { title: 'API 不存在', newStyle: true, body: '您请求的 API 不存在，请到<a href="/api/">首页</a>查看目前可用的 API 列表 awa' });
  } else {
    return sendJSON(404, headers, { code: -404, message: '啥都木有', data: null, extInfo: { errType: 'internalServerNotFound' } });
  }
};
const send500 = (responseType: ResponseType, error: unknown): Response => {
  console.error(error);
  const headers = new Headers();
  if (responseType === 1) {
    return sendHTML(500, headers, { title: 'API 执行时出现异常', newStyle: true, body: `
      抱歉，本 API 在执行时出现了一些异常，请稍后重试 qwq<br />
      您可以将下面的错误信息告诉 wuziqian211 哟 awa
      <pre>${encodeHTML(error instanceof Error ? typeof util.inspect === 'function' ? util.inspect(error, { depth: Infinity }) : error.stack : String(error))}</pre>` });
  } else {
    return sendJSON(500, headers, { code: -500, message: error instanceof Error ? error.message : String(error), data: null, extInfo: { errType: 'internalServerError', errStack: error instanceof Error ? typeof util.inspect === 'function' ? util.inspect(error, { depth: Infinity }) : error.stack : String(error) } });
  }
};
const send504 = (responseType: ResponseType): Response => {
  const headers = new Headers();
  if (responseType === 1) {
    return sendHTML(504, headers, { title: 'API 执行超时', newStyle: true, body: `
      抱歉，本 API 的执行已经超时了，请您再尝试调用一次本 API 吧 qwq<br />
      如果您仍然看到本错误信息，请跟 wuziqian211 反馈哟 awa` });
  } else {
    return sendJSON(504, headers, { code: -504, message: '服务调用超时', data: null, extInfo: { errType: 'internalServerTimedOut' } });
  }
};
const redirect = (status: number, url: url, noCache?: boolean): Response => { // 发送重定向信息到客户端
  const headers = new Headers({ Location: url });
  if (status === 308) headers.set('Refresh', `0; url=${url}`);
  if (!noCache) {
    switch (status) {
      case 308:
      case 301:
        headers.set('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        break;
      case 307:
      case 302:
        headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate');
        break;
    }
  }
  return sendJSON(status, headers, { code: status, message: 'redirect', data: { url }, extInfo: { redirectUrl: url } });
};
const encodeHTML = (str?: string): string => typeof str === 'string' ? str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/ (?= )|(?<= ) |^ | $/gm, '&nbsp;').replace(/\r\n|\r|\n/g, '<br />') : '';
const markText = (str?: string): string => { // 将纯文本中的特殊标记转化成可点击的链接
  if (typeof str !== 'string') return '';
  const components: Component[] = [{ content: str }],
        replacementRules = [ // 替换规则
          { pattern: /(https?):\/\/[\w\-]+(?:\.[\w\-]+)+(?:[\w\-\.,@?^=%&:\/~\+#]*[\w\-\@?^=%&\/~\+#])?/i, replacer: (match: url): url => match },
          { pattern: /(?:BV|bv|Bv|bV)1([1-9A-HJ-NP-Za-km-z]{9})/, replacer: (match: string, matches: string[]): url => `https://www.bilibili.com/video/BV1${matches[0]}/` },
          { pattern: /av(\d+)/i, replacer: (match: string, matches: string[]): url => `https://www.bilibili.com/video/av${matches[0]}/` },
          { pattern: /sm(\d+)/i, replacer: (match: string, matches: string[]): url => `https://www.nicovideo.jp/watch/sm${matches[0]}` },
          { pattern: /cv(\d+)/i, replacer: (match: string, matches: string[]): url => `https://www.bilibili.com/read/cv${matches[0]}` },
          { pattern: /md(\d+)/i, replacer: (match: string, matches: string[]): url => `https://www.bilibili.com/bangumi/media/md${matches[0]}` },
          { pattern: /ss(\d+)/i, replacer: (match: string, matches: string[]): url => `https://www.bilibili.com/bangumi/play/ss${matches[0]}` },
          { pattern: /ep(\d+)/i, replacer: (match: string, matches: string[]): url => `https://www.bilibili.com/bangumi/play/ep${matches[0]}` },
        ];
  for (const p of replacementRules) {
    for (let i = 0; i < components.length; i++) { // 由于下面的代码可能会导致 components 的元素变化，为确保能遍历每一个需要遍历的元素，此处不能使用 for (const c of components)
      if (!components[i].url) { // 该组成部分没有转化成链接
        const { content } = components[i];
        const result = p.pattern.exec(content);
        if (result) {
          const [match, ...capturedMatches] = result, { index } = result;
          components.splice(i++, 0, { content: content.slice(0, index) }); // 在该组成部分前插入一个内容为匹配文本之前的文本的组成部分
          components[i].content = match, components[i].url = p.replacer(match, capturedMatches); // 将该组成部分修改成已经转化的链接
          components.splice(i + 1, 0, { content: content.slice(index + match.length) }); // 在该组成部分后插入一个内容为匹配文本之后的文本的组成部分
        }
      }
    }
  }
  return components.map(c => c.url ? `<a target="_blank" rel="noopener external nofollow noreferrer" href="${encodeHTML(c.url)}">${encodeHTML(c.content)}</a>` : encodeHTML(c.content)).join('');
};
const toHTTPS = (url?: url): url => { // 将网址协议改成 HTTPS
  if (!url) return 'data:,';
  const u = new URL(url);
  u.protocol = 'https:';
  return u.href;
};
const getDate = (ts?: secondLevelTimestamp): string => { // 根据时间戳返回日期时间
  if (typeof ts !== 'number' || ts === 0) return '未知';
  const d = new Date(ts * 1000 + (new Date().getTimezoneOffset() + 480) * 60000);
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
};
const getTime = (s?: number): string => typeof s === 'number' ? `${s >= 3600 ? `${Math.floor(s / 3600)}:` : ''}${Math.floor(s % 3600 / 60).toString().padStart(2, '0')}:${Math.floor(s % 60).toString().padStart(2, '0')}` : ''; // 根据秒数返回时、分、秒
const getNumber = (n?: number): string => typeof n === 'number' && n >= 0 ? n >= 100000000 ? `${n / 100000000} 亿` : n >= 10000 ? `${n / 10000} 万` : `${n}` : '-';
const largeNumberHandler = (s: numericString | bigint | number): numericString | number => typeof s === 'string' && /^\d+$/.test(s) ? +s < Number.MAX_SAFE_INTEGER && +s > Number.MIN_SAFE_INTEGER ? +s : s : typeof s === 'bigint' ? Number(s) < Number.MAX_SAFE_INTEGER && Number(s) > Number.MIN_SAFE_INTEGER ? Number(s) : <numericString>s.toString() : s; // 大数处理（参数类型为文本或 BigInt），对于过大或过小的数字直接返回文本，否则返回数字
const toBV = (aid: bigint | number | string): string => { // AV 号转 BV 号，改编自 https://www.zhihu.com/question/381784377/answer/1099438784、https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/misc/bvid_desc.md
  const xorCode = 23442827791579n, maxAid = 1n << 51n, alphabet = 'FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf', encodeMap = [8, 7, 0, 5, 1, 3, 2, 4, 6], bvid = [];
  const base = BigInt(alphabet.length);
  let t = (maxAid | BigInt(aid)) ^ xorCode;
  for (const n of encodeMap) {
    bvid[n] = alphabet[Number(t % base)];
    t /= base;
  }
  return 'BV1' + bvid.join('');
};
const toAV = (bvid: string): bigint => { // BV 号转 AV 号，改编自 https://www.zhihu.com/question/381784377/answer/1099438784、https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/misc/bvid_desc.md
  if (!/^(?:BV|bv|Bv|bV)1[1-9A-HJ-NP-Za-km-z]{9}$/.test(bvid)) throw new TypeError('Invalid BV number');
  const xorCode = 23442827791579n, maskCode = (1n << 51n) - 1n, alphabet = 'FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf', decodeMap = [6, 4, 2, 3, 1, 5, 0, 7, 8];
  const base = BigInt(alphabet.length);
  let t = 0n;
  for (const n of decodeMap) {
    const index = BigInt(alphabet.indexOf(bvid[n + 3]));
    t = t * base + index;
  }
  return (t & maskCode) ^ xorCode;
};
const getVidType = (vid: string | null): { type?: 1 | 2 | 3 | 4; vid?: string | bigint } => { // 判断编号类型
  if (typeof vid !== 'string' || !vid) return {};
  if (/^av\d+$/i.test(vid) && BigInt(vid.slice(2)) > 0) { // 判断编号是否为前缀为“av”的 AV 号
    return { type: 1, vid: toBV(vid.slice(2)) };
  } else if (/^\d+$/.test(vid) && BigInt(vid) > 0) { // 判断编号是否为不带前缀的 AV 号
    return { type: 1, vid: toBV(vid) };
  } else if (/^(?:BV|bv|Bv|bV)1[1-9A-HJ-NP-Za-km-z]{9}$/.test(vid)) { // 判断编号是否为 BV 号
    return { type: 1, vid: 'BV' + vid.slice(2) };
  } else if (/^md\d+$/i.test(vid) && BigInt(vid.slice(2)) > 0) { // 判断编号是否为 mdid
    return { type: 2, vid: BigInt(vid.slice(2)) };
  } else if (/^ss\d+$/i.test(vid) && BigInt(vid.slice(2)) > 0) { // 判断编号是否为 ssid
    return { type: 3, vid: BigInt(vid.slice(2)) };
  } else if (/^ep\d+$/i.test(vid) && BigInt(vid.slice(2)) > 0) { // 判断编号是否为 epid
    return { type: 4, vid: BigInt(vid.slice(2)) };
  } else { // 编号无效
    return {};
  }
};
const encodeWbi = async (query?: ConstructorParameters<typeof URLSearchParams>[0], keys?: WbiKeys): Promise<URLSearchParams> => { // 对请求参数进行 Wbi 签名，改编自 https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/misc/sign/wbi.md
  keys ??= await getWbiKeys();
  const mixinKey = [46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52].reduce((accumulator, n) => accumulator + (keys.imgKey + keys.subKey)[n], '').slice(0, 32), // 对 imgKey 和 subKey 进行字符顺序打乱编码
        params = new URLSearchParams(query);
  params.append('wts', Math.floor(Date.now() / 1000).toString()); // 添加 wts 字段
  params.sort(); // 按照键名排序参数
  params.append('w_rid', md5(params.toString() + mixinKey)); // 计算 w_rid
  return params;
};
const getWbiKeys = async (noCache?: boolean): Promise<WbiKeys> => { // 获取最新的 img_key 和 sub_key，改编自 https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/misc/sign/wbi.md
  if (!noCache && !cachedWbiKeys) cachedWbiKeys = <CachedWbiKeys>await kv.get('wbiKeys');
  if (noCache || !cachedWbiKeys || Math.floor(cachedWbiKeys.updatedTimestamp / 3600000) !== Math.floor(Date.now() / 3600000)) {
    const ujson = <APIResponse<NavData>>await (await fetch('https://api.bilibili.com/x/web-interface/nav', { headers: { Cookie: `SESSDATA=${process.env.SESSDATA}; bili_jct=${process.env.bili_jct}`, Origin: 'https://www.bilibili.com', Referer: 'https://www.bilibili.com/', 'User-Agent': process.env.userAgent! } })).json();
    const wbiKeys: WbiKeys = { imgKey: ujson.data.wbi_img.img_url.replace(/^(?:.*\/)?([^\.]+)(?:\..*)?$/, '$1'), subKey: ujson.data.wbi_img.sub_url.replace(/^(?:.*\/)?([^\.]+)(?:\..*)?$/, '$1') };
    cachedWbiKeys = { ...wbiKeys, updatedTimestamp: Date.now() };
    await kv.set('wbiKeys', cachedWbiKeys);
    return wbiKeys;
  } else {
    return cachedWbiKeys;
  }
};

export type { SendHTMLData };
export default { initialize, sendHTML, sendJSON, send, send404, send500, send504, redirect, encodeHTML, markText, toHTTPS, getDate, getTime, getNumber, largeNumberHandler, toBV, toAV, getVidType, encodeWbi, getWbiKeys };
