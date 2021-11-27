module.exports = (req, res) => {
  if (!req.headers.accept || req.headers.accept.split(',').indexOf('text/html') == -1) {
    res.status(404).json({code: -404});
  } else {
    res.status(404).send(`<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <title>页面不存在 | wuziqian211's Blog</title>
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">
  </head>
  <body>
    <div><div style="font-size: 40px; font-weight: bold;">wuziqian211's Blog - API 不存在</div>您访问的 API 不存在，请到<a href="https://api.wuziqian211.top/">首页</a>查看目前可用的 API 列表</div>
  </body>
</html>`);
  }
};
