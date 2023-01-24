export default (req, res) => {
  if (/^(?:.+\.)?wuziqian211.top$/.test(req.headers.host)) {
    let expectedURL;
    if (/^\/archive\/202|^\/wik|^\/abo/.test(req.url)) {
      expectedURL = `https://wuziqian211.top${req.url}`;
    } else if (/^\/api|^\/get/.test(req.url)) {
      expectedURL = `https://api.wuziqian211.top${req.url}`;
    }
    res.status(404).setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate').send(`<!DOCTYPE html>
      <html lang="zh-CN">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#fff" media="(prefers-color-scheme: light)" />
          <meta name="theme-color" content="#222" media="(prefers-color-scheme: dark)" />
          <title>页面不存在 | wuziqian211's Blog</title>
          <link rel="stylesheet" href="/assets/style.css" />
          <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        </head>
        <body>
          <header>
            <div class="header">
              <a class="no-underline" href="https://wuziqian211.top/">wuziqian211's Blog</a> <span class="description">一个简单的 Blog</span>
            </div>
          </header>
          <main>
            您似乎输入错了网址！请仔细检查您的网址是否输入正确。<br />
            ${expectedURL ? `您是否想要访问 <a href="${expectedURL}">${expectedURL}</a>？` : '<a href="https://wuziqian211.top/">点击此处返回 Blog 首页</a>'}
          </main>
          <footer>
            © 2021 – 2023 wuziqian211
          </footer>
        </body>
      </html>`);
  } else if (/^(?:.+\.)?w211.top$/.test(req.headers.host)) {
    const url = `https://${req.headers.host.replace(/^(.+\.)?w211.top$/, '$1wuziqian211.top')}${req.url}`;
    res.status(308).setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate').setHeader('Location', url).setHeader('Refresh', `0; url=${url}`).json({ code: 308, data: { url } });
  } else {
    const url = 'https://wuziqian211.top/';
    res.status(308).setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate').setHeader('Location', url).setHeader('Refresh', `0; url=${url}`).json({ code: 308, data: { url } });
  }
};
