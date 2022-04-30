module.exports = (req, res) => res.status(404).send(`<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#FFF" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="#222" media="(prefers-color-scheme: dark)" />
    <title>页面不存在 | wuziqian211's Blog</title>
    <link rel="stylesheet" href="${process.env.URL}/assets/style.css" />
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
  </head>
  <body>
    <header>
      <div class="header">
        <a class="no-underline" href="https://wuziqian211.top/">wuziqian211's Blog</a>
      </div>
    </header>
    <main>
      您似乎输入错了网址！您是否想要访问 <a href="https://wuziqian211.top${req.url}">https://wuziqian211.top${req.url}</a>？
    </main>
    <footer>
      © 2021 – 2022 wuziqian211
    </footer>
  </body>
</html>`);
