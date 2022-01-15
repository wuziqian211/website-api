module.exports = (req, res) => {
  if ((!req.headers.accept || req.headers.accept.indexOf('html') == -1) && !req.query.t) {
    res.status(404).json({code: -404});
  } else {
    res.status(300).send(`<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>欢迎来到 API 页面 | wuziqian211's Blog API</title>
    <link rel="stylesheet" href="/style.css" />
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
    <script src="https://cdn.jsdelivr.net/npm/pjax/pjax.min.js"></script>
  </head>
  <body>
    <!-- Reference code: status.fastgit.org -->
    <span class="face">:)</span>
    <p class="content">欢迎您来到 API 页面！<br />这些 API 主要为 wuziqian211's Blog 的一些功能提供服务。</p>
    <p class="content">可用 API：<br /><a href="/getbili.js">获取哔哩哔哩指定用户信息</a><br /><a href="/getfollow.js">获取哔哩哔哩指定用户关注、粉丝数</a></p>
    <p class="home"><a href="https://wuziqian211.top/">返回网站首页</a></p>
    <span class="tips">MULTIPLE_CHOICES</span>
    <script>var pjax = new Pjax({selectors: ["title", ".face", ".content", "form", ".home", ".tips"]});</script>
  </body>
</html>`);
  }
};
