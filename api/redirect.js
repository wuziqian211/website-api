export const config = { runtime: 'edge' };

export default (req, res) => {
  if (/^(?:.+\.)?yumeharu.top$/.test(req.headers.host)) {
    let expectedURL;
    if (/^\/arc|^\/wik|^\/abo|^\/fri/.test(req.url)) {
      expectedURL = `https://www.yumeharu.top${req.url}`;
    } else if (/^\/api|^\/get/.test(req.url)) {
      expectedURL = `https://api.yumeharu.top${req.url}`;
    }
    res.status(404).setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate').send(`
      <!DOCTYPE html>
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
              <a href="https://www.yumeharu.top/">wuziqian211's Blog</a> <span class="description">一个简单的 Blog</span>
            </div>
          </header>
          <main>
            您似乎输入错了网址！请仔细检查您的网址是否输入正确。<br />
            ${expectedURL ? `您是否想要访问 <a href="${expectedURL}">${expectedURL}</a>？` : '<a href="https://www.yumeharu.top/">点击此处返回 Blog 首页</a>'}
          </main>
          <footer>
            © 2021 – ${new Date(Date.now() + (new Date().getTimezoneOffset() + 480) * 60000).getFullYear()} wuziqian211
          </footer>
        </body>
      </html>`.replace(/[ \n]+/g, ' ').trim());
  } else if (/^(?:.+\.)?w211.top$/.test(req.headers.host)) {
    const url = `https://${req.headers.host.replace(/^(.+\.)?w211.top$/, '$1yumeharu.top')}${req.url}`;
    res.status(308).setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate').setHeader('Location', url).setHeader('Refresh', `0; url=${url}`).json({ code: 308, data: { url } });
  } else if (/^(?:.+\.)?wuziqian211.top$/.test(req.headers.host)) {
    const url = `https://${req.headers.host.replace(/^(.+\.)?wuziqian211.top$/, '$1yumeharu.top')}${req.url}`;
    res.status(308).setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate').setHeader('Location', url).setHeader('Refresh', `0; url=${url}`).json({ code: 308, data: { url } });
  } else if (/^(?:.+\.)?happycola.top$/.test(req.headers.host)) {
    const url = `https://et19798147-2.icoc.vc${req.url}`;
    res.status(308).setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate').setHeader('Location', url).setHeader('Refresh', `0; url=${url}`).json({ code: 308, data: { url } });
  } else {
    const url = 'https://www.yumeharu.top/';
    res.status(307).setHeader('Location', url).json({ code: 307, data: { url } });
  }
};
