import utils from '../assets/utils.js';

export default (req, res) => {
  const { startTime, accept } = utils.initialize(req, res);
  try {
    if (req.method === 'OPTIONS') {
      res.status(204);
      utils.send(res, startTime, '');
      return;
    }
    if (accept === 1) {
      res.status(200).setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
      utils.sendHTML(res, startTime, { title: '欢迎来到 API 页面', newStyle: true, body: `
        <h2>欢迎您来到 <a target="_blank" href="https://www.yumeharu.top/">wuziqian211's Blog</a> 的 API 页面！</h2>
        <p>本站提供以下公开的 API：</p>
        <div class="grid">
          <div class="grid-item"><strong class="grid-title">获取哔哩哔哩用户信息</strong><p>本 API 可以获取指定 B 站用户的信息</p><a class="grid-link" href="/api/getuser"></a></div>
          <div class="grid-item"><strong class="grid-title">获取哔哩哔哩视频 / 剧集 / 番剧信息及数据</strong><p>本 API 可以获取指定 B 站视频、剧集、番剧的信息及数据</p><a class="grid-link" href="/api/getvideo"></a></div>
        </div>
        <p><a target="_blank" rel="noopener external nofollow noreferrer" href="https://github.com/${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}/tree/${process.env.VERCEL_GIT_COMMIT_REF}/#readme">查看 API 的使用说明</a></p>` });
    } else {
      res.status(200);
      utils.sendJSON(res, startTime, { code: 0, message: '0', data: null });
    }
  } catch (e) {
    utils.send500(accept, res, startTime, e);
  }
};
