module.exports = (req, res) => {
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
    <p>您似乎输入错了网址，您是否想要访问 <a href="https://wuziqian211.top${req.url}">https://wuziqian211.top${req.url}</a>？</p>
    <span class="tips">NOT_FOUND</span>
  </body>
</html>`);
};
