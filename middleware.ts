export const config = {
  matcher: ['/((?:video/)?BV1[1-9A-HJ-NP-Za-km-z]{9}(?:[?/#].*)?)', '/((?:video/av|bangumi/media/md|bangumi/play/ss|bangumi/play/ep|space/|user/|av|md|ss|ep|uid|mid)?\\d+(?:[?/#].*)?)'],
};

import { next } from '@vercel/edge';
import * as utils from './assets/utils.js';

export default (req: Request): Response => {
  utils.initialize(req, [1]);
  const { pathname } = new URL(req.url);

  const userRegExpResult = /^\/(?:space\/|user\/|uid|mid)(\d+)(?:[?/#].*)?$/.exec(pathname);
  if (userRegExpResult) return Response.redirect(new URL(`/api/getuser?mid=${userRegExpResult[1]}`, req.url), 308);

  for (const r of [/^\/video\/(av\d+)(?:[?/#].*)?$/, /^\/video\/(BV1[1-9A-HJ-NP-Za-km-z]{9})(?:[?/#].*)?$/, /^\/bangumi\/media\/(md\d+)(?:[?/#].*)?$/, /^\/bangumi\/play\/((?:ss|ep)\d+)(?:[?/#].*)?$/, /^\/((?:av|md|ss|ep)\d+)(?:[?/#].*)?$/, /^\/(BV1[1-9A-HJ-NP-Za-km-z]{9})(?:[?/#].*)?$/]) {
    const videoRegExpResult = r.exec(pathname);
    if (videoRegExpResult) return Response.redirect(new URL(`/api/getvideo?vid=${videoRegExpResult[1]}`, req.url), 308);
  }

  const pureNumberRegExpResult = /^\/(\d+)(?:[?/#].*)?$/.exec(pathname);
  if (pureNumberRegExpResult) {
    const id = pureNumberRegExpResult[1];
    return utils.sendHTML(300, new Headers(), { title: '请选择要获取信息的项目', newStyle: true, body: `
      <p>您提供的路径为纯数字，请选择您要获取信息的项目：</p>
      <div class="grid">
        <div class="grid-item"><strong class="grid-title">获取用户信息</strong><p>获取用户 UID${id} 的信息</p><a class="grid-link" href="/api/getuser?mid=${id}"></a></div>
        <div class="grid-item"><strong class="grid-title">获取视频信息</strong><p>获取视频 av${id} 的信息</p><a class="grid-link" href="/api/getvideo?vid=av${id}"></a></div>
        <div class="grid-item"><strong class="grid-title">获取剧集信息</strong><p>获取剧集 md${id} 的信息</p><a class="grid-link" href="/api/getvideo?vid=md${id}"></a></div>
        <div class="grid-item"><strong class="grid-title">获取番剧信息（ssid）</strong><p>获取番剧 ss${id} 的信息</p><a class="grid-link" href="/api/getvideo?vid=ss${id}"></a></div>
        <div class="grid-item"><strong class="grid-title">获取番剧信息（epid）</strong><p>获取番剧 ep${id} 的信息</p><a class="grid-link" href="/api/getvideo?vid=ep${id}"></a></div>
      </div>` });
  }

  return next();
};
