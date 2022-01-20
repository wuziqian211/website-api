module.exports = (req, res) => {
  res.status(404).send(`<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#0078B7" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="#222" media="(prefers-color-scheme: dark)" />
    <title>页面不存在 | wuziqian211's Blog</title>
    <link rel="stylesheet" href="https://api.wuziqian211.top/res/style.css" />
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
    <link rel="stylesheet" href="https://api.wuziqian211.top/res/animate.min.css" />
  </head>
  <body>
    <!-- Reference code: status.fastgit.org -->
    <div>
      <span class="face animate__animated animate__fadeIn animate__faster">:(</span>
      <p class="content animate__animated animate__fadeIn animate__faster">您似乎输入错了网址！您是否想要访问 <a href="https://wuziqian211.top${req.url}">https://wuziqian211.top${req.url}</a>？</p>
      <p class="home animate__animated animate__fadeIn animate__faster"><a href="https://wuziqian211.top/">返回网站首页</a></p>
      <span class="tips animate__animated animate__fadeIn animate__faster">NOT_FOUND</span>
    </div>
  </body>
</html>`);
};
