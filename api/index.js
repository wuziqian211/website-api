const HTML = require('../assets/html');
module.exports = (req, res) => {
  if ((req.headers.accept && req.headers.accept.indexOf('html') !== -1) || req.headers['sec-fetch-dest'] === 'document' || req.headers['x-pjax'] === 'true') {
    res.status(200).send(HTML({title: '欢迎来到 API 页面', data: `
      欢迎您来到 API 页面！<br />
      这些 API 主要为 wuziqian211's Blog 的一些功能提供服务。<br />
      <br />
      可用 API：<br />
      <a href="/api/getbili">获取哔哩哔哩用户信息及其关注、粉丝数</a><br />
      <a href="/api/getvideo">获取哔哩哔哩视频信息及数据</a></p>`}));
  } else {
    res.status(404).json({code: -404});
  }
};
