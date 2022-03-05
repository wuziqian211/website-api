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
    <main>${data.body}
    </main>
    <footer>
      <div class="footer">
        &copy; 2021 - 2022 wuziqian211<br />
        页面生成时间：${new Date().getTime() - st} ms
      </div>
    </footer>
    <script>
      const pjax = new Pjax({selectors: ['title', 'style.extra', 'main'], cacheBust: false});
      document.addEventListener('pjax:send', () => document.querySelector('main').classList.add('loading'));
      document.addEventListener('pjax:error', () => document.location.href = event.request.responseURL);
    </script>
  </body>
</html>`;
