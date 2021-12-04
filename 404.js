module.exports = (req, res) => {
  if (!req.headers.accept || req.headers.accept.indexOf('html') == -1) {
    res.status(404).json({code: -404});
  } else {
    res.status(404).send(`<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>页面不存在 | wuziqian211's Blog</title>
    <style type="text/css">body {
  background-color: #0078B7;
  color: #FFF;
  font-family: "Segoe UI", "Arial", "Microsoft Yahei", Helvetica, sans-serif;
  padding: 90px 0 0 90px;
}
.face {
  font-size: 100px;
}
.tips {
  display: inline-block;
  padding-top: 10px;
  font-size: 14px;
  line-height: 20px;
}
a {
  color: #FFF;
}
p {
  font-size: 24px;
}</style>
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">
  </head>
  <body>
    <!-- Reference code: status.fastgit.org -->
    <span class="face">:(</span>
    <p>您访问的 API 不存在，请到<a href="https://api.wuziqian211.top/">首页</a>查看目前可用的 API 列表</p>
    <span class="tips">NOT_FOUND</span>
  </body>
</html>`);
  }
};
