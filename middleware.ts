export const config = {
  matcher: [
    '/((?:video/)?BV1[1-9A-HJ-NP-Za-km-z]{9}(?:[?/#].*)?)',
    '/((?:video/av|bangumi/media/md|bangumi/play/ss|bangumi/play/ep|space/|user/|av|md|ss|ep|uid|mid)?\\d+(?:[?/#].*)?)',
  ],
};

import { next } from '@vercel/functions';
import * as utils from './assets/utils.js';

export default (req: Request): Response => {
  const session = utils.initialize(req, { acceptedResponseTypes: [1] }), { pathname } = new URL(req.url);

  const userRegExpResult = /^\/(?:space\/|user\/|uid|mid)(?<id>\d+)(?:[?/#].*)?$/.exec(pathname);
  if (userRegExpResult?.groups) return utils.redirect(session, 308, `/api/getuser?mid=${userRegExpResult.groups.id}`);

  for (const r of [
    /^\/video\/(?<id>av\d+)(?:[?/#].*)?$/,
    /^\/video\/(?<id>BV1[1-9A-HJ-NP-Za-km-z]{9})(?:[?/#].*)?$/,
    /^\/bangumi\/media\/(?<id>md\d+)(?:[?/#].*)?$/,
    /^\/bangumi\/play\/(?<id>(?:ss|ep)\d+)(?:[?/#].*)?$/,
    /^\/(?<id>(?:av|md|ss|ep)\d+)(?:[?/#].*)?$/,
    /^\/(?<id>BV1[1-9A-HJ-NP-Za-km-z]{9})(?:[?/#].*)?$/,
  ]) {
    const videoRegExpResult = r.exec(pathname);
    if (videoRegExpResult?.groups) return utils.redirect(session, 308, `/api/getvideo?vid=${videoRegExpResult.groups.id}`);
  }

  const pureNumberRegExpResult = /^\/(?<id>\d+)(?:[?/#].*)?$/.exec(pathname);
  if (pureNumberRegExpResult?.groups) {
    const { id } = pureNumberRegExpResult.groups;
    return utils.sendHTML(session, 300, { title: '请选择要获取信息的项目', newStyle: true, body: `
      <p>您提供的路径为纯数字，请选择您要获取信息的项目：</p>
      <div class="grid">
        <div class="grid-item"><p class="grid-title">获取用户信息</p><p>获取用户 UID${id} 的信息</p><a class="grid-link" href="/api/getuser?mid=${id}"></a></div>
        <div class="grid-item"><p class="grid-title">获取视频信息</p><p>获取视频 av${id} 的信息</p><a class="grid-link" href="/api/getvideo?vid=av${id}"></a></div>
        <div class="grid-item"><p class="grid-title">获取剧集信息</p><p>获取剧集 md${id} 的信息</p><a class="grid-link" href="/api/getvideo?vid=md${id}"></a></div>
        <div class="grid-item"><p class="grid-title">获取番剧信息（ssid）</p><p>获取番剧 ss${id} 的信息</p><a class="grid-link" href="/api/getvideo?vid=ss${id}"></a></div>
        <div class="grid-item"><p class="grid-title">获取番剧信息（epid）</p><p>获取番剧 ep${id} 的信息</p><a class="grid-link" href="/api/getvideo?vid=ep${id}"></a></div>
      </div>` });
  }

  return next();
};
