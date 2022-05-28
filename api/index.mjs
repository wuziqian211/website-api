'use strict';
import * as utils from '../assets/utils.mjs';
export default (req, res) => {
  const startTime = Date.now();
  try {
    if (utils.getAccept(req) === 1) {
      res.status(200).send(utils.renderHTML({startTime, title: '欢迎来到 API 页面', body: `
      欢迎您来到 <a target="_blank" href="https://wuziqian211.top/">wuziqian211's Blog</a> 的 API 页面！<br />
      这些 API 主要为 wuziqian211's Blog 的一些功能提供服务。<br />
      <br />
      其中，下面这些 API 是公开的，任何合法网站和程序都能调用：<br />
      <a href="/api/getuser">获取哔哩哔哩用户信息及关注、粉丝数</a><br />
      <a href="/api/getvideo">获取哔哩哔哩视频信息及数据</a>
    `}));
    } else {
      res.status(404).json({code: -404});
    }
  } catch (e) {
    console.error(e);
    res.status(500).send(utils.render500(startTime));
  }
};
