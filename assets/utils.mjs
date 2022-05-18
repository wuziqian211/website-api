'use strict';
const getRunningTime = ts => `${Math.floor(ts / 86400)} 天 ${Math.floor(ts % 86400 / 3600)} 小时 ${Math.floor(ts % 3600 / 60)} 分钟 ${Math.floor(ts % 60)} 秒`;
const renderHTML = data => `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#fff" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="#222" media="(prefers-color-scheme: dark)" />
    <title>${data.title} | wuziqian211's Blog API</title>
    <link rel="stylesheet" href="/assets/style.css" />
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
    <style class="extra">${data.style || ''}</style>
  </head>
  <body>
    <header>
      <div class="header">
        <a class="no-underline" href="/api/">wuziqian211's Blog API</a> <span class="desc">${data.desc || '一个简单的 API 页面'}</span>
      </div>
    </header>
    <main>${data.body}</main>
    <footer>
      © 2021 – 2022 wuziqian211<br />
      执行耗时 <span class="time-taken">${Date.now() - data.startTime}</span> ms<br />
      本站已稳定运行 <span class="running-time">${getRunningTime(Date.now() / 1000 - 1636816579.737)}</span>
    </footer>
    <script src="/assets/main.js"></script>
  </body>
</html>`;
const render404 = startTime => renderHTML({startTime, title: 'API 不存在', body: `
      您请求的 API 不存在，请到<a href="/api/">首页</a>查看目前可用的 API 列表 awa
    `});
const render500 = startTime => renderHTML({startTime, title: '服务器错误', body: `
      抱歉，本 API 在执行时出现了一些异常，请稍后重试 qwq
    `});
const encodeHTML = str => typeof str === 'string' ? str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/ /g, '&nbsp;').replace(/\n/g, '<br />') : '';
const toHTTPS = url => { // 将HTTP协议的网址改成HTTPS
  let u = url.split(':');
  u[0] = 'https';
  return u.join(':');
};
const getDate = ts => { // 根据时间戳返回日期时间
  let t = new Date(ts * 1000);
  let d = new Date(t.getTime() + (t.getTimezoneOffset() + 480) * 60000);
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
};
const getTime = s => typeof s === 'number' ? `${s >= 3600 ? `${Math.floor(s / 3600)}:` : ''}${Math.floor(s % 3600 / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}` : ''; // 根据秒数返回时、分、秒
const getNumber = n => typeof n === 'number' ? n >= 100000000 ? `${n / 100000000} 亿` : n >= 10000 ? `${n / 10000} 万` : `${n}` : '';
const tobv = aid => { // AV号转BV号，改编自https://www.zhihu.com/question/381784377/answer/1099438784
  const table = 'fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF';
  const t = (BigInt(aid) ^ 177451812n) + 8728348608n;
  let bvid = ['B', 'V', '1', , ,'4', , '1', , '7', , , ];
  for (let i = 0n; i < 6n; i++) {
    bvid[[11, 10, 3, 8, 4, 6][i]] = table[t / (58n ** i) % 58n];
  }
  return bvid.join('');
};
const toBV = vid => {
  if (typeof vid !== 'string') return;
  if (/^(?:AV|av)\d+$/.test(vid)) { // 判断参数值开头是否为“av”或“AV”且剩余部分为数字
    return tobv(vid.slice(2));
  } else if (/^\d+$/.test(vid)) { // 判断参数值是否为数字
    return tobv(vid);
  } else if (/^(?:BV|bv)1[1-9A-HJ-NP-Za-km-z]{2}4[1-9A-HJ-NP-Za-km-z]1[1-9A-HJ-NP-Za-km-z]7[1-9A-HJ-NP-Za-km-z]{2}$/.test(vid)) { // 判断参数值是否为BV号
    return 'BV' + vid.slice(2); // 直接返回
  }
};
export {renderHTML, render404, render500, encodeHTML, toHTTPS, getDate, getTime, getNumber, tobv, toBV};
