module.exports = (req, res) => {
  if (req.getHeader('Accept').indexOf('text/html') == -1) {
    res.status(200).json({code: 0});
  } else {
    res.status(200).send(`<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <title>欢迎 | wuziqian211's Blog</title>
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">
  </head>
  <body>
    <div><div style="font-size: 40px; font-weight: bold;">wuziqian211's Blog - 欢迎您来到API页面！</div>本网站主要是用来执行API操作的。</div>
  </body>
</html>`);
};
