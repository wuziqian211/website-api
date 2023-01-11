import * as utils from '../assets/utils.js';
export default (req, res) => {
  const startTime = performance.now();
  try {
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    if (utils.getAccept(req) === 1) {
      res.status(200).send(utils.renderHTML({ startTime, title: '欢迎来到 API 页面', body: `
        欢迎您来到 <a target="_blank" href="https://wuziqian211.top/">wuziqian211's Blog</a> 的 API 页面！<br />
        这些 API 主要为 wuziqian211's Blog 的一些功能提供服务。<br />
        其中，下面这些 API 是公开的，任何合法网站和程序都能调用：<br />
        <ul>
          <li><a href="/api/getuser">获取哔哩哔哩用户信息</a><br /></li>
          <li><a href="/api/getvideo">获取哔哩哔哩视频 / 剧集 / 番剧信息及数据</a><br /></li>
        </ul>
        <a target="_blank" rel="noopener external nofollow noreferrer" href="https://github.com/${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}/blob/${process.env.VERCEL_GIT_COMMIT_REF}/README.md">查看使用说明</a>` }));
    } else {
      res.status(404).json({ code: -404 });
    }
  } catch (e) {
    res.status(500).send(utils.render500(startTime, e));
  }
};
