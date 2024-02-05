/* 获取哔哩哔哩视频 / 剧集 / 番剧信息及数据
 *   https://api.yumeharu.top/api/getvideo
 * 使用说明见 https://github.com/wuziqian211/website-api/blob/main/README.md#%E8%8E%B7%E5%8F%96%E5%93%94%E5%93%A9%E5%93%94%E5%93%A9%E8%A7%86%E9%A2%91--%E5%89%A7%E9%9B%86--%E7%95%AA%E5%89%A7--%E5%BD%B1%E8%A7%86%E4%BF%A1%E6%81%AF%E5%8F%8A%E6%95%B0%E6%8D%AE。
 * 作者：wuziqian211（https://www.yumeharu.top/）
 */

import fs from 'node:fs/promises';
import utils from '../assets/utils.js';
import { zones, states } from '../assets/constants.js';

export default async (req, res) => {
  let { startTime, accept, canAcceptVideo } = utils.initialize(req, res), // 获取 API 开始执行时间与客户端接受响应的类型
    responseType = accept, responseAttributes = [];
  if (req.query.type?.toUpperCase() === 'JSON') {
    responseType = 0;
  } else if (['HTML', 'PAGE'].includes(req.query.type?.toUpperCase())) {
    responseType = 1;
  } else {
    const splitString = req.query.type?.toUpperCase().split('_');
    if (['IMAGE', 'COVER', 'PIC'].includes(splitString?.[0])) {
      responseType = 2;
      splitString.shift(); // 删除第一个元素
      responseAttributes = splitString;
    } else if (['VIDEO', 'DATA'].includes(splitString?.[0])) {
      splitString.shift(); // 删除第一个元素
      responseAttributes = splitString;
    }
  }
  
  try {
    const sendHTML = data => utils.sendHTML(res, startTime, { ...data, desc: '获取哔哩哔哩视频 / 剧集 / 番剧信息及数据', body: `
      ${data.content}
      <form>
        <div><label for="vid">请输入您想要获取信息的视频 / 剧集 / 番剧的编号（仅输入数字会被视为 AV 号）：</label></div>
        <div><input type="text" name="vid" id="vid" value="${data.vid}" placeholder="av…/BV…/md…/ss…/ep…" pattern="^(?:BV|bv|Bv|bV)1[1-9A-HJ-NP-Za-km-z]{9}$|^(?:AV|av|Av|aV|MD|md|Md|mD|SS|ss|Ss|sS|EP|ep|Ep|eP)?(?!0+$)[0-9]+$" maxlength="12" autocomplete="off" spellcheck="false" /> <input type="submit" value="获取" /></div>
      </form>` }); // 发送 HTML 响应到客户端
    const sendJSON = data => utils.sendJSON(res, startTime, data); // 发送 JSON 数据到客户端
    
    const headers = { Origin: 'https://www.bilibili.com', Referer: 'https://www.bilibili.com/', 'User-Agent': process.env.userAgent };
    let useCookie;
    if ((req.query.cookie?.toUpperCase() === 'TRUE' || req.query.type?.toUpperCase() === 'DATA' || req.query.force != undefined) && req.query.cookie?.toUpperCase() !== 'FALSE') { // 用户要求强制使用 Cookie，或获取视频的数据（为了尽可能获取到更高清晰度的视频），或强制获取视频信息（通过历史记录获取，需要登录），并且没有要求不使用 Cookie
      useCookie = true;
    } else if (req.query.cookie?.toUpperCase() === 'FALSE') { // 用户要求不适用 Cookie
      if (req.query.force == undefined) {
        useCookie = false;
      } else { // 既要求强制获取视频信息（需要登录）又要求不使用 Cookie，这种情况无法获取到视频信息
        res.status(400);
        sendHTML({ title: '无法强制获取视频信息', content: `
          在不使用 Cookie 的情况下，无法强制获取视频信息 qwq<br />
          如果您要强制获取视频信息，则必须使用 Cookie（把“cookie=false”参数去掉）awa`, vid: req.query.vid });
      }
    }
    
    const { type, vid } = utils.getVidType(req.query.vid); // 判断用户给出的编号类型
    const handler = useCookie => {
      if (useCookie) headers.Cookie = `SESSDATA=${process.env.SESSDATA}; bili_jct=${process.env.bili_jct}`; // 如果指定了使用 Cookie，就添加账号登录信息
      if (type === 1) { // 编号为 AV 号或 BV 号
        let json;
        if (req.query.force != undefined) { // 强制获取视频信息
          const rjson1 = await (await fetch('https://api.bilibili.com/x/click-interface/web/heartbeat', { method: 'POST', headers, body: new URLSearchParams({ bvid: vid, played_time: 0, realtime: 0, start_ts: Math.floor(Date.now() / 1000), type: 3, sub_type: 0, dt: 2, play_type: 1, csrf: process.env.bili_jct }) })).json(); // 在 B 站历史记录首次加入这个视频（可不带 cid）
          await new Promise(resolve => setTimeout(resolve, 500)); // 等待 0.5 秒
          const hjson1 = await (await fetch('https://api.bilibili.com/x/v2/history?pn=1&ps=30', { headers })).json(); // 获取历史记录
          let info = hjson1.data?.find(h => h.type === 3 && h.bvid === vid); // 获取 BV 号相同的视频信息
          if (hjson1.code === 0 && info) {
            if (info.cid) {
              const rjson2 = await (await fetch('https://api.bilibili.com/x/v2/history/report', { method: 'POST', headers, body: new URLSearchParams({ aid: utils.toAV(vid), cid: info.cid, progress: 0, platform: 'web', csrf: process.env.bili_jct }) })).json(); // 在 B 站历史记录再次加入这个视频（带 cid，此时可以获取更多信息）
              await new Promise(resolve => setTimeout(resolve, 500)); // 等待 0.5 秒
              const hjson2 = await (await fetch('https://api.bilibili.com/x/v2/history?pn=1&ps=30', { headers })).json(); // 获取历史记录
              const info2 = hjson2.data?.find(h => h.type === 3 && h.bvid === vid); // 获取 BV 号相同的视频信息
              if (info2) info = info2;
            }
            json = { code: 0, message: '0', data: { bvid: vid, aid: utils.toAV(vid), videos: null, tid: null, tname: null, copyright: null, pic: '', title: null, pubdate: 0, ctime: 0, desc: '', desc_v2: [{ raw_text: '', type: 1, biz_id: 0 }], state: null, duration: null, rights: null, owner: { mid: null, name: null, face: '' }, stat: { aid: utils.toAV(vid), view: null, danmaku: null, reply: null, favorite: null, coin: null, share: null, now_rank: 0, his_rank: 0, like: null, dislike: 0, evaluation: '', vt: 0 }, argue_info: null, dynamic: null, cid: null, dimension: null, premiere: null, teenage_mode: 0, is_chargeable_season: null, is_story: null, is_upower_exclusive: null, is_upower_play: null, is_upower_preview: null, enable_vt: 0, vt_display: '', no_cache: false, pages: null, subtitle: null, is_season_display: null, user_garb: null, honor_reply: null, like_icon: '', need_jump_bv: false, disable_show_up_info: false, is_story_play: null, ...info, desc_v2: [{ raw_text: info.desc, type: 1, biz_id: 0 }], stat: { ...info.stat, evaluation: '', vv: undefined }, pages: [{ cid: info.page?.cid ?? info.cid, page: info.page?.page ?? 1, from: info.page?.from ?? 'vupload', part: info.page?.part ?? '', duration: info.page?.duration ?? null, vid: info.page?.vid ?? '', weblink: info.page?.weblink ?? '', dimension: info.page?.dimension ?? info.dimension, first_frame: info.page?.first_frame ?? info.first_frame }], favorite: undefined, type: undefined, sub_type: undefined, device: undefined, page: undefined, count: undefined, progress: undefined, view_at: undefined, kid: undefined, business: undefined, redirect_link: undefined } }; // 加入缺失的信息，移除“不该出现”的信息
          } else {
            json = { code: -404, message: '啥都木有' };
          }
        } else {
          json = await (await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${vid}`, { headers })).json(); // （备用）获取更详细的信息：https://api.bilibili.com/x/web-interface/wbi/view/detail?bvid=(...)
        }
        
        if (['VIDEO', 'DATA'].includes(req.query.type?.toUpperCase())) { // 获取视频数据
          let cid;
          if (json.code === 0 && json.data.pages) {
            if (/^\d+$/.test(req.query.cid) && +req.query.cid > 0 && json.data.pages.some(p => p.cid === +req.query.cid)) { // 用户提供的 cid 有效，且 API 回复的 pages 中包含用户提供的 cid
              cid = +req.query.cid; // 将变量“cid”设置为用户提供的 cid
            } else if (/^\d+$/.test(req.query.p) && +req.query.p > 0) { // 用户提供的参数“p”有效
              cid = json.data.pages[+req.query.p - 1]?.cid; // 将变量“cid”设置为该 P 的 cid
            } else {
              cid = json.data.cid; // 将变量“cid”设置为该视频第 1 P 的 cid
            }
          }
          
          if (cid) { // 视频有效
            const qualities = [6, 16, 32, 64, 74, 80]; // 240P、360P、480P、720P、720P60、1080P
            let url;
            for (const q of qualities) {
              const vjson = await (await fetch(`https://api.bilibili.com/x/player/playurl?bvid=${vid}&cid=${cid}&qn=${q}&fnval=1&fnver=0&platform=${q === 6 ? 'pc' : 'html5'}`, { headers })).json();
              if (vjson.code === 0 && vjson.data.durl[0].size <= 4500000) { // 视频地址获取成功，且视频大小不超过 4.5 MB（1 MB = 1000 KB；Vercel 限制 API 回复的内容不能超过 4.5 MB）
                url = vjson.data.durl[0].url;
              } else {
                break;
              }
            }
            
            if (url) { // 视频地址获取成功
              const filename = encodeURIComponent(`${json.data.title}.${new URL(url).pathname.split('.').at(-1)}`); // 设置视频的文件名
              const resp = await fetch(url, { headers });
              if (resp.ok) {
                res.status(200).setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate').setHeader('Content-Type', resp.headers.get('Content-Type')).setHeader('Content-Disposition', `inline; filename=${filename}`);
                utils.send(res, startTime, Buffer.from(await resp.arrayBuffer()));
              } else {
                if (canAcceptVideo) {
                  res.status(200).setHeader('Content-Type', 'video/mp4');
                  utils.send(res, startTime, await fs.readFile('./assets/error.mp4'));
                } else {
                  res.status(404);
                  sendHTML({ title: '获取视频数据失败', content: '获取视频数据失败，请稍后重试 awa', vid: req.query.vid });
                }
              }
            } else { // 视频地址获取失败
              if (canAcceptVideo) {
                res.status(200).setHeader('Content-Type', 'video/mp4');
                utils.send(res, startTime, await fs.readFile('./assets/error.mp4'));
              } else {
                res.status(500);
                sendHTML({ title: '无法获取视频数据', content: `
                  抱歉，由于您想要获取数据的视频无法下载（原因可能是视频太大，或者版权、地区限制，等等），本 API 无法向您发送这个视频的数据哟 qwq<br />
                  如果您想下载视频，最好使用其他工具哟 awa`, vid: req.query.vid });
              }
            }
          } else { // 视频无效
            if (canAcceptVideo) {
              res.status(200).setHeader('Content-Type', 'video/mp4');
              utils.send(res, startTime, await fs.readFile('./assets/error.mp4'));
            } else {
              res.status(404);
              sendHTML({ title: '无法获取视频数据', content: '获取视频数据失败，您想获取的视频可能不存在，或者您可能输入了错误的分 P 哟 qwq', vid: req.query.vid });
            }
          }
        } else { // 获取视频信息
          if (responseType === 1) { // 回复 HTML
            switch (json.code) {
              case 0:
                let zone = utils.encodeHTML(json.data.tname ?? '未知');
                const mainZone = zones.find(m => m.tid === json.data.tid);
                if (mainZone) {
                  zone = `<a ${mainZone.expired ? 'class="invalid" ' : ''}target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/${mainZone.url}">${mainZone.name}</a>${mainZone.expired ? '<span class="description">（已下线）</span>' : ''}`;
                } else {
                  for (const m of zones) {
                    if (m.sub) {
                      const subZone = m.sub.find(s => s.tid === json.data.tid);
                      if (subZone) {
                        zone = `<a ${m.expired ? 'class="invalid" ' : ''}target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/${m.url}">${m.name}</a>${m.expired ? '<span class="description">（已下线）</span>' : ''} &gt; <a ${subZone.expired ? 'class="invalid" ' : ''}target="_blank" rel="noopener external nofollow noreferrer" title="${subZone.desc ?? ''}" href="https://www.bilibili.com/${subZone.url}">${subZone.name}</a>${subZone.expired ? '<span class="description">（已下线）</span>' : ''}`;
                        break;
                      }
                    }
                  }
                }
                
                const content = `
                  <div class="info">
                    <div class="wrap">
                      <a target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/video/${vid}/"><img class="vpic" alt title="${utils.encodeHTML(json.data.title)}" src="${utils.toHTTPS(json.data.pic)}" referrerpolicy="no-referrer" /></a>
                    </div>
                    <div>
                      <a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/video/${vid}/">${utils.encodeHTML(json.data.title)}</a><br />
                      <span class="description">av${json.data.aid}，${utils.encodeHTML(json.data.bvid)}</span><br />
                      ${json.data.state !== 0 ? `<span class="notice"><img class="notice-icon" alt /> ${states[json.data.state] ?? '该视频存在未知问题'}</span><br />` : ''}
                      ${json.data.forward ? `<span class="notice"><img class="notice-icon" alt /> 本视频已与 <a href="?vid=${utils.toBV(json.data.forward)}">${utils.toBV(json.data.forward)}</a> 撞车</span><br />` : ''}
                      ${json.data.stat.argue_msg ? `<span class="notice"><img class="notice-icon" alt /> ${utils.encodeHTML(json.data.stat.argue_msg)}</span><br />` : ''}
                      ${json.data.videos}P ${utils.getTime(json.data.duration)} ${json.data.copyright === 1 ? '自制' : json.data.copyright === 2 ? '转载' : ''}${json.data.rights?.no_reprint ? '（未经作者授权，禁止转载）' : ''}${json.data.stat.evaluation ? ` ${utils.encodeHTML(json.data.stat.evaluation)}` : ''}${json.data.stat.now_rank ? ` 当前排名第 ${json.data.stat.now_rank} 名` : ''}${json.data.stat.his_rank ? ` 历史最高排名第 ${json.data.stat.his_rank} 名` : ''}
                    </div>
                  </div>
                  <strong>分区：</strong>${zone}<br />
                  <strong>${json.data.state === -40 ? '审核通过' : '投稿/审核通过'}时间：</strong>${utils.getDate(json.data.ctime)}<span class="description">（可能不准确）</span><br />
                  <strong>${json.data.state === -40 ? '投稿' : '发布'}时间：</strong>${utils.getDate(json.data.pubdate)}
                  <table>
                    <thead>
                      <tr><th>播放</th><th>弹幕</th><th>评论</th><th>点赞</th><th>投币</th><th>收藏</th><th>分享</th></tr>
                    </thead>
                    <tbody>
                      <tr><td>${utils.getNumber(json.data.stat.view)}</td><td>${utils.getNumber(json.data.stat.danmaku)}</td><td>${utils.getNumber(json.data.stat.reply)}</td><td>${utils.getNumber(json.data.stat.like)}</td><td>${utils.getNumber(json.data.stat.coin)}</td><td>${utils.getNumber(json.data.stat.favorite)}</td><td>${utils.getNumber(json.data.stat.share)}</td></tr>
                    </tbody>
                  </table>
                  ${json.data.rights?.is_cooperation && json.data.staff ? `
                  <strong>合作成员：</strong>
                  ${json.data.staff.map(u => `
                  <div class="user-background" id="user-${u.mid}" style="background: url(${utils.toHTTPS(u.face)}) center/cover no-repeat fixed;">
                    <div class="info user">
                      <div class="wrap">
                        <a target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${u.mid}">
                          <img class="face" alt title="${utils.encodeHTML(u.name)}" src="${utils.toHTTPS(u.face)}" referrerpolicy="no-referrer" />
                          ${u.official.type === 0 ? '<img class="face-icon icon-personal" alt title="UP 主认证" />' : u.official.type === 1 ? '<img class="face-icon icon-business" alt title="机构认证" />' : u.vip.status ? '<img class="face-icon icon-big-vip" alt title="大会员" />' : ''}
                        </a>
                      </div>
                      <div>
                        <a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${u.mid}">${utils.encodeHTML(u.name)}</a> ${utils.encodeHTML(u.title)}<br />
                        ${[0, 1].includes(u.official.type) ? `<img class="official-icon icon-${u.official.type === 0 ? 'personal" alt title="UP 主认证" /> <strong class="text-personal">bilibili UP 主' : 'business" alt title="机构认证" /> <strong class="text-business">bilibili 机构'}认证：</strong>${utils.encodeHTML(u.official.title)}<br />` : ''}
                        <strong>粉丝数：</strong>${utils.getNumber(u.follower)}
                      </div>
                    </div>
                  </div>`).join('')}` : `
                  <div class="info user">
                    <strong>UP 主：</strong>
                    <div class="wrap">
                      <a target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${json.data.owner.mid}">
                        <img class="face" alt title="${utils.encodeHTML(json.data.owner.name)}" src="${utils.toHTTPS(json.data.owner.face)}" referrerpolicy="no-referrer" />
                      </a>
                    </div>
                    <a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${json.data.owner.mid}">${utils.encodeHTML(json.data.owner.name)}</a>
                  </div>`}
                  ${json.data.pages ? json.data.pages.map(p => `
                  <div class="info">
                    <a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/video/${vid}/?p=${p.page}">P${p.page}：</a>
                    ${p.first_frame ? `
                    <div class="wrap">
                      <a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/video/${vid}/?p=${p.page}">
                        <img class="ppic" alt title="${utils.encodeHTML(p.part)}" src="${utils.toHTTPS(p.first_frame)}" referrerpolicy="no-referrer" />
                      </a>
                    </div>` : ''}
                    <div>
                      <a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/video/${vid}/?p=${p.page}">${utils.encodeHTML(p.part)}</a> ${utils.getTime(p.duration)} <span class="description">${p.dimension.rotate ? `${p.dimension.height}×${p.dimension.width}` : `${p.dimension.width}×${p.dimension.height}`}</span><br />
                      <strong>cid：</strong>${p.cid}
                    </div>
                  </div>`).join('') : ''}
                  <strong>简介：</strong><br />
                  ${json.data.desc_v2 ? json.data.desc_v2.map(d => d.type === 2 ? `<a target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${d.biz_id}">@${utils.encodeHTML(d.raw_text)} </a>` : utils.markText(d.raw_text)).join('') : utils.markText(json.data.desc)}`;
                res.status(200);
                sendHTML({ title: `${json.data.title} 的信息`, style: utils.renderExtraStyle(utils.toHTTPS(json.data.pic)), content, vid: req.query.vid });
                break;
              case -352:
              case -401:
              case -412:
              case -799:
                res.status(429).setHeader('Retry-After', '600');
                sendHTML({ title: '请求被拦截', content: '抱歉，本 API 的请求已被 B 站拦截，请等一段时间后重试 awa', vid: req.query.vid });
                break;
              case -404:
              case 62002:
                res.status(404);
                sendHTML({ title: '视频不存在', content: '您想要获取信息的视频不存在！QAQ', vid: req.query.vid });
                break;
              case -403:
                if ([true, false].includes(useCookie)) {
                  res.status(403);
                  sendHTML({ title: '获取视频信息需登录', content: `
                    这个视频需要登录才能获取信息！QwQ<br />
                    您可以在 B 站获取<a target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/video/${vid}/">这个视频的信息</a>哟 awa`, vid: req.query.vid });
                } else {
                  handler(true);
                }
                break;
              case 62003:
                res.status(404);
                sendHTML({ title: '视频待发布', content: '视频已审核通过，但还没有发布，请等一下再获取信息吧 awa', vid: req.query.vid });
                break;
              case 62004:
                res.status(404);
                sendHTML({ title: '视频审核中', content: '视频正在审核中，请等一下再获取信息吧 awa', vid: req.query.vid });
                break;
              default:
                res.status(400);
                sendHTML({ title: '获取视频信息失败', content: '获取视频信息失败，请稍后重试 awa', vid: req.query.vid });
            }
          } else if (responseType === 2) { // 回复封面数据
            if (json.code === 0) {
              if (responseAttributes.includes('REDIRECT') || req.query.allow_redirect != undefined) { // 允许本 API 重定向到 B 站服务器的封面地址
                utils.redirect(res, startTime, utils.toHTTPS(json.data.pic), 307);
              } else {
                const filename = encodeURIComponent(`${json.data.title} 的封面.${new URL(json.data.pic).pathname.split('.').at(-1)}`); // 设置封面的文件名
                const resp = await fetch(utils.toHTTPS(json.data.pic)); // 获取 B 站服务器存储的封面
                if (resp.status === 200) {
                  res.status(200).setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate').setHeader('Content-Type', resp.headers.get('Content-Type')).setHeader('Content-Disposition', `inline; filename=${filename}`);
                  utils.send(res, startTime, Buffer.from(await resp.arrayBuffer()));
                } else {
                  res.status(404);
                  if (responseAttributes.includes('ERRORWHENFAILED') && accept !== 2) {
                    if (accept === 1) {
                      sendHTML({ title: `获取 ${json.data.title} 的封面数据失败`, content: `获取 ${utils.encodeHTML(json.data.title)} 的封面数据失败，请稍后重试 awa`, vid: req.query.vid });
                    } else {
                      sendJSON({ code: -404, message: 'cannot fetch image', data: null });
                    }
                  } else {
                    res.setHeader('Content-Type', 'image/png');
                    utils.send(res, startTime, await fs.readFile('./assets/nocover.png'));
                  }
                }
              }
            } else if (json.code === -403 && ![true, false].includes(useCookie)) { // 这个视频需要登录才能获取其信息，如果没有设置不使用 Cookie，且不是已经使用了 Cookie 仍无法获取的，就带 Cookie 重新获取封面数据
              handler(true);
            } else {
              res.status(404);
              if (responseAttributes.includes('ERRORWHENFAILED') && accept !== 2) {
                if (accept === 1) {
                  sendHTML({ title: `获取 ${vid} 的封面数据失败`, content: `获取 ${vid} 的封面数据失败，这个视频可能不存在哟 qwq`, vid: req.query.vid });
                } else {
                  sendJSON({ code: -404, message: '啥都木有', data: null });
                }
              } else {
                res.setHeader('Content-Type', 'image/png');
                utils.send(res, startTime, await fs.readFile('./assets/nocover.png'));
              }
            }
          } else { // 回复 JSON
            switch (json.code) {
              case 0:
                res.status(200);
                sendJSON({ code: 0, message: json.message, data: json.data });
                break;
              case -352:
              case -401:
              case -412:
              case -799:
                res.status(429).setHeader('Retry-After', '600');
                sendJSON({ code: json.code, message: json.message, data: null });
                break;
              case -404:
              case 62002:
              case 62003:
              case 62004:
                res.status(404);
                sendJSON({ code: json.code, message: json.message, data: null });
                break;
              case -403:
                if ([true, false].includes(useCookie)) {
                  res.status(403);
                  sendJSON({ code: -403, message: json.message, data: null });
                } else {
                  handler(true);
                }
                break;
              default:
                res.status(400);
                sendJSON({ code: json.code, message: json.message, data: null });
            }
          }
        }
      } else if (type === 2) { // 编号为 mdid
        const json = await (await fetch(`https://api.bilibili.com/pgc/review/user?media_id=${vid}`, { headers })).json();
        if (responseType === 1) { // 回复 HTML
          switch (json.code) {
            case 0:
              const content = `
                <div class="info">
                  <div class="wrap">
                    <a target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/bangumi/media/md${vid}"><img class="spic" alt title="${utils.encodeHTML(json.result.media.title)}" src="${utils.toHTTPS(json.result.media.cover)}" referrerpolicy="no-referrer" /></a>
                  </div>
                  <div>
                    <a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/bangumi/media/md${vid}">${utils.encodeHTML(json.result.media.title)}</a><br />
                    ${utils.encodeHTML(json.result.media.type_name)} ${utils.encodeHTML(json.result.media.new_ep?.index_show)} ${json.result.media.areas.map(a => utils.encodeHTML(a.name)).join('、')} ${json.result.media.rating ? `${json.result.media.rating.score ? `${json.result.media.rating.score.toFixed(1)} 分` : ''}（共 ${json.result.media.rating.count} 人评分）` : '暂无评分'}
                  </div>
                </div>
                ${json.result.media.new_ep?.id ? `<strong>最新一话：</strong><a href="?vid=ep${json.result.media.new_ep.id}">${utils.encodeHTML(json.result.media.new_ep.index)}</a><br />` : ''}
                ${json.result.media.season_id ? `<a href="?vid=ss${json.result.media.season_id}">点击此处查看更多信息</a>` : ''}`;
              res.status(200);
              sendHTML({ title: `${json.result.media.title} 的信息`, style: utils.renderExtraStyle(utils.toHTTPS(json.result.media.cover)), content, vid: req.query.vid });
              break;
            case -352:
            case -401:
            case -412:
            case -799:
              res.status(429).setHeader('Retry-After', '600');
              sendHTML({ title: '请求被拦截', content: '抱歉，本 API 的请求已被 B 站拦截，请等一段时间后重试 awa', vid: req.query.vid });
              break;
            case -404:
              res.status(404);
              sendHTML({ title: '剧集不存在', content: '您想要获取信息的剧集不存在！QAQ', vid: req.query.vid });
              break;
            default:
              res.status(400);
              sendHTML({ title: '获取剧集信息失败', content: '获取剧集信息失败，请稍后重试 awa', vid: req.query.vid });
          }
        } else if (responseType === 2) { // 回复封面数据
          if (json.code === 0) {
            if (responseAttributes.includes('REDIRECT') || req.query.allow_redirect != undefined) { // 允许本 API 重定向到 B 站服务器的封面地址
              utils.redirect(res, startTime, utils.toHTTPS(json.result.media.cover), 307);
            } else {
              const filename = encodeURIComponent(`${json.result.media.title} 的封面.${new URL(json.result.media.cover).pathname.split('.').at(-1)}`); // 设置封面的文件名
              const resp = await fetch(utils.toHTTPS(json.result.media.cover)); // 获取 B 站服务器存储的封面
              if (resp.status === 200) {
                res.status(200).setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate').setHeader('Content-Type', resp.headers.get('Content-Type')).setHeader('Content-Disposition', `inline; filename=${filename}`);
                utils.send(res, startTime, Buffer.from(await resp.arrayBuffer()));
              } else {
                res.status(404);
                if (responseAttributes.includes('ERRORWHENFAILED') && accept !== 2) {
                  if (accept === 1) {
                    sendHTML({ title: `获取 ${json.result.media.title} 的封面数据失败`, content: `获取 ${utils.encodeHTML(json.result.media.title)} 的封面数据失败，请稍后重试 awa`, vid: req.query.vid });
                  } else {
                    sendJSON({ code: -404, message: 'cannot fetch image', data: null });
                  }
                } else {
                  res.setHeader('Content-Type', 'image/png');
                  utils.send(res, startTime, await fs.readFile('./assets/nocover.png'));
                }
              }
            }
          } else { // 剧集信息获取失败，回复默认封面
            res.status(404);
            if (responseAttributes.includes('ERRORWHENFAILED') && accept !== 2) {
              if (accept === 1) {
                sendHTML({ title: `获取 md${vid} 的封面数据失败`, content: `获取 md${vid} 的封面数据失败，这个剧集可能不存在哟 qwq`, vid: req.query.vid });
              } else {
                sendJSON({ code: -404, message: '啥都木有', data: null });
              }
            } else {
              res.setHeader('Content-Type', 'image/png');
              utils.send(res, startTime, await fs.readFile('./assets/nocover.png'));
            }
          }
        } else { // 回复 JSON
          switch (json.code) {
            case 0:
              res.status(200);
              sendJSON({ code: 0, message: json.message, data: json.result, result: json.result });
              break;
            case -352:
            case -401:
            case -412:
            case -799:
              res.status(429).setHeader('Retry-After', '600');
              sendJSON({ code: json.code, message: json.message, data: null, result: null });
              break;
            case -404:
              res.status(404);
              sendJSON({ code: -404, message: json.message, data: null, result: null });
              break;
            default:
              res.status(400);
              sendJSON({ code: json.code, message: json.message, data: null, result: null });
          }
        }
      } else if ([3, 4].includes(type)) { // 编号为 ssid 或 epid
        const json = await (await fetch(`https://api.bilibili.com/pgc/view/web/season?${type === 3 ? 'season' : 'ep'}_id=${vid}`, { headers })).json();
        if (['VIDEO', 'DATA'].includes(req.query.type?.toUpperCase())) { // 获取剧集中某一集的视频数据
          let P;
          if (json.code === 0) {
            if (type === 3) { // 编号为 ssid
              if (/^\d+$/.test(req.query.cid) && +req.query.cid > 0) { // 用户提供的 cid 有效
                P = json.result.episodes.find(p => p.cid === +req.query.cid); // 在正片中寻找 cid 与用户提供的 cid 相同的一集
                if (!P) { // 在正片中没有找到
                  for (const s of json.result.section) { // 在其他部分寻找
                    P = s.episodes.find(p => p.cid === +req.query.cid);
                    if (P) break;
                  }
                }
              } else if (/^\d+$/.test(req.query.p) && +req.query.p > 0) { // 用户提供的参数“p”有效
                P = json.result.episodes[+req.query.p - 1];
              } else {
                P = json.result.episodes[0]; // 第 1 集
              }
            } else { // 编号为 epid
              P = json.result.episodes.find(p => p.id === vid); // 在正片中寻找 epid 与用户提供的 epid 相同的一集
              if (!P) { // 在正片中没有找到
                for (const s of json.result.section) { // 在其他部分寻找
                  P = s.episodes.find(p => p.id === vid);
                  if (P) break;
                }
              }
            }
          }
          
          if (P) { // 剧集有效
            const qualities = [6, 16, 32, 64, 74, 80]; // 240P、360P、480P、720P、720P60、1080P
            let url;
            for (const q of qualities) {
              const vjson = await (await fetch(`https://api.bilibili.com/pgc/player/web/playurl?bvid=${P.bvid}&ep_id=${P.id}&cid=${P.cid}&qn=${q}&fnval=${q === 6 ? 1 : 0}&fnver=0`, { headers })).json();
              if (vjson.code === 0 && vjson.result.durl[0].size <= 4500000) { // 视频地址获取成功，且视频大小不超过 4.5 MB（1 MB = 1000 KB；Vercel 限制 API 回复的内容不能超过 4.5 MB）
                url = vjson.result.durl[0].url;
              } else {
                break;
              }
            }
            
            if (url) { // 视频地址获取成功
              const filename = encodeURIComponent(`${json.result.title}.${new URL(url).pathname.split('.').at(-1)}`); // 设置视频的文件名
              const resp = await fetch(url, { headers });
              if (resp.ok) {
                res.status(200).setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate').setHeader('Content-Type', resp.headers.get('Content-Type')).setHeader('Content-Disposition', `inline; filename=${filename}`);
                utils.send(res, startTime, Buffer.from(await resp.arrayBuffer()));
              } else {
                if (canAcceptVideo) {
                  res.status(200).setHeader('Content-Type', 'video/mp4');
                  utils.send(res, startTime, await fs.readFile('./assets/error.mp4'));
                } else {
                  res.status(404);
                  sendHTML({ title: '获取视频数据失败', content: '获取这一集的视频数据失败，请稍后重试 awa', vid: req.query.vid });
                }
              }
            } else { // 视频地址获取失败
              if (canAcceptVideo) {
                res.status(200).setHeader('Content-Type', 'video/mp4');
                utils.send(res, startTime, await fs.readFile('./assets/error.mp4'));
              } else {
                res.status(500);
                sendHTML({ title: '无法获取视频数据', content: `
                  抱歉，由于您想要获取的这一集的视频无法下载（原因可能是视频太大，或者版权、地区限制，等等），本 API 无法向您发送这一集的视频的数据哟 qwq<br />
                  如果您想下载这一集，最好使用其他工具哟 awa`, vid: req.query.vid });
              }
            }
          } else { // 剧集无效
            if (canAcceptVideo) {
              res.status(200).setHeader('Content-Type', 'video/mp4');
              utils.send(res, startTime, await fs.readFile('./assets/error.mp4'));
            } else {
              res.status(404);
              sendHTML({ title: '无法获取视频数据', content: '获取这一集的视频数据失败，您想获取的剧集可能不存在，或者您可能输入了错误的集号哟 qwq', vid: req.query.vid });
            }
          }
        } else { // 获取剧集信息
          if (responseType === 1) { // 回复 HTML
            switch (json.code) {
              case 0:
                const types = { 1: '番剧', 2: '电影', 3: '纪录片', 4: '国创', 5: '电视剧', 7: '综艺' }
                const content = `
                  <div class="info">
                    <div class="wrap">
                      <a target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/bangumi/play/ss${json.result.season_id}"><img class="spic" alt title="${utils.encodeHTML(json.result.title)}" src="${utils.toHTTPS(json.result.cover)}" referrerpolicy="no-referrer" /></a>
                    </div>
                    <div>
                      <a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/bangumi/play/ss${json.result.season_id}">${utils.encodeHTML(json.result.title)}</a><br />
                      ${types[json.result.type] ?? ''}${json.result.total === -1 ? '' : ` 已完结，共 ${json.result.total} 集`} ${json.result.areas.map(a => utils.encodeHTML(a.name)).join('、')} ${json.result.rating?.score ? `${json.result.rating.score.toFixed(1)} 分（共 ${json.result.rating.count} 人评分）` : '暂无评分'}
                    </div>
                  </div>
                  <strong>发布时间：</strong>${utils.encodeHTML(json.result.publish.pub_time)}
                  <table>
                    <thead>
                      <tr><th>播放</th><th>弹幕</th><th>评论</th><th>点赞</th><th>投币</th><th>收藏</th><th>分享</th></tr>
                    </thead>
                    <tbody>
                      <tr><td>${utils.getNumber(json.result.stat.views)}</td><td>${utils.getNumber(json.result.stat.danmakus)}</td><td>${utils.getNumber(json.result.stat.reply)}</td><td>${utils.getNumber(json.result.stat.likes)}</td><td>${utils.getNumber(json.result.stat.coins)}</td><td>${utils.getNumber(json.result.stat.favorites)}</td><td>${utils.getNumber(json.result.stat.share)}</td></tr>
                    </tbody>
                  </table>
                  ${json.result.up_info ? `
                  <div class="info">
                    <strong>UP 主：</strong>
                    <div class="wrap">
                      <a target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${json.result.up_info.mid}">
                        <img class="face" alt title="${utils.encodeHTML(json.result.up_info.uname)}" src="${utils.toHTTPS(json.result.up_info.avatar)}" referrerpolicy="no-referrer" />
                      </a>
                    </div>
                    <div>
                      <a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${json.result.up_info.mid}">${utils.encodeHTML(json.result.up_info.uname)}</a><br />
                      <strong>粉丝数：</strong>${utils.getNumber(json.result.up_info.follower)}
                    </div>
                  </div>` : ''}
                  <strong>正片：</strong>
                  ${json.result.episodes.map(p => `
                  <div class="info">
                    <div>
                      <a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/bangumi/play/ep${p.id}">${utils.encodeHTML(p.title)} ${utils.encodeHTML(p.long_title)}</a> ${utils.getTime(p.duration / 1000)}<br />
                      <strong>发布时间：</strong>${utils.getDate(p.pub_time)}<br />
                      <strong>cid：</strong>${p.cid}；<a href="?vid=${p.bvid}">${p.bvid}</a>
                    </div>
                  </div>`).join('')}
                  ${json.result.section ? json.result.section.map(s => `
                  <strong>${utils.encodeHTML(s.title)}：</strong>
                  ${s.episodes.map(p => `
                  <div class="info">
                    <div>
                      <a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="${p.status === 0 ? `?vid=${p.link.slice(p.link.lastIndexOf('/') + 1)}` : `https://www.bilibili.com/bangumi/play/ep${p.id}`}">${utils.encodeHTML(p.title)} ${utils.encodeHTML(p.long_title)}</a>${p.status === 0 ? '' : ` ${utils.getTime(p.duration / 1000)}`}<br />
                      ${p.status === 0 ? '' : `
                      <strong>发布时间：</strong>${utils.getDate(p.pub_time)}<br />
                      <strong>cid：</strong>${p.cid}；<a href="?vid=${p.bvid}">${p.bvid}</a>`}
                    </div>
                  </div>`).join('')}`).join('') : ''}
                  <strong>简介：</strong><br />
                  ${utils.markText(json.result.evaluate)}`;
                res.status(200);
                sendHTML({ title: `${json.result.title} 的信息`, style: utils.renderExtraStyle(utils.toHTTPS(json.result.cover)), content, vid: req.query.vid });
                break;
              case -352:
              case -401:
              case -412:
              case -799:
                res.status(429).setHeader('Retry-After', '600');
                sendHTML({ title: '请求被拦截', content: '抱歉，本 API 的请求已被 B 站拦截，请等一段时间后重试 awa', vid: req.query.vid });
                break;
              case -404:
                res.status(404);
                sendHTML({ title: '番剧不存在', content: '您想要获取信息的番剧不存在！QAQ', vid: req.query.vid });
                break;
              default:
                res.status(400);
                sendHTML({ title: '获取番剧信息失败', content: '获取番剧信息失败，请稍后重试 awa', vid: req.query.vid });
            }
          } else if (responseType === 2) { // 回复封面数据
            if (json.code === 0) {
              if (responseAttributes.includes('REDIRECT') || req.query.allow_redirect != undefined) { // 允许本 API 重定向到 B 站服务器的封面地址
                utils.redirect(res, startTime, utils.toHTTPS(json.result.cover), 307);
              } else {
                const filename = encodeURIComponent(`${json.result.title} 的封面.${new URL(json.result.cover).pathname.split('.').at(-1)}`); // 设置封面的文件名
                const resp = await fetch(utils.toHTTPS(json.result.cover)); // 获取 B 站服务器存储的封面
                if (resp.status === 200) {
                  res.status(200).setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate').setHeader('Content-Type', resp.headers.get('Content-Type')).setHeader('Content-Disposition', `inline; filename=${filename}`);
                  utils.send(res, startTime, Buffer.from(await resp.arrayBuffer()));
                } else {
                  res.status(404);
                  if (responseAttributes.includes('ERRORWHENFAILED') && accept !== 2) {
                    if (accept === 1) {
                      sendHTML({ title: `获取 ${json.result.title} 的封面数据失败`, content: `获取 ${utils.encodeHTML(json.result.title)} 的封面数据失败，请稍后重试 awa`, vid: req.query.vid });
                    } else {
                      sendJSON({ code: -404, message: 'cannot fetch image', data: null });
                    }
                  } else {
                    res.setHeader('Content-Type', 'image/png');
                    utils.send(res, startTime, await fs.readFile('./assets/nocover.png'));
                  }
                }
              }
            } else { // 番剧信息获取失败，回复默认封面
              res.status(404);
              if (responseAttributes.includes('ERRORWHENFAILED') && accept !== 2) {
                if (accept === 1) {
                  sendHTML({ title: `获取 ${type === 3 ? 'ss' : 'ep'}${vid} 的封面数据失败`, content: `获取 ${type === 3 ? 'ss' : 'ep'}${vid} 的封面数据失败，这个视频可能不存在哟 qwq`, vid: req.query.vid });
                } else {
                  sendJSON({ code: -404, message: '啥都木有', data: null });
                }
              } else {
                res.setHeader('Content-Type', 'image/png');
                utils.send(res, startTime, await fs.readFile('./assets/nocover.png'));
              }
            }
          } else { // 回复 JSON
            switch (json.code) {
              case 0:
                res.status(200);
                sendJSON({ code: 0, message: json.message, data: json.result, result: json.result });
                break;
              case -352:
              case -401:
              case -412:
              case -799:
                res.status(429).setHeader('Retry-After', '600');
                sendJSON({ code: json.code, message: json.message, data: null, result: null });
                break;
              case -404:
                res.status(404);
                sendJSON({ code: -404, message: json.message, data: null, result: null });
                break;
              default:
                res.status(400);
                sendJSON({ code: json.code, message: json.message, data: null, result: null });
            }
          }
        }
      } else { // 编号无效
        if (responseType === 1) { // 回复 HTML
          if (!req.query.vid) { // 没有设置参数“vid”
            res.status(200);
            sendHTML({ title: '获取哔哩哔哩视频 / 剧集 / 番剧信息及数据', content: `
              本 API 可以获取指定 B 站视频、剧集、番剧的信息及数据。<br />
              基本用法：https://${req.headers.host}/api/getvideo?vid=<span class="notice">您想获取信息的视频、剧集、番剧的编号</span><br />
              更多用法见<a target="_blank" rel="noopener external nofollow noreferrer" href="https://github.com/${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}/blob/${process.env.VERCEL_GIT_COMMIT_REF}/README.md#%E8%8E%B7%E5%8F%96%E5%93%94%E5%93%A9%E5%93%94%E5%93%A9%E8%A7%86%E9%A2%91--%E5%89%A7%E9%9B%86--%E7%95%AA%E5%89%A7--%E5%BD%B1%E8%A7%86%E4%BF%A1%E6%81%AF%E5%8F%8A%E6%95%B0%E6%8D%AE">本站的使用说明</a>。`, vid: '' });
          } else { // 设置了“vid”参数但无效
            res.status(400);
            sendHTML({ title: '编号无效', content: `
              您输入的编号无效！<br />
              请输入一个正确的编号吧 awa`, vid: '' });
          }
        } else if (responseType === 2) { // 回复封面数据
          res.status(400);
          if (responseAttributes.includes('ERRORWHENFAILED') && accept !== 2) {
            if (accept === 1) {
              sendHTML({ title: '编号无效', content: `
                您输入的编号无效！<br />
                请输入一个正确的编号吧 awa`, vid: '' });
            } else {
              sendJSON({ code: -400, message: '请求错误', data: null });
            }
          } else {
            res.setHeader('Content-Type', 'image/png');
            utils.send(res, startTime, await fs.readFile('./assets/nocover.png'));
          }
        } else { // 回复 JSON
          res.status(400);
          sendJSON({ code: -400, message: '请求错误', data: null });
        }
      }
    };
    handler(useCookie);
  } catch (e) {
    utils.send500(accept, res, startTime, e);
  }
};
