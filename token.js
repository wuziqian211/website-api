module.exports = (req, res) => {
  if ((!req.headers.accept || req.headers.accept.indexOf('html') == -1) && req.headers['x-pjax'] != 'true') {
    res.status(200).json({
      code: 0,
      data: {
        token: 'YjNiNDZhNDE0NmU3OWQ1N2M1ZDMyMjdjZGY5NDlmMGU='
      }
    });
  } else {
    res.status(404).send(`<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>API 不存在 | wuziqian211's Blog API</title>
    <link rel="stylesheet" href="/style.css" />
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
    <link rel="stylesheet" href="/animate.min.css" />
    <script src="/pjax.min.js"></script>
  </head>
  <body>
    <!-- Reference code: status.fastgit.org -->
    <div class="data-pjax">
      <span class="face animate__animated animate__fadeIn animate__faster">:(</span>
      <p class="content animate__animated animate__fadeIn animate__faster">您访问的 API 不存在，请到<a href="https://api.wuziqian211.top/">首页</a>查看目前可用的 API 列表</p>
      <p class="home animate__animated animate__fadeIn animate__faster"><a href="/">返回 API 首页</a></p>
      <span class="tips animate__animated animate__fadeIn animate__faster">NOT_FOUND</span>
    </div>
    <script>var pjax = new Pjax({selectors: ["title", ".data-pjax"], cacheBust: false}); document.addEventListener('pjax:error', function(){document.location.href = event.options.request.responseURL;});</script>
  </body>
</html>`);
  }
};
