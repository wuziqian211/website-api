const initialize = req => {
  let accept;
  if (req.headers.accept?.includes('html') || req.headers['sec-fetch-dest'] === 'document') { // 客户端想要获取类型为“文档”的数据
    accept = 1;
  } else if (req.headers.accept?.includes('image') || req.headers['sec-fetch-dest'] === 'image') { // 客户端想要获取类型为“图片”的数据
    accept = 2;
  } else {
    accept = 0;
  }
  return { startTime: req.__startTime__ || performance.now(), accept };
}
const getRunningTime = ts => `${Math.floor(ts / 86400)} 天 ${Math.floor(ts % 86400 / 3600)} 小时 ${Math.floor(ts % 3600 / 60)} 分钟 ${Math.floor(ts % 60)} 秒`;
const renderHTML = data => `
  <!DOCTYPE html>
  <html lang="zh-CN">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#fff" media="(prefers-color-scheme: light)" />
      <meta name="theme-color" content="#222" media="(prefers-color-scheme: dark)" />
      <title>${data.title} | wuziqian211's Blog API</title>
      <link rel="stylesheet" href="/assets/style.css" />
      <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
      ${data.appleTouchIcon ? `<link rel="apple-touch-icon" href="${data.appleTouchIcon}" referrerpolicy="no-referrer" />` : ''}
      <style class="extra">${data.style || ''}</style>
    </head>
    <body>
      <header>
        <div class="header">
          <div class="left"><a href="/api/">wuziqian211's Blog API</a> <span class="description">${data.desc || '一个简单的 API 页面'}</span></div>
          <div class="right"><a target="_blank" rel="noopener external nofollow noreferrer" href="https://github.com/${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}/tree/${process.env.VERCEL_GIT_COMMIT_REF}/">查看使用说明</a> <a href="https://www.yumeharu.top/">返回主站</a></div>
        </div>
      </header>
      <main>${data.body}</main>
      <footer>
        本 API 版权：© 2021 – 2023 wuziqian211<br />
        执行本 API 耗时 <span class="time-taken">${(performance.now() - data.startTime).toFixed(3)}</span> ms<br />
        本站已稳定运行 <span class="running-time">${getRunningTime(Date.now() / 1000 - 1636816579.737)}</span><br />
        部署于 <a target="_blank" rel="noopener external nofollow noreferrer" href="https://vercel.com/">Vercel</a>
      </footer>
      <script src="/assets/main.js"></script>
    </body>
  </html>`.replace(/<br \/>(?: |\n)*(?=<\/)/gm, '').replace(/(?: |\n)+/gm, ' ').trim();
const render404 = startTime => renderHTML({ startTime, title: 'API 不存在', body: `
  您请求的 API 不存在，请到<a href="/api/">首页</a>查看目前可用的 API 列表 awa` });
const render500 = (startTime, error) => {
  console.error(error);
  return renderHTML({ startTime, title: 'API 执行时出现异常', body: `
    抱歉，本 API 在执行时出现了一些异常，请稍后重试 qwq<br />
    您可以将下面的错误信息告诉 wuziqian211 哟 awa<br />
    <pre>${encodeHTML(error.stack)}</pre>` });
};
const renderExtraStyle = pic => `
  body {
    -webkit-backdrop-filter: blur(20px);
    backdrop-filter: blur(20px);
    background: url(${pic}) center/cover no-repeat fixed #fff;
    transition: background 0.5s 0.5s;
  }
  header, main {
    background: #fff9;
  }
  @media (prefers-color-scheme: dark) {
    body {
      -webkit-backdrop-filter: blur(20px) brightness(0.5);
      backdrop-filter: blur(20px) brightness(0.5);
      background-color: #222;
    }
    header, main {
      background: #2229;
    }
  }`;
const encodeHTML = str => typeof str === 'string' ? str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/ (?= )|(?<= ) |^ | $/gm, '&nbsp;').replace(/\n/g, '<br />') : '';
const markText = str => typeof str === 'string' ? str.replace(/(BV|bv|Bv|bV)(1[1-9A-HJ-NP-Za-km-z]{2}4[1-9A-HJ-NP-Za-km-z]1[1-9A-HJ-NP-Za-km-z]7[1-9A-HJ-NP-Za-km-z]{2})/g, '<a target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/video/BV$2/">$1$2</a>').replace(/(av(\d+))/gi, '<a target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/video/av$2/">$1</a>').replace(/(md(\d+))/gi, '<a target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/bangumi/media/md$2">$1</a>').replace(/(ss(\d+))/gi, '<a target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/bangumi/play/ss$2">$1</a>').replace(/(ep(\d+))/gi, '<a target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/bangumi/play/ep$2">$1</a>').replace(/((https?):\/\/[\w\-]+(\.[\w\-]+)+([\w\-\.,@?^=%&:\/~\+#]*[\w\-\@?^=%&\/~\+#])?)/gi, '<a target="_blank" rel="noopener external nofollow noreferrer" href="$1">$1</a>') : ''; // 此代码仍需完善
const toHTTPS = url => { // 将网址协议改成HTTPS
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
const toBV = aid => { // AV号转BV号，改编自https://www.zhihu.com/question/381784377/answer/1099438784
  const t = (BigInt(aid) ^ 177451812n) + 8728348608n;
  const bvid = ['B', 'V', '1', , , '4', , '1', , '7'];
  for (let i = 0n; i < 6n; i++) {
    bvid[[11, 10, 3, 8, 4, 6][i]] = 'fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF'[t / 58n ** i % 58n];
  }
  return bvid.join('');
};
const getVidType = vid => { // 判断编号类型
  if (typeof vid !== 'string') return {};
  if (/^av\d+$/i.test(vid)) { // 判断编号是否为前缀为“av”的AV号
    return { type: 1, vid: toBV(vid.slice(2)) };
  } else if (/^\d+$/.test(vid)) { // 判断编号是否为不带前缀的AV号
    return { type: 1, vid: toBV(vid) };
  } else if (/^(?:BV|bv|Bv|bV)1[1-9A-HJ-NP-Za-km-z]{2}4[1-9A-HJ-NP-Za-km-z]1[1-9A-HJ-NP-Za-km-z]7[1-9A-HJ-NP-Za-km-z]{2}$/.test(vid)) { // 判断编号是否为BV号
    return { type: 1, vid: 'BV' + vid.slice(2) };
  } else if (/^md\d+$/i.test(vid)) { // 判断编号是否为mdid
    return { type: 2, vid: parseInt(vid.slice(2)) };
  } else if (/^ss\d+$/i.test(vid)) { // 判断编号是否为ssid
    return { type: 3, vid: parseInt(vid.slice(2)) };
  } else if (/^ep\d+$/i.test(vid)) { // 判断编号是否为epid
    return { type: 4, vid: parseInt(vid.slice(2)) };
  } else { // 编号无效
    return {};
  }
};
export { initialize, renderHTML, render404, render500, renderExtraStyle, encodeHTML, markText, toHTTPS, getDate, getTime, getNumber, toBV, getVidType };
