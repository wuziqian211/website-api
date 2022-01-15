module.exports = (req, res) => {
  if ((!req.headers.accept || req.headers.accept.indexOf('html') == -1) && !req.query.t) {
    res.status(404).json({code: -404});
  } else {
    res.status(404).send(`<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>API 不存在 | wuziqian211's Blog API</title>
    <link rel="stylesheet" href="/style.css" />
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
    <script src="https://cdn.jsdelivr.net/npm/pjax/pjax.min.js"></script>
  </head>
  <body>
    <!-- Reference code: status.fastgit.org -->
    <span class="face">:(</span>
    <p class="content">您访问的 API 不存在，请到<a href="/">首页</a>查看目前可用的 API 列表</p>
    <p class="home"><a href="/">返回 API 首页</a></p>
    <span class="tips">NOT_FOUND</span>
    <script>var pjax = new Pjax({selectors: ["title", ".face", ".content", "form", ".home", ".tips"]});</script>
  </body>
</html>`);
  }
};
