module.exports = (req, res) => {
  if ((!req.headers.accept || req.headers.accept.indexOf('html') == -1) && req.headers['x-pjax'] != 'true') {
    res.status(404).json({code: -404});
  } else {
    res.status(200).send(`<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>欢迎来到 API 页面 | wuziqian211's Blog API</title>
    <link rel="stylesheet" href="/res/style.css" />
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
    <link rel="stylesheet" href="/res/animate.min.css" />
    <script src="/res/pjax.min.js"></script>
  </head>
  <body>
    <!-- Reference code: status.fastgit.org -->
    <div class="data-pjax">
      <span class="face animate__animated animate__fadeIn animate__faster">:)</span>
      <p class="content animate__animated animate__fadeIn animate__faster">欢迎您来到 API 页面！<br />这些 API 主要为 wuziqian211's Blog 的一些功能提供服务。</p>
      <p class="content animate__animated animate__fadeIn animate__faster">可用 API：<br /><a href="/getbili.js">获取哔哩哔哩指定用户信息</a><br /><a href="/getfollow.js">获取哔哩哔哩指定用户关注、粉丝数</a></p>
      <p class="home animate__animated animate__fadeIn animate__faster"><a href="https://wuziqian211.top/">返回网站首页</a></p>
      <span class="tips animate__animated animate__fadeIn animate__faster">MULTIPLE_CHOICES</span>
    </div>
    <script>
      var pjax = new Pjax({
        selectors: ['title', '.data-pjax'],
        cacheBust: false
      });
      document.addEventListener('pjax:error', function() {
        document.location.href = event.request.responseURL;
      });
      document.addEventListener('pjax:send', function() {
        document.querySelectorAll('.animate__animated').forEach(function(e) {
          e.classList.remove('animate__fadeIn');
          e.classList.add('animate__fadeOut');
        });
      });
    </script>
  </body>
</html>`);
  }
};
