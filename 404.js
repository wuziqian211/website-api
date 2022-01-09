module.exports = (req, res) => {
  res.status(404).send(`<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>页面不存在 | wuziqian211's Blog</title>
    <link rel="stylesheet" href="/style.css" />
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
  </head>
  <body>
    <!-- Reference code: status.fastgit.org -->
    <span class="face">:(</span>
    <p class="content">您似乎输入错了网址！您是否想要访问 <a href="https://wuziqian211.top${req.url}">https://wuziqian211.top${req.url}</a>？</p>
    <p class="home"><a href="https://wuziqian211.top/">返回网站首页</a></p>
    <span class="tips">NOT_FOUND</span>
  </body>
</html>`);
};
