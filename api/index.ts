export const config = { runtime: 'edge' };

import utils from '../assets/utils.js';

export default (req: Request): Response => {
  const { respHeaders, responseType } = utils.initialize(req, [0, 1]);
  try {
    if (req.method === 'OPTIONS') {
      return utils.send(204, respHeaders, null);
    }
    if (responseType === 1) {
      respHeaders.set('Cache-Control', 's-maxage=3600, stale-while-revalidate');
      return utils.sendHTML(200, respHeaders, { title: '欢迎来到 API 页面', newStyle: true, body: `
        <h2>欢迎您来到 <a target="_blank" href="https://www.yumeharu.top/">wuziqian211's Blog</a> 的 API 页面！</h2>
        <p>本站提供以下公开的 API：</p>
        <div class="grid">
          <a class="grid-item" href="/api/getuser"><strong class="grid-title">获取哔哩哔哩用户信息</strong><p>本 API 可以获取指定 B 站用户的信息</p></a>
          <a class="grid-item" href="/api/getvideo"><strong class="grid-title">获取哔哩哔哩视频 / 剧集 / 番剧信息及数据</strong><p>本 API 可以获取指定 B 站视频、剧集、番剧的信息及数据</p></a>
        </div>
        <p><a target="_blank" rel="noopener external nofollow noreferrer" href="https://github.com/${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}/tree/${process.env.VERCEL_GIT_COMMIT_REF}/#readme">查看 API 的使用说明</a></p>` });
    } else {
      return utils.sendJSON(200, respHeaders, { code: 0, message: '0', data: null });
    }
  } catch (e) {
    return utils.send500(responseType, e);
  }
};
