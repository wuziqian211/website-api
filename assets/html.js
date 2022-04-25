'use strict';
const getTime = ts => `${Math.floor(ts / 86400)} 天 ${Math.floor(ts % 86400 / 3600)} 小时 ${Math.floor(ts % 3600 / 60)} 分钟 ${Math.floor(ts % 60)} 秒`;
module.exports = (st, data) => `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#EEE" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="#333" media="(prefers-color-scheme: dark)" />
    <title>${data.title} | wuziqian211's Blog API</title>
    <link rel="stylesheet" href="/assets/style.css" />
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
    <script src="/assets/pjax.min.js"></script>
    <style class="extra">${data.style || ''}</style>
  </head>
  <body>
    <header>
      <div class="header">
        <a class="noul" href="/api/">wuziqian211's Blog API</a>
      </div>
    </header>
    <main>${data.body}</main>
    <footer>
      © 2021 – 2022 wuziqian211<br />
      执行耗时 <span class="time-taken">${Date.now() - st}</span> ms<br />
      本站已稳定运行 <span class="running-time">${getTime(Date.now() / 1000 - 1636816554)}</span>
    </footer>
    <script>
      const pjax = new Pjax({selectors: ['title', 'style.extra', 'main', 'span.time-taken'], cacheBust: false});
      document.addEventListener('pjax:send', () => document.querySelector('main').classList.add('loading'));
      document.addEventListener('pjax:error', () => document.location.href = event.request.responseURL);
      const getTime = ts => \`\${Math.floor(ts / 86400)} 天 \${Math.floor(ts % 86400 / 3600)} 小时 \${Math.floor(ts % 3600 / 60)} 分钟 \${Math.floor(ts % 60)} 秒\`;
      const runningTime = document.querySelector('span.running-time');
      setInterval(() => runningTime.innerText = getTime(Date.now() / 1000 - 1636816554), 1000);
    </script>
  </body>
</html>`;
