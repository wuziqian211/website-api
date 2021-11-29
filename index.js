module.exports = (req, res) => {
  if (!req.headers.accept || req.headers.accept.split(',').indexOf('text/html') == -1) {
    res.status(404).json({code: -404});
  } else {
    res.status(200).send(`<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <title>欢迎来到 API 页面 | wuziqian211's Blog</title>
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">
  </head>
  <body>
    <div><div style="font-size: 40px; font-weight: bold;">wuziqian211's Blog - 欢迎您来到 API 页面！</div>本网站主要为 wuziqian211's Blog 的一些功能提供服务。</div>
  </body>
</html>`);
  }
};
