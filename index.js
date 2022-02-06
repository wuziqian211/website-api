const HTML = require('./html');
module.exports = (req, res) => {
  if ((!req.headers.accept || req.headers.accept.indexOf('html') === -1) && req.headers['x-pjax'] !== 'true') {
    res.status(404).json({code: -404});
  } else {
    res.status(200).send(HTML({title: '欢迎来到 API 页面', data: `
      <span class="face animate__animated animate__fadeIn animate__faster">:)</span>
      <p class="content animate__animated animate__fadeIn animate__faster">欢迎您来到 API 页面！<br />这些 API 主要为 wuziqian211's Blog 的一些功能提供服务。</p>
      <p class="content animate__animated animate__fadeIn animate__faster">可用 API：<br /><a href="/getbili.js">获取哔哩哔哩指定用户信息及关注、粉丝数</a></p>
      <p class="home animate__animated animate__fadeIn animate__faster"><a href="https://wuziqian211.top/">返回网站首页</a></p>
      <span class="tips animate__animated animate__fadeIn animate__faster">MULTIPLE_CHOICES</span>`}));
  }
};
