'use strict';
const HTML = require('../assets/html');
module.exports = (req, res) => {
  if (req.headers.accept?.indexOf('html') !== -1 || req.headers['sec-fetch-dest'] === 'document' || req.headers['x-pjax'] === 'true') {
    res.status(404).send(HTML({title: 'API 不存在', body: `
      您访问的 API 不存在，请到<a href="/api/">首页</a>查看目前可用的 API 列表`}));
  } else {
    res.status(404).json({code: -404});
  }
};
