module.exports = (req, res) => {
  if (!req.headers.accept || req.headers.accept.indexOf('html') == -1) {
    res.status(404).json({code: -404});
  } else {
    res.status(300).send(`<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>欢迎来到 API 页面 | wuziqian211's Blog</title>
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
    <span class="face">:)</span>
    <p>欢迎您来到 API 页面！<br>本网站主要为 wuziqian211's Blog 的一些功能提供服务。</p>
    <p>可用 API：<br><a href="/getbili.js">获取哔哩哔哩指定用户信息</a></p>
    <span class="tips">MULTIPLE_CHOICES</span>
  </body>
</html>`);
  }
};
