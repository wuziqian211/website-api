module.exports = (req, res) => {
  res.status(404).send(`<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <title>页面不存在 | wuziqian211's Blog</title>
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">
  </head>
  <body>
    <div><div style="font-size: 40px; font-weight: bold;">wuziqian211's Blog - 您似乎输入错了网址！</div>本网站不是您要访问的网站，您是否想要访问 <a href="https://wuziqian211.top${req.url}">https://wuziqian211.top${req.url}</a>？</div>
  </body>
</html>`);
};
