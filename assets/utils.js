import util from 'node:util';
import { kv } from '@vercel/kv';
import md5 from 'md5';

let cachedWbiKeys, timer;
const initialize = (req, res) => { // 初始化 API
  const startTime = performance.now();
  let accept;
  if (req.headers.accept?.toUpperCase().includes('HTML') || req.headers['sec-fetch-dest']?.toUpperCase() === 'DOCUMENT') { // 客户端想要获取类型为“文档”的数据
    accept = 1;
  } else if (req.headers.accept?.toUpperCase().includes('IMAGE') || req.headers['sec-fetch-dest']?.toUpperCase() === 'IMAGE') { // 客户端想要获取类型为“图片”的数据
    accept = 2;
  } else {
    accept = 0;
  }
  timer = setTimeout(() => send504(accept, res, performance.now() - startTime), 9500); // API 超时处理
  return { startTime, accept, canAcceptVideo: req.headers['sec-fetch-dest']?.toUpperCase() === 'VIDEO' };
};
const getRunningTime = ts => `${Math.floor(ts / 86400)} 天 ${Math.floor(ts % 86400 / 3600)} 小时 ${Math.floor(ts % 3600 / 60)} 分钟 ${Math.floor(ts % 60)} 秒`; // 获取网站运行时间
const sendHTML = (res, startTime, data) => { // 发送 HTML 页面到客户端
  clearTimeout(timer);
  const execTime = (performance.now() - startTime).toFixed(3);
  res.setHeader('Content-Type', 'text/html; charset=utf-8').setHeader('X-Api-Exec-Time', execTime).send(`
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
        <link rel="apple-touch-icon" href="${data.appleTouchIcon ?? '/assets/apple-touch-icon.png'}" referrerpolicy="no-referrer" />
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
          执行本 API 耗时 <span class="time-taken">${execTime}</span> ms<br />
          本站已稳定运行 <span class="running-time">${getRunningTime(Date.now() / 1000 - 1636816579.737)}</span><br />
          部署于 <a target="_blank" rel="noopener external nofollow noreferrer" href="https://vercel.com/">Vercel</a>
        </footer>
        <script src="/assets/main.js"></script>
      </body>
    </html>`.replace(/<br \/>[ \r\n]*(?=<\/)/g, '').replace(/[ \r\n]+/g, ' ').trim());
};
const sendJSON = (res, startTime, data) => { // 发送 JSON 数据到客户端
  clearTimeout(timer);
  const execTime = (performance.now() - startTime).toFixed(3);
  res.setHeader('X-Api-Exec-Time', execTime).setHeader('X-Api-Status-Code', data.code).json({ ...data, extInfo: { ...data.extInfo, apiExecTime: execTime } });
};
const send = (res, startTime, data) => { // 发送其他数据到客户端
  clearTimeout(timer);
  res.setHeader('X-Api-Exec-Time', (performance.now() - startTime).toFixed(3)).send(data);
};
const send404 = (responseType, res, startTime, noCache) => {
  res.status(404);
  if (responseType === 1) {
    if (!noCache) res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    sendHTML(res, startTime, { title: 'API 不存在', newStyle: true, body: '您请求的 API 不存在，请到<a href="/api/">首页</a>查看目前可用的 API 列表 awa' });
  } else {
    sendJSON(res, startTime, { code: -404, message: '啥都木有', data: null, extInfo: { errType: 'internalServerNotFound' } });
  }
};
const send500 = (responseType, res, startTime, error) => {
  console.error(error);
  if (res.headersSent) return; // 如果是在发送响应之后抛出错误的，就防止再次发送响应到客户端
  res.status(500);
  ['Cache-Control', 'Content-Disposition', 'Content-Type', 'Retry-After'].forEach(h => res.removeHeader(h));
  if (responseType === 1) {
    sendHTML(res, startTime, { title: 'API 执行时出现异常', newStyle: true, body: `
      抱歉，本 API 在执行时出现了一些异常，请稍后重试 qwq<br />
      您可以将下面的错误信息告诉 wuziqian211 哟 awa
      <pre>${encodeHTML(util.inspect(error, { depth: Infinity }))}</pre>` });
  } else {
    sendJSON(res, startTime, { code: -500, message: error.message, data: null, extInfo: { errType: 'internalServerError', errStack: util.inspect(error, { depth: Infinity }) } });
  }
};
const send504 = (responseType, res, startTime) => {
  if (res.headersSent) return; // 如果是在发送响应之后超时的，就防止再次发送响应到客户端
  res.status(504);
  ['Cache-Control', 'Content-Disposition', 'Content-Type', 'Retry-After'].forEach(h => res.removeHeader(h));
  if (responseType === 1) {
    sendHTML(res, startTime, { title: 'API 执行超时', newStyle: true, body: `
      抱歉，本 API 的执行已经超时了，请您再尝试调用一次本 API 吧 qwq<br />
      如果您仍然看到本错误信息，请跟 wuziqian211 反馈哟 awa` });
  } else {
    sendJSON(res, startTime, { code: -504, message: '服务调用超时', data: null, extInfo: { errType: 'internalServerTimedOut' } });
  }
};
const redirect = (res, startTime, url, statusCode = 308, noCache) => { // 发送重定向信息到客户端
  res.status(statusCode).setHeader('Location', url);
  if (statusCode === 308) res.setHeader('Refresh', `0; url=${url}`);
  if (!noCache) {
    switch (statusCode) {
      case 308:
      case 301:
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        break;
      case 307:
      case 302:
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
        break;
    }
  }
  sendJSON(res, startTime, { code: statusCode, message: 'redirect', data: null, extInfo: { redirectUrl: url } });
};
const encodeHTML = str => typeof str === 'string' ? str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/ (?= )|(?<= ) |^ | $/gm, '&nbsp;').replace(/\r\n|\r|\n/g, '<br />') : '';
const markText = str => { // 将纯文本中的特殊标记转化成可点击的链接
  if (typeof str !== 'string') return '';
  const components = [{ content: str }],
    replacementRules = [ // 替换规则
    { pattern: /(https?):\/\/[\w\-]+(?:\.[\w\-]+)+(?:[\w\-\.,@?^=%&:\/~\+#]*[\w\-\@?^=%&\/~\+#])?/i, replacement: match => match },
    { pattern: /(?:BV|bv|Bv|bV)([1-9A-HJ-NP-Za-km-z]{10})/, replacement: (match, p1) => `https://www.bilibili.com/video/BV${p1}/` },
    { pattern: /av(\d+)/i, replacement: (match, p1) => `https://www.bilibili.com/video/av${p1}/` },
    { pattern: /sm(\d+)/i, replacement: (match, p1) => `https://www.nicovideo.jp/watch/sm${p1}` },
    { pattern: /cv(\d+)/i, replacement: (match, p1) => `https://www.bilibili.com/read/cv${p1}` },
    { pattern: /md(\d+)/i, replacement: (match, p1) => `https://www.bilibili.com/bangumi/media/md${p1}` },
    { pattern: /ss(\d+)/i, replacement: (match, p1) => `https://www.bilibili.com/bangumi/play/ss${p1}` },
    { pattern: /ep(\d+)/i, replacement: (match, p1) => `https://www.bilibili.com/bangumi/play/ep${p1}` },
  ];
  for (const p of replacementRules) {
    for (let i = 0; i < components.length; i++) { // 由于下面的代码可能会导致 components 的元素变化，为确保能遍历每一个需要遍历的元素，此处不能使用 for (const c of components)
      if (!components[i].url) { // 该组成部分没有转化成链接
        const { content } = components[i];
        const result = p.pattern.exec(content);
        if (result) {
          const [match, ...capturedMatches] = result, { index } = result;
          components.splice(i++, 0, { content: content.slice(0, index) }); // 在该组成部分前插入一个内容为匹配文本之前的文本的组成部分
          components[i].content = match, components[i].url = p.replacement(match, ...capturedMatches); // 将该组成部分修改成已经转化的链接
          components.splice(i + 1, 0, { content: content.slice(index + match.length) }); // 在该组成部分后插入一个内容为匹配文本之后的文本的组成部分
        }
      }
    }
  }
  return components.map(c => c.url ? `<a target="_blank" rel="noopener external nofollow noreferrer" href="${encodeHTML(c.url)}">${encodeHTML(c.content)}</a>` : encodeHTML(c.content)).join('');
};
const toHTTPS = url => { // 将网址协议改成 HTTPS
  if (!url) return 'data:,';
  const u = new URL(url);
  u.protocol = 'https:';
  return u.href;
};
const getDate = ts => { // 根据时间戳返回日期时间
  if (typeof ts !== 'number' || ts === 0) return '未知';
  const t = new Date(ts * 1000);
  const d = new Date(t.getTime() + (t.getTimezoneOffset() + 480) * 60000);
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
};
const getTime = s => typeof s === 'number' ? `${s >= 3600 ? `${Math.floor(s / 3600)}:` : ''}${Math.floor(s % 3600 / 60).toString().padStart(2, '0')}:${Math.floor(s % 60).toString().padStart(2, '0')}` : ''; // 根据秒数返回时、分、秒
const getNumber = n => typeof n === 'number' && n >= 0 ? n >= 100000000 ? `${n / 100000000} 亿` : n >= 10000 ? `${n / 10000} 万` : `${n}` : '-';
const largeNumberHandler = s => typeof s === 'string' && /^\d+$/.test(s) ? +s < Number.MAX_SAFE_INTEGER && +s > Number.MIN_SAFE_INTEGER ? +s : s : typeof s === 'bigint' ? Number(s) < Number.MAX_SAFE_INTEGER && Number(s) > Number.MIN_SAFE_INTEGER ? Number(s) : s.toString() : s; // 大数处理（参数类型为文本或 BigInt），对于过大或过小的数字直接返回文本，否则返回数字
const toBV = aid => { // AV 号转 BV 号，改编自 https://www.zhihu.com/question/381784377/answer/1099438784、https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/misc/bvid_desc.md
  const xorCode = 23442827791579n, maxAid = 1n << 51n, alphabet = 'FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf', encodeMap = [8, 7, 0, 5, 1, 3, 2, 4, 6], bvid = [];
  const base = BigInt(alphabet.length);
  let t = (maxAid | BigInt(aid)) ^ xorCode;
  for (let i = 0n; i < encodeMap.length; i++) {
    bvid[encodeMap[i]] = alphabet[t % base];
    t /= base;
  }
  return 'BV1' + bvid.join('');
};
const toAV = bvid => { // BV 号转 AV 号，改编自 https://www.zhihu.com/question/381784377/answer/1099438784、https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/misc/bvid_desc.md
  if (!/^(?:BV|bv|Bv|bV)1[1-9A-HJ-NP-Za-km-z]{9}$/.test(bvid)) throw new TypeError('Invalid BV number');
  const xorCode = 23442827791579n, maskCode = (1n << 51n) - 1n, alphabet = 'FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf', decodeMap = [6, 4, 2, 3, 1, 5, 0, 7, 8];
  const base = BigInt(alphabet.length);
  let t = 0n;
  bvid = bvid.slice(3);
  for (let i = 0n; i < decodeMap.length; i++) {
    const index = BigInt(alphabet.indexOf(bvid[decodeMap[i]]));
    t = t * base + index;
  }
  return (t & maskCode) ^ xorCode;
};
const getVidType = vid => { // 判断编号类型
  if (typeof vid !== 'string') return {};
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
const encodeWbi = async (originalQuery, keys) => { // 对请求参数进行 Wbi 签名，改编自 https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/misc/sign/wbi.md
  if (!keys) keys = await getWbiKeys();
  let t = '';
  [46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52].forEach(n => t += (keys.imgKey + keys.subKey)[n]);
  const mixinKey = t.slice(0, 32), query = { ...originalQuery, wts: Math.floor(Date.now() / 1000) }; // 对 imgKey 和 subKey 进行字符顺序打乱编码，添加 wts 字段
  const params = new URLSearchParams(Object.keys(query).toSorted().map(name => [name, query[name].toString().replace(/[!'()*]/g, '')])); // 按照 key 重排参数，过滤 value 中的“!”“'”“(”“)”“*”字符
  params.append('w_rid', md5(params + mixinKey)); // 计算 w_rid
  return params;
};
const getWbiKeys = async noCache => { // 获取最新的 img_key 和 sub_key，改编自 https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/misc/sign/wbi.md
  if (!noCache && !cachedWbiKeys) cachedWbiKeys = await kv.get('wbiKeys');
  if (noCache || !cachedWbiKeys || Math.floor(cachedWbiKeys.updatedTimestamp / 3600000) !== Math.floor(Date.now() / 3600000)) {
    const ujson = await (await fetch('https://api.bilibili.com/x/web-interface/nav', { headers: { Cookie: `SESSDATA=${process.env.SESSDATA}; bili_jct=${process.env.bili_jct}`, Origin: 'https://www.bilibili.com', Referer: 'https://www.bilibili.com/', 'User-Agent': process.env.userAgent } })).json();
    const wbiKeys = { imgKey: ujson.data.wbi_img.img_url.replace(/^(?:.*\/)?([^\.]+)(?:\..*)?$/, '$1'), subKey: ujson.data.wbi_img.sub_url.replace(/^(?:.*\/)?([^\.]+)(?:\..*)?$/, '$1') };
    cachedWbiKeys = { ...wbiKeys, updatedTimestamp: Date.now() };
    await kv.set('wbiKeys', cachedWbiKeys);
    return wbiKeys;
  } else {
    return cachedWbiKeys;
  }
};

export default { initialize, sendHTML, sendJSON, send, send404, send500, send504, redirect, encodeHTML, markText, toHTTPS, getDate, getTime, getNumber, largeNumberHandler, toBV, toAV, getVidType, encodeWbi, getWbiKeys };
