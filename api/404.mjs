'use strict';
import HTML from '../assets/html.mjs';
export default (req, res) => {
  const st = Date.now();
  const accept = req.headers.accept || '*/*';
  if (accept.indexOf('html') !== -1 || req.headers['sec-fetch-dest'] === 'document') {
    res.status(404).send(HTML(st, {title: 'API 不存在', body: `
      您请求的 API 不存在，请到<a href="/api/">首页</a>查看目前可用的 API 列表
    `}));
  } else {
    res.status(404).json({code: -404});
  }
};
