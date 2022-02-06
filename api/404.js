const HTML = require('../assets/html');
module.exports = (req, res) => {
  if ((!req.headers.accept || req.headers.accept.indexOf('html') === -1) && req.headers['x-pjax'] !== 'true') {
    res.status(404).json({code: -404});
  } else {
    res.status(404).send(HTML({title: 'API 不存在', data: `
      <span class="face animate__animated animate__fadeIn animate__faster">:(</span>
      <p class="content animate__animated animate__fadeIn animate__faster">您访问的 API 不存在，请到<a href="/">首页</a>查看目前可用的 API 列表</p>
      <p class="home animate__animated animate__fadeIn animate__faster"><a href="/">返回 API 首页</a></p>
      <span class="tips animate__animated animate__fadeIn animate__faster">NOT_FOUND</span>`}));
  }
};
