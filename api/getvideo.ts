/* 获取哔哩哔哩视频 / 剧集 / 番剧信息及数据
 *   https://api.yumeharu.top/api/getvideo
 * 使用说明见 https://github.com/wuziqian211/website-api/blob/main/README.md#%E8%8E%B7%E5%8F%96%E5%93%94%E5%93%A9%E5%93%94%E5%93%A9%E8%A7%86%E9%A2%91--%E5%89%A7%E9%9B%86--%E7%95%AA%E5%89%A7%E4%BF%A1%E6%81%AF%E5%8F%8A%E6%95%B0%E6%8D%AE。
 * 作者：wuziqian211（https://www.yumeharu.top/）
 */

import type { resolveFn, InternalAPIResponse, APIResponse, quality, HistoryData, VideoInfoData, VideoPlayUrlData, InternalAPIGetVideoInfoData, BangumiAPIResponse, BangumiMediaData, BangumiSeasonData, BangumiPlayUrlData } from '../assets/types.d.ts';
import type { SendHTMLData } from '../assets/utils.ts';
import type { BodyInit } from 'undici-types';

import fs from 'node:fs';
import utils from '../assets/utils.js';
import { zones, states } from '../assets/constants.js';

export const GET = (req: Request): Promise<Response> => new Promise(async (resolve: resolveFn<Response>): Promise<void> => {
  const initData = utils.initialize(req, [0, 1, 2, 3], resolve); // 获取请求参数与回复数据类型
  const { params, respHeaders, fetchDest } = initData, responseAttributes: string[] = [];
  let { responseType } = initData;
  const splitString = params.get('type')?.toUpperCase().split('_');
  if (splitString?.[0] && ['IMAGE', 'COVER', 'PIC'].includes(splitString[0])) {
    responseType = 2;
    splitString.shift(); // 删除第一个元素
    responseAttributes.push(...splitString);
  } else if (splitString?.[0] && ['VIDEO', 'DATA'].includes(splitString[0])) {
    responseType = 3;
    splitString.shift(); // 删除第一个元素
    responseAttributes.push(...splitString);
  }
  
  try {
    const sendHTML = (status: number, data: Omit<SendHTMLData, 'body'> & { content: string; vid?: string | null }): void => resolve(utils.sendHTML(status, respHeaders, { ...data, desc: '获取哔哩哔哩视频 / 剧集 / 番剧信息及数据', body: `
      ${data.content}
      <form>
        <div><label for="vid">请输入您想要获取信息的视频 / 剧集 / 番剧的编号（仅输入数字会被视为 AV 号）：</label></div>
        <div><input type="text" name="vid" id="vid" value="${data.vid ?? ''}" placeholder="av…/BV…/md…/ss…/ep…" pattern="^(?:BV|bv|Bv|bV)1[1-9A-HJ-NP-Za-km-z]{9}$|^(?:AV|av|Av|aV|MD|md|Md|mD|SS|ss|Ss|sS|EP|ep|Ep|eP)?(?!0+$)[0-9]+$" maxlength="20" autocomplete="off" spellcheck="false" /> <input type="submit" value="获取" /></div>
        <div><input type="checkbox" name="force" id="force" value="true"${requestForce ? ' checked' : ''} autocomplete="off" /><label for="force">强制获取信息（仅适用于获取编号为 AV 号或 BV 号的视频的信息）</label></div>
      </form>` })), // 发送 HTML 响应到客户端
          sendJSON = (status: number, data: InternalAPIResponse<unknown>): void => resolve(utils.sendJSON(status, respHeaders, data)), // 发送 JSON 数据到客户端
          send = (status: number, data: BodyInit): void => resolve(utils.send(status, respHeaders, data)); // 发送其他数据到客户端
    
    const requestVid = params.get('vid'), requestCookie = params.get('cookie')?.toUpperCase() === 'TRUE' ? true : params.get('cookie')?.toUpperCase() === 'FALSE' ? false : undefined, requestForce = params.has('force');
    let useCookie;
    if ((requestCookie === true || responseType === 3 || requestForce) && requestCookie !== false) { // 客户端指定强制使用 Cookie，或获取视频的数据（为了尽可能获取到更高清晰度的视频），或强制获取视频信息（通过历史记录获取，需要登录），并且没有指定不使用 Cookie
      useCookie = true;
    } else if (requestCookie === false) { // 客户端指定不使用 Cookie
      if (!requestForce) {
        useCookie = false;
      } else { // 既指定强制获取视频信息（需要登录）又指定不使用 Cookie，这种情况无法获取到视频信息
        sendHTML(400, { title: '无法强制获取视频信息', content: `
          在不使用 Cookie 的情况下，无法强制获取视频信息 qwq<br />
          如果您要强制获取视频信息，则必须使用 Cookie（把 “cookie=false” 参数去掉）awa`, vid: requestVid });
        return;
      }
    }
    
    const { type, vid } = utils.getVidType(requestVid); // 判断客户端给出的编号类型
    const headers = new Headers({ Origin: 'https://www.bilibili.com', Referer: 'https://www.bilibili.com/', 'User-Agent': process.env.userAgent! });
    if (useCookie) headers.set('Cookie', `SESSDATA=${process.env.SESSDATA}; bili_jct=${process.env.bili_jct}`); // 如果指定了使用 Cookie，就添加账号登录信息
    
    if (type === 1) { // 编号为 AV 号或 BV 号
      let json: InternalAPIResponse<InternalAPIGetVideoInfoData | null>;
      if (requestForce) { // 强制获取视频信息
        await fetch('https://api.bilibili.com/x/click-interface/web/heartbeat', { method: 'POST', headers, body: new URLSearchParams({ bvid: vid, played_time: '0', realtime: '0', start_ts: Math.floor(Date.now() / 1000).toString(), type: '3', sub_type: '0', dt: '2', play_type: '1', csrf: process.env.bili_jct! }) }); // 在 B 站历史记录首次加入这个视频（可不带 cid）
        await new Promise(resolve => setTimeout(resolve, 500)); // 等待 0.5 秒
        const hjson1 = <APIResponse<HistoryData>>await (await fetch('https://api.bilibili.com/x/v2/history?pn=1&ps=30', { headers })).json(); // 获取历史记录
        let info = hjson1.data?.find(h => h.type === 3 && h.bvid === vid); // 获取 BV 号相同的视频信息
        if (hjson1.code === 0 && info) {
          if (info.cid) {
            await fetch('https://api.bilibili.com/x/v2/history/report', { method: 'POST', headers, body: new URLSearchParams({ aid: utils.toAV(vid).toString(), cid: info.cid.toString(), progress: '0', platform: 'web', csrf: process.env.bili_jct! }) }); // 在 B 站历史记录再次加入这个视频（带 cid，此时可以获取更多信息）
            await new Promise(resolve => setTimeout(resolve, 500)); // 等待 0.5 秒
            const hjson2 = <APIResponse<HistoryData>>await (await fetch('https://api.bilibili.com/x/v2/history?pn=1&ps=30', { headers })).json(); // 获取历史记录
            const info2 = hjson2.data?.find(h => h.type === 3 && h.bvid === vid); // 获取 BV 号相同的视频信息
            if (info2) info = info2;
          }
          json = { code: 0, message: '0', data: { bvid: vid, aid: utils.largeNumberHandler(utils.toAV(vid)), videos: null, tid: null, tname: '', copyright: null, pic: '', title: '', pubdate: 0, ctime: 0, desc: '', desc_v2: [{ raw_text: '', type: 1, biz_id: 0 }], state: null, duration: null, forward: undefined, mission_id: undefined, rights: null, owner: { mid: 0, name: '', face: '' }, stat: { aid: utils.largeNumberHandler(utils.toAV(vid)), view: null, danmaku: null, reply: null, favorite: null, coin: null, share: null, now_rank: 0, his_rank: 0, like: null, dislike: 0, evaluation: '', vt: 0 }, argue_info: { argue_msg: '', argue_type: 0, argue_link: '' }, dynamic: '', cid: 0, dimension: { width: 0, height: 0, rotate: 0 }, premiere: null, teenage_mode: 0, is_chargeable_season: false, is_story: false, is_upower_exclusive: false, is_upower_play: false, is_upower_preview: false, enable_vt: 0, vt_display: '', no_cache: false, pages: [], subtitle: null, staff: undefined, is_season_display: false, user_garb: { url_image_ani_cut: 'https://i0.hdslb.com/bfs/garb/item/e4c1c34e8b87fc05a893ed4a04ad322f75edbed9.bin' }, honor_reply: {}, like_icon: '', need_jump_bv: false, disable_show_up_info: false, is_story_play: 0 } };
          json.data = { ...json.data!, ...info, desc_v2: [{ raw_text: info.desc, type: 1, biz_id: 0 }], stat: { ...info.stat, evaluation: '', vt: 0, vv: undefined }, pages: [{ cid: info.page?.cid ?? info.cid ?? 0, page: info.page?.page ?? 1, from: info.page?.from ?? 'vupload', part: info.page?.part ?? '', duration: info.page?.duration ?? null, vid: info.page?.vid ?? '', weblink: info.page?.weblink ?? '', dimension: info.page?.dimension ?? info.dimension, first_frame: info.page?.first_frame ?? info.first_frame }], cover43: undefined, favorite: undefined, type: undefined, sub_type: undefined, device: undefined, page: undefined, count: undefined, progress: undefined, view_at: undefined, kid: undefined, business: undefined, redirect_link: undefined }; // 加入缺失的信息，移除“不该出现”的信息
        } else {
          json = { code: -404, message: '啥都木有', data: null, extInfo: { errType: 'notFoundInHistory' } };
        }
      } else {
        json = <APIResponse<VideoInfoData>>await (await fetch(`https://api.bilibili.com/x/web-interface/wbi/view?${await utils.encodeWbi({ bvid: vid })}`, { headers })).json(); // （备用）获取更详细的信息：https://api.bilibili.com/x/web-interface/wbi/view/detail?bvid=(...)
        if (json.code === -403 && useCookie == undefined) { // 这个视频需要登录才能获取其信息，如果没有设置不使用 Cookie，且不是已经使用了 Cookie 仍无法获取的，就带 Cookie 重新获取信息
          headers.set('Cookie', `SESSDATA=${process.env.SESSDATA}; bili_jct=${process.env.bili_jct}`);
          json = <APIResponse<VideoInfoData>>await (await fetch(`https://api.bilibili.com/x/web-interface/wbi/view?${await utils.encodeWbi({ bvid: vid })}`, { headers })).json();
        }
      }
      
      if (responseType === 3) { // 获取视频数据
        let cid;
        if (json.code === 0 && json.data!.pages) {
          const data = json.data!, requestCid = params.get('cid'), requestPage = params.get('p');
          if (requestCid && /^\d+$/.test(requestCid) && BigInt(requestCid) > 0 && data.pages.some(p => BigInt(p.cid) === BigInt(requestCid))) { // 客户端提供的 cid 有效，且 API 回复的 pages 中包含客户端提供的 cid
            cid = BigInt(requestCid); // 将变量“cid”设置为客户端提供的 cid
          } else if (requestPage && /^\d+$/.test(requestPage) && +requestPage > 0) { // 客户端提供的参数“p”有效
            cid = data.pages[+requestPage - 1]?.cid; // 将变量“cid”设置为该 P 的 cid
          } else {
            cid = data.cid; // 将变量“cid”设置为该视频第 1 P 的 cid
          }
          
          if (cid) { // 客户端提供的分 P 参数有效
            const qualities: quality[] = [6, 16, 32, 64, 74, 80]; // 240P、360P、480P、720P、720P60、1080P
            let url;
            for (const qn of qualities) {
              const vjson = <APIResponse<VideoPlayUrlData>>await (await fetch(`https://api.bilibili.com/x/player/wbi/playurl?${await utils.encodeWbi({ bvid: vid, cid: cid.toString(), qn: qn.toString(), fnval: '1', fnver: '0', fourk: '1', otype: 'json', type: '', platform: qn === 6 ? 'pc' : 'html5', high_quality: '1' })}`, { headers })).json();
              if (vjson.code === 0 && vjson.data.durl[0].size <= 4500000) { // 视频地址获取成功，且视频大小不超过 4.5 MB（1 MB = 1000 KB；Vercel 限制 API 回复的内容不能超过 4.5 MB）
                url = vjson.data.durl[0].url;
              } else {
                break;
              }
            }
            
            if (url) { // 视频地址获取成功
              const filename = encodeURIComponent(`${data.title}.${new URL(url).pathname.split('.').at(-1)}`); // 设置视频的文件名
              const resp = await fetch(url, { headers });
              if (resp.ok) {
                respHeaders.set('Cache-Control', 's-maxage=60, stale-while-revalidate');
                respHeaders.set('Content-Type', resp.headers.get('Content-Type')!);
                respHeaders.set('Content-Disposition', `inline; filename=${filename}`);
                send(200, resp.body);
              } else {
                if (responseAttributes.includes('ERRORWHENFAILED') && fetchDest !== 3) {
                  sendHTML(400, { title: '获取视频数据失败', content: '获取视频数据失败，请稍后重试 awa', vid: requestVid });
                } else {
                  respHeaders.set('Content-Type', 'video/mp4');
                  send(fetchDest === 3 ? 200 : 400, fs.createReadStream('./assets/error.mp4'));
                }
              }
            } else { // 视频地址获取失败
              if (responseAttributes.includes('ERRORWHENFAILED') && fetchDest !== 3) {
                sendHTML(500, { title: '无法获取视频数据', content: `
                  抱歉，由于您想要获取数据的视频无法下载（原因可能是视频太大，或者版权、地区限制，等等），本 API 无法向您发送这个视频的数据哟 qwq<br />
                  如果您想下载视频，最好使用其他工具哟 awa`, vid: requestVid });
              } else {
                respHeaders.set('Content-Type', 'video/mp4');
                send(fetchDest === 3 ? 200 : 500, fs.createReadStream('./assets/error.mp4'));
              }
            }
          } else { // 客户端提供的分 P 参数无效
            if (responseAttributes.includes('ERRORWHENFAILED') && fetchDest !== 3) {
              sendHTML(404, { title: '无法获取视频数据', content: '获取视频数据失败，您可能输入了错误的分 P 哟 qwq', vid: requestVid });
            } else {
              respHeaders.set('Content-Type', 'video/mp4');
              send(fetchDest === 3 ? 200 : 404, fs.createReadStream('./assets/error.mp4'));
            }
          }
        } else { // 视频无效
          if (responseAttributes.includes('ERRORWHENFAILED') && fetchDest !== 3) {
            sendHTML(404, { title: '无法获取视频数据', content: '获取视频数据失败，您想获取的视频可能不存在哟 qwq', vid: requestVid });
          } else {
            respHeaders.set('Content-Type', 'video/mp4');
            send(fetchDest === 3 ? 200 : 404, fs.createReadStream('./assets/error.mp4'));
          }
        }
      } else { // 获取视频信息
        if (responseType === 1) { // 回复 HTML
          switch (json.code) {
            case 0:
              const data = json.data!
              let zone = data.tname ? utils.encodeHTML(data.tname) : '未知';
              const mainZone = zones.find(m => m.tid === data.tid);
              if (mainZone) {
                zone = `<a ${mainZone.expired ? 'class="broken" ' : ''}target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/${mainZone.url}">${mainZone.name}</a>${mainZone.expired ? '<span class="description">（已下线）</span>' : ''}`;
              } else {
                for (const m of zones) {
                  if (m.sub) {
                    const subZone = m.sub.find(s => s.tid === data.tid);
                    if (subZone) {
                      zone = `<a ${m.expired ? 'class="broken" ' : ''}target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/${m.url}">${m.name}</a>${m.expired ? '<span class="description">（已下线）</span>' : ''} &gt; <a ${subZone.expired ? 'class="broken" ' : ''}target="_blank" rel="noopener external nofollow noreferrer" title="${subZone.desc ?? ''}" href="https://www.bilibili.com/${subZone.url}">${subZone.name}</a>${subZone.expired ? '<span class="description">（已下线）</span>' : ''}`;
                      break;
                    }
                  }
                }
              }
              
              const content = `
                <div class="main-info-outer">
                  <div class="main-info-inner">
                    <div class="image-wrap">
                      <a target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/video/${vid}/"><img class="vpic" title="${utils.encodeHTML(data.title)}" src="${utils.toHTTPS(data.pic)}" /></a>
                    </div>
                    <div class="detail">
                      <a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/video/${vid}/">${utils.encodeHTML(data.title)}</a><br />
                      <span class="description">av${data.aid}，${utils.encodeHTML(data.bvid)}</span><br />
                      ${data.state !== 0 ? `<span class="notice"><img class="notice-icon" alt="⚠️" /> ${data.state && data.state in states ? states[data.state] : '该视频存在未知问题'}</span><br />` : ''}
                      ${data.forward ? `<span class="notice"><img class="notice-icon" alt="⚠️" /> 本视频已与 <a href="?vid=${utils.toBV(data.forward)}">${utils.toBV(data.forward)}</a> 撞车</span><br />` : ''}
                      ${data.argue_info?.argue_msg ? `<span class="notice"><img class="notice-icon" alt="⚠️" /> ${utils.encodeHTML(data.argue_info.argue_msg)}</span><br />` : ''}
                      ${data.videos}P ${utils.getTime(data.duration)} ${data.copyright === 1 ? '自制' : data.copyright === 2 ? '转载' : ''}${data.rights?.no_reprint ? '（未经作者授权，禁止转载）' : ''}${data.rights?.is_cooperation ? ' 合作' : ''}${data.rights && 'is_stein_gate' in data.rights && data.rights.is_stein_gate ? ' 互动' : ''}${data.rights && 'is_360' in data.rights && data.rights.is_360 ? ' 全景' : ''}${'honor' in data.honor_reply && data.honor_reply.honor?.filter(h => h.type !== 3).length ? ` ${data.honor_reply.honor.filter(h => h.type !== 3).map(h => utils.encodeHTML(h.desc)).join(' ')}` : ''}${data.stat.evaluation ? ` ${utils.encodeHTML(data.stat.evaluation)}` : ''}${data.stat.now_rank ? ` 当前排名第 ${data.stat.now_rank} 名` : ''}${data.stat.his_rank ? ` 历史最高排名第 ${data.stat.his_rank} 名` : ''}
                    </div>
                  </div>
                </div>
                <strong>分区：</strong>${zone}<br />
                <strong>${data.state === -40 ? '审核通过' : '投稿/审核通过'}时间：</strong>${utils.getDate(data.ctime)}<span class="description">（可能不准确）</span><br />
                <strong>${data.state === -40 ? '投稿' : '发布'}时间：</strong>${utils.getDate(data.pubdate)}
                <table>
                  <thead>
                    <tr><th>播放</th><th>弹幕</th><th>评论</th><th>点赞</th><th>投币</th><th>收藏</th><th>分享</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>${utils.getNumber(data.stat.view)}</td><td>${utils.getNumber(data.stat.danmaku)}</td><td>${utils.getNumber(data.stat.reply)}</td><td>${utils.getNumber(data.stat.like)}</td><td>${utils.getNumber(data.stat.coin)}</td><td>${utils.getNumber(data.stat.favorite)}</td><td>${utils.getNumber(data.stat.share)}</td></tr>
                  </tbody>
                </table>
                ${data.rights?.is_cooperation && data.staff ? `
                <strong>合作成员：</strong>
                <div class="grid user-list">
                  ${data.staff.map(u => `
                  <div class="grid-item main-info-outer" id="user-${u.mid}" style="background-image: url(${utils.toHTTPS(u.face)});">
                    <div class="main-info-inner image">
                      <div class="image-wrap">
                        <a target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${u.mid}">
                          <img class="face" title="${utils.encodeHTML(u.name)}" src="${utils.toHTTPS(u.face)}" />
                          ${u.official.type === 0 ? '<img class="face-icon icon-personal" alt title="UP 主认证" />' : u.official.type === 1 ? '<img class="face-icon icon-business" alt title="机构认证" />' : u.vip.status ? '<img class="face-icon icon-big-vip" alt title="大会员" />' : ''}
                        </a>
                      </div>
                      <div class="detail">
                        <a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${u.mid}">${utils.encodeHTML(u.name)}</a> ${utils.encodeHTML(u.title)}<br />
                        ${[0, 1].includes(u.official.type) ? `<img class="official-icon icon-${u.official.type === 0 ? 'personal" alt="⚡" title="UP 主认证" /> <strong class="text-personal">bilibili UP 主' : 'business" alt="⚡" title="机构认证" /> <strong class="text-business">bilibili 机构'}认证${u.official.title ? '：' : ''}</strong>${utils.encodeHTML(u.official.title)}${u.official.desc ? `<span class="description">（${utils.encodeHTML(u.official.desc)}）</span>` : ''}<br />` : ''}
                        <strong>粉丝数：</strong>${utils.getNumber(u.follower)}
                      </div>
                    </div>
                  </div>`).join('')}
                </div>` : data.owner.mid ? `
                <div class="main-info-outer" id="user-${data.owner.mid}" style="background-image: url(${utils.toHTTPS(data.owner.face)});">
                  <div class="main-info-inner image">
                    <div class="left"><strong>UP 主：</strong></div>
                    <div class="image-wrap">
                      <a target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${data.owner.mid}">
                        <img class="face" title="${utils.encodeHTML(data.owner.name)}" src="${utils.toHTTPS(data.owner.face)}" />
                      </a>
                    </div>
                    <div class="detail"><a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${data.owner.mid}">${utils.encodeHTML(data.owner.name)}</a></div>
                  </div>
                </div>` : ''}
                ${data.pages ? data.pages.map(p => `
                <div class="main-info-outer" id="part-${p.page}"${p.first_frame ? ` style="background-image: url(${utils.toHTTPS(p.first_frame)});"` : ''}>
                  <div class="main-info-inner${p.first_frame ? ' image' : ''}">
                    <div class="left"><a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/video/${vid}/?p=${p.page}">P${p.page}</a></div>
                    ${p.first_frame ? `
                    <div class="image-wrap">
                      <a target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/video/${vid}/?p=${p.page}">
                        <img class="ppic" title="${utils.encodeHTML(p.part)}" src="${utils.toHTTPS(p.first_frame)}" />
                      </a>
                    </div>` : ''}
                    <div class="detail">
                      <a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/video/${vid}/?p=${p.page}">${utils.encodeHTML(p.part)}</a> ${utils.getTime(p.duration)}${p.dimension?.height && p.dimension?.width ? ` <span class="description">${p.dimension.rotate ? `${p.dimension.height}×${p.dimension.width}` : `${p.dimension.width}×${p.dimension.height}`}</span>` : ''}<br />
                      <strong>cid：</strong>${p.cid || '未知'}
                    </div>
                  </div>
                </div>`).join('') : ''}
                ${data.dynamic ? `<strong>同步发布动态的文字内容：</strong>${utils.markText(data.dynamic)}<br />` : ''}
                <strong>简介：</strong><br />
                ${data.desc_v2 ? data.desc_v2.map(d => d.type === 2 ? `<a target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${d.biz_id}">@${utils.encodeHTML(d.raw_text)} </a>` : utils.markText(d.raw_text)).join('') : utils.markText(data.desc)}`;
              sendHTML(200, { title: `${data.title} 的信息`, imageBackground: utils.toHTTPS(data.pic), content, vid: requestVid });
              break;
            case -352:
            case -401:
            case -412:
            case -799:
              respHeaders.set('Retry-After', '600');
              sendHTML(429, { title: '请求被拦截', content: '抱歉，本 API 的请求已被 B 站拦截，请等一段时间后重试 awa', vid: requestVid });
              break;
            case -404:
            case 62002:
              sendHTML(404, { title: '视频不存在', content: '您想要获取信息的视频不存在！QAQ', vid: requestVid });
              break;
            case -403:
              sendHTML(403, { title: '获取视频信息需登录', content: `
                这个视频需要登录才能获取信息！QwQ<br />
                您可以在 B 站获取<a target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/video/${vid}/">这个视频的信息</a>哟 awa`, vid: requestVid });
              break;
            case 62003:
              sendHTML(404, { title: '视频待发布', content: '视频已审核通过，但还没有发布，请等一下再获取信息吧 awa', vid: requestVid });
              break;
            case 62004:
              sendHTML(404, { title: '视频审核中', content: '视频正在审核中，请等一下再获取信息吧 awa', vid: requestVid });
              break;
            default:
              sendHTML(400, { title: '获取视频信息失败', content: '获取视频信息失败，请稍后重试 awa', vid: requestVid });
          }
        } else if (responseType === 2) { // 回复封面数据
          if (json.code === 0) {
            const data = json.data!;
            if (responseAttributes.includes('REDIRECT')) { // 允许本 API 重定向到 B 站服务器的封面地址
              resolve(utils.redirect(307, utils.toHTTPS(data.pic)));
            } else {
              const filename = encodeURIComponent(`${data.title} 的封面.${new URL(data.pic).pathname.split('.').at(-1)}`); // 设置封面的文件名
              const resp = await fetch(utils.toHTTPS(data.pic)); // 获取 B 站服务器存储的封面
              if (resp.status === 200) {
                respHeaders.set('Cache-Control', 's-maxage=60, stale-while-revalidate');
                respHeaders.set('Content-Type', resp.headers.get('Content-Type')!);
                respHeaders.set('Content-Disposition', `inline; filename=${filename}`);
                send(200, resp.body);
              } else {
                if (responseAttributes.includes('ERRORWHENFAILED') && fetchDest !== 2) {
                  if (fetchDest === 1) {
                    sendHTML(404, { title: `获取 ${data.title} 的封面数据失败`, content: `获取 ${utils.encodeHTML(data.title)} 的封面数据失败，请稍后重试 awa`, vid: requestVid });
                  } else {
                    sendJSON(404, { code: -404, message: 'cannot fetch image', data: null, extInfo: { errType: 'upstreamServerRespError', upstreamServerUrl: utils.toHTTPS(data.pic), upstreamServerRespStatus: resp.status } });
                  }
                } else {
                  respHeaders.set('Content-Type', 'image/png');
                  send(404, fs.createReadStream('./assets/nocover.png'));
                }
              }
            }
          } else {
            if (responseAttributes.includes('ERRORWHENFAILED') && fetchDest !== 2) {
              if (fetchDest === 1) {
                sendHTML(404, { title: `获取 ${vid} 的封面数据失败`, content: `获取 ${vid} 的封面数据失败，这个视频可能不存在哟 qwq`, vid: requestVid });
              } else {
                sendJSON(404, { code: -404, message: '啥都木有', data: null, extInfo: { errType: 'upstreamServerNoData' } });
              }
            } else {
              respHeaders.set('Content-Type', 'image/png');
              send(404, fs.createReadStream('./assets/nocover.png'));
            }
          }
        } else { // 回复 JSON
          switch (json.code) {
            case 0:
              sendJSON(200, { code: 0, message: json.message, data: json.data! });
              break;
            case -352:
            case -401:
            case -412:
            case -799:
              respHeaders.set('Retry-After', '600');
              sendJSON(429, { code: json.code, message: json.message, data: null, extInfo: { errType: 'upstreamServerRequestBanned' } });
              break;
            case -404:
            case 62002:
            case 62003:
            case 62004:
              sendJSON(404, { code: json.code, message: json.message, data: null, extInfo: { errType: json.extInfo?.errType ?? 'upstreamServerNoData' } });
              break;
            case -403:
              sendJSON(403, { code: -403, message: json.message, data: null, extInfo: { errType: 'upstreamServerForbidden' } });
              break;
            default:
              sendJSON(400, { code: json.code, message: json.message, data: null, extInfo: { errType: 'upstreamServerNoData' } });
          }
        }
      }
    } else if (type === 2) { // 编号为 mdid
      const json = <BangumiAPIResponse<BangumiMediaData>>await (await fetch(`https://api.bilibili.com/pgc/review/user?media_id=${vid}`, { headers })).json();
      if (responseType === 3) { // 获取视频数据
        if (json.code === 0 && json.result!.media.season_id) {
          params.set('vid', `ss${json.result!.media.season_id}`);
          resolve(utils.redirect(308, `?${params}`));
        } else { // 视频无效
          if (responseAttributes.includes('ERRORWHENFAILED') && fetchDest !== 3) {
            sendHTML(404, { title: '无法获取视频数据', content: '获取视频数据失败，您想获取的剧集可能不存在哟 qwq', vid: requestVid });
          } else {
            respHeaders.set('Content-Type', 'video/mp4');
            send(fetchDest === 3 ? 200 : 404, fs.createReadStream('./assets/error.mp4'));
          }
        }
      } else if (responseType === 1) { // 回复 HTML
        switch (json.code) {
          case 0:
            const result = json.result!;
            const content = `
              <div class="main-info-outer">
                <div class="main-info-inner">
                  <div class="image-wrap">
                    <a target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/bangumi/media/md${vid}"><img class="spic" title="${utils.encodeHTML(result.media.title)}" src="${utils.toHTTPS(result.media.cover)}" /></a>
                  </div>
                  <div class="detail">
                    <a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/bangumi/media/md${vid}">${utils.encodeHTML(result.media.title)}</a><br />
                    <span class="description">${result.media.season_id ? `ss${result.media.season_id}，` : ''}md${result.media.media_id}</span><br />
                    ${utils.encodeHTML(result.media.type_name)} ${utils.encodeHTML(result.media.new_ep?.index_show)} ${result.media.areas.map(a => utils.encodeHTML(a.name)).join('、')} ${result.media.rating ? `${result.media.rating.score ? `${result.media.rating.score.toFixed(1)} 分` : ''}（共 ${result.media.rating.count} 人评分）` : '暂无评分'}
                  </div>
                </div>
              </div>
              ${result.media.new_ep?.id ? `<strong>最新一话：</strong><a href="?vid=ep${result.media.new_ep.id}">${utils.encodeHTML(result.media.new_ep.index)}</a><br />` : ''}
              ${result.media.season_id ? `<a href="?vid=ss${result.media.season_id}">点击此处查看更多信息</a>` : ''}`;
            sendHTML(200, { title: `${result.media.title} 的信息`, imageBackground: utils.toHTTPS(result.media.horizontal_picture || result.media.cover), content, vid: requestVid });
            break;
          case -352:
          case -401:
          case -412:
          case -799:
            respHeaders.set('Retry-After', '600');
            sendHTML(429, { title: '请求被拦截', content: '抱歉，本 API 的请求已被 B 站拦截，请等一段时间后重试 awa', vid: requestVid });
            break;
          case -404:
            sendHTML(404, { title: '剧集不存在', content: '您想要获取信息的剧集不存在！QAQ', vid: requestVid });
            break;
          default:
            sendHTML(400, { title: '获取剧集信息失败', content: '获取剧集信息失败，请稍后重试 awa', vid: requestVid });
        }
      } else if (responseType === 2) { // 回复封面数据
        if (json.code === 0) {
          const result = json.result!
          if (responseAttributes.includes('REDIRECT')) { // 允许本 API 重定向到 B 站服务器的封面地址
            resolve(utils.redirect(307, utils.toHTTPS(result.media.cover)));
          } else {
            const filename = encodeURIComponent(`${result.media.title} 的封面.${new URL(result.media.cover).pathname.split('.').at(-1)}`); // 设置封面的文件名
            const resp = await fetch(utils.toHTTPS(result.media.cover)); // 获取 B 站服务器存储的封面
            if (resp.status === 200) {
              respHeaders.set('Cache-Control', 's-maxage=60, stale-while-revalidate');
              respHeaders.set('Content-Type', resp.headers.get('Content-Type')!);
              respHeaders.set('Content-Disposition', `inline; filename=${filename}`);
              send(200, resp.body);
            } else {
              if (responseAttributes.includes('ERRORWHENFAILED') && fetchDest !== 2) {
                if (fetchDest === 1) {
                  sendHTML(404, { title: `获取 ${result.media.title} 的封面数据失败`, content: `获取 ${utils.encodeHTML(result.media.title)} 的封面数据失败，请稍后重试 awa`, vid: requestVid });
                } else {
                  sendJSON(404, { code: -404, message: 'cannot fetch image', data: null, extInfo: { errType: 'upstreamServerRespError', upstreamServerUrl: utils.toHTTPS(result.media.cover), upstreamServerRespStatus: resp.status } });
                }
              } else {
                respHeaders.set('Content-Type', 'image/png');
                send(404, fs.createReadStream('./assets/nocover.png'));
              }
            }
          }
        } else { // 剧集信息获取失败，回复默认封面
          if (responseAttributes.includes('ERRORWHENFAILED') && fetchDest !== 2) {
            if (fetchDest === 1) {
              sendHTML(404, { title: `获取 md${vid} 的封面数据失败`, content: `获取 md${vid} 的封面数据失败，这个剧集可能不存在哟 qwq`, vid: requestVid });
            } else {
              sendJSON(404, { code: -404, message: '啥都木有', data: null, extInfo: { errType: 'upstreamServerNoData' } });
            }
          } else {
            respHeaders.set('Content-Type', 'image/png');
            send(404, fs.createReadStream('./assets/nocover.png'));
          }
        }
      } else { // 回复 JSON
        switch (json.code) {
          case 0:
            sendJSON(200, { code: 0, message: json.message, data: json.result! });
            break;
          case -352:
          case -401:
          case -412:
          case -799:
            respHeaders.set('Retry-After', '600');
            sendJSON(429, { code: json.code, message: json.message, data: null, extInfo: { errType: 'upstreamServerRequestBanned' } });
            break;
          case -404:
            sendJSON(404, { code: -404, message: json.message, data: null, extInfo: { errType: 'upstreamServerNoData' } });
            break;
          default:
            sendJSON(400, { code: json.code, message: json.message, data: null, extInfo: { errType: 'upstreamServerNoData' } });
        }
      }
    } else if (type && [3, 4].includes(type)) { // 编号为 ssid 或 epid
      const json = <BangumiAPIResponse<BangumiSeasonData>>await (await fetch(`https://api.bilibili.com/pgc/view/web/season?${type === 3 ? 'season' : 'ep'}_id=${vid}`, { headers })).json();
      if (responseType === 3) { // 获取剧集中某一集的视频数据
        if (json.code === 0) {
          const result = json.result!;
          let P;
          if (type === 3) { // 编号为 ssid
            const requestCid = params.get('cid'), requestPage = params.get('p');
            if (requestCid && /^\d+$/.test(requestCid) && BigInt(requestCid) > 0) { // 客户端提供的 cid 有效
              P = result.episodes.find(p => BigInt(p.cid) === BigInt(requestCid)); // 在正片中寻找 cid 与客户端提供的 cid 相同的一集
              if (!P) { // 在正片中没有找到
                for (const s of result.section) { // 在其他部分寻找
                  P = s.episodes.find(p => BigInt(p.cid) === BigInt(requestCid));
                  if (P) break;
                }
              }
            } else if (requestPage && /^\d+$/.test(requestPage) && +requestPage > 0) { // 客户端提供的参数“p”有效
              P = result.episodes[+requestPage - 1];
            } else {
              P = result.episodes[0]; // 第 1 集
            }
          } else { // 编号为 epid
            P = result.episodes.find(p => BigInt(p.id) === vid); // 在正片中寻找 epid 与客户端提供的 epid 相同的一集
            if (!P) { // 在正片中没有找到
              for (const s of result.section) { // 在其他部分寻找
                P = s.episodes.find(p => BigInt(p.id) === vid);
                if (P) break;
              }
            }
          }
          
          if (P) { // 客户端提供的集号参数有效
            const qualities = [6, 16, 32, 64, 74, 80]; // 240P、360P、480P、720P、720P60、1080P
            let url;
            for (const q of qualities) {
              const vjson = <BangumiAPIResponse<BangumiPlayUrlData>>await (await fetch(`https://api.bilibili.com/pgc/player/web/playurl?bvid=${P.bvid}&ep_id=${P.id}&cid=${P.cid}&qn=${q}&fnval=${q === 6 ? 1 : 0}&fnver=0&fourk=1&from_client=BROWSER`, { headers })).json();
              if (vjson.code === 0 && vjson.result!.durl[0].size <= 4500000) { // 视频地址获取成功，且视频大小不超过 4.5 MB（1 MB = 1000 KB；Vercel 限制 API 回复的内容不能超过 4.5 MB）
                url = vjson.result!.durl[0].url;
              } else {
                break;
              }
            }
            
            if (url) { // 视频地址获取成功
              const filename = encodeURIComponent(`${result.title}.${new URL(url).pathname.split('.').at(-1)}`); // 设置视频的文件名
              const resp = await fetch(url, { headers });
              if (resp.ok) {
                respHeaders.set('Cache-Control', 's-maxage=60, stale-while-revalidate');
                respHeaders.set('Content-Type', resp.headers.get('Content-Type')!);
                respHeaders.set('Content-Disposition', `inline; filename=${filename}`);
                send(200, resp.body);
              } else {
                if (responseAttributes.includes('ERRORWHENFAILED') && fetchDest !== 3) {
                  sendHTML(400, { title: '获取视频数据失败', content: '获取这一集的视频数据失败，请稍后重试 awa', vid: requestVid });
                } else {
                  respHeaders.set('Content-Type', 'video/mp4');
                  send(fetchDest === 3 ? 200 : 400, fs.createReadStream('./assets/error.mp4'));
                }
              }
            } else { // 视频地址获取失败
              if (responseAttributes.includes('ERRORWHENFAILED') && fetchDest !== 3) {
                sendHTML(500, { title: '无法获取视频数据', content: `
                  抱歉，由于您想要获取的这一集的视频无法下载（原因可能是视频太大，或者版权、地区限制，等等），本 API 无法向您发送这一集的视频的数据哟 qwq<br />
                  如果您想下载这一集，最好使用其他工具哟 awa`, vid: requestVid });
              } else {
                respHeaders.set('Content-Type', 'video/mp4');
                send(fetchDest === 3 ? 200 : 500, fs.createReadStream('./assets/error.mp4'));
              }
            }
          } else { // 客户端提供的集号参数无效
            if (responseAttributes.includes('ERRORWHENFAILED') && fetchDest !== 3) {
              sendHTML(404, { title: '无法获取视频数据', content: '获取这一集的视频数据失败，您可能输入了错误的集号哟 qwq', vid: requestVid });
            } else {
              respHeaders.set('Content-Type', 'video/mp4');
              send(fetchDest === 3 ? 200 : 404, fs.createReadStream('./assets/error.mp4'));
            }
          }
        } else { // 剧集无效
          if (responseAttributes.includes('ERRORWHENFAILED') && fetchDest !== 3) {
            sendHTML(404, { title: '无法获取视频数据', content: '获取这一集的视频数据失败，您想获取的剧集可能不存在哟 qwq', vid: requestVid });
          } else {
            respHeaders.set('Content-Type', 'video/mp4');
            send(fetchDest === 3 ? 200 : 404, fs.createReadStream('./assets/error.mp4'));
          }
        }
      } else { // 获取剧集信息
        if (responseType === 1) { // 回复 HTML
          switch (json.code) {
            case 0:
              const result = json.result!, types = { 1: '番剧', 2: '电影', 3: '纪录片', 4: '国创', 5: '电视剧', 6: '漫画', 7: '综艺' };
              const content = `
                <div class="main-info-outer">
                  <div class="main-info-inner">
                    <div class="image-wrap">
                      <a target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/bangumi/play/ss${result.season_id}"><img class="spic" title="${utils.encodeHTML(result.title)}" src="${utils.toHTTPS(result.cover)}" /></a>
                    </div>
                    <div class="detail">
                      <a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/bangumi/play/ss${result.season_id}">${utils.encodeHTML(result.title)}</a><br />
                      <span class="description">ss${result.season_id}，md${result.media_id}</span><br />
                      ${result.styles?.length ? `<span class="description">${result.styles.map(s => `<span class="icon-font icon-tag"></span> ${utils.encodeHTML(s)}`).join(' ')}</span><br />` : ''}
                      ${types[result.type] ?? ''}${result.rights.copyright === 'bilibili' ? ' 授权' : result.rights.copyright === 'dujia' ? ' 独家' : ''}${result.total === -1 ? '' : ` 已完结，共 ${result.total} 集`} ${result.areas.map(a => utils.encodeHTML(a.name)).join('、')} ${result.rating?.score ? `${result.rating.score.toFixed(1)} 分（共 ${result.rating.count} 人评分）` : '暂无评分'}
                    </div>
                  </div>
                </div>
                <strong>发布时间：</strong>${utils.encodeHTML(result.publish.pub_time)}<br />
                ${result.record ? `<strong>备案号：</strong>${utils.encodeHTML(result.record)}<br />` : ''}
                ${result.actors || result.staff ? `
                <details>
                  <summary>查看制作人员信息</summary>
                  <div class="details">
                    ${result.actors ? `<strong>角色配音：</strong><br />${utils.encodeHTML(result.actors)}<br />` : ''}
                    ${result.staff ? `<strong>制作人员：</strong><br />${utils.encodeHTML(result.staff)}` : ''}
                  </details>
                </details>` : ''}
                <table>
                  <thead>
                    <tr><th>播放</th><th>追番</th><th>弹幕</th><th>评论</th><th>点赞</th><th>投币</th><th>收藏</th><th>分享</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>${utils.getNumber(result.stat.views)}</td><td>${utils.getNumber(result.stat.favorites)}</td><td>${utils.getNumber(result.stat.danmakus)}</td><td>${utils.getNumber(result.stat.reply)}</td><td>${utils.getNumber(result.stat.likes)}</td><td>${utils.getNumber(result.stat.coins)}</td><td>${utils.getNumber(result.stat.favorite)}</td><td>${utils.getNumber(result.stat.share)}</td></tr>
                  </tbody>
                </table>
                ${result.up_info ? `
                <div class="main-info-outer" id="user-${result.up_info.mid}" style="background-image: url(${utils.toHTTPS(result.up_info.avatar)});">
                  <div class="main-info-inner image">
                    <div class="left"><strong>UP 主：</strong></div>
                    <div class="image-wrap">
                      <a target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${result.up_info.mid}">
                        <img class="face" title="${utils.encodeHTML(result.up_info.uname)}" src="${utils.toHTTPS(result.up_info.avatar)}" />
                        ${[1, 2, 7, 8, 9].includes(result.up_info.verify_type) ? '<img class="face-icon icon-personal" alt title="UP 主认证" />' : [3, 4, 5, 6].includes(result.up_info.verify_type) ? '<img class="face-icon icon-business" alt title="机构认证" />' : result.up_info.vip_status ? '<img class="face-icon icon-big-vip" alt title="大会员" />' : ''}
                      </a>
                    </div>
                    <div class="detail">
                      <a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${result.up_info.mid}">${utils.encodeHTML(result.up_info.uname)}</a><br />
                      <strong>粉丝数：</strong>${utils.getNumber(result.up_info.follower)}
                    </div>
                  </div>
                </div>` : ''}
                <strong>正片：</strong>
                ${result.episodes.map(p => `
                <div class="main-info-outer"${p.cover ? ` style="background-image: url(${utils.toHTTPS(p.cover)});"` : ''}>
                  <div class="main-info-inner${p.cover ? ' image' : ''}">
                    <div class="left"><a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/bangumi/play/ep${p.id}">${utils.encodeHTML(p.title)}</a></div>
                    ${p.cover ? `
                    <div class="image-wrap">
                      <a target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/bangumi/play/ep${p.id}">
                        <img class="ppic" title="${utils.encodeHTML(`${p.title} ${p.long_title}`)}" src="${utils.toHTTPS(p.cover)}" />
                      </a>
                    </div>` : ''}
                    <div class="detail">
                      <a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/bangumi/play/ep${p.id}">${utils.encodeHTML(p.long_title)}</a> ${utils.getTime(p.duration / 1000)}${p.dimension?.height && p.dimension?.width ? ` <span class="description">${p.dimension.rotate ? `${p.dimension.height}×${p.dimension.width}` : `${p.dimension.width}×${p.dimension.height}`}</span>` : ''}${p.badge ? ` ${p.badge}` : ''}<br />
                      <strong>发布时间：</strong>${utils.getDate(p.pub_time)}<br />
                      <strong>cid：</strong>${p.cid} <a target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/bangumi/play/ep${p.id}">ep${p.id}</a> <a href="?vid=${p.bvid}">${p.bvid}</a>
                    </div>
                  </div>
                </div>`).join('')}
                ${result.section ? result.section.map(s => `
                <strong>${utils.encodeHTML(s.title)}：</strong>
                ${s.episodes.map(p => s.type === 5 ? `
                <div class="main-info-outer"${p.cover ? ` style="background-image: url(${utils.toHTTPS(p.cover)});"` : ''}>
                  <div class="main-info-inner${p.cover ? ' image' : ''}">
                    ${p.cover ? `
                    <div class="image-wrap">
                      <a target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/video/${utils.toBV(p.aid)}/">
                        <img class="ppic" title="${utils.encodeHTML(p.title)}" src="${utils.toHTTPS(p.cover)}" />
                      </a>
                    </div>` : ''}
                    <div class="detail">
                      <a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/video/${utils.toBV(p.aid)}/">${utils.encodeHTML(p.title)}</a>${p.badge ? ` ${p.badge}` : ''}<br />
                      ${p.pub_time ? `<strong>发布时间：</strong>${utils.getDate(p.pub_time)}<br />` : ''}
                      ${p.cid ? `<strong>cid：</strong>${p.cid} ` : ''}${p.id ? `<a target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/bangumi/play/ep${p.id}">ep${p.id}</a> ` : ''}<a href="?vid=${utils.toBV(p.aid)}">${utils.toBV(p.aid)}</a>
                    </div>
                  </div>
                </div>` : `
                <div class="main-info-outer"${p.cover ? ` style="background-image: url(${utils.toHTTPS(p.cover)});"` : ''}>
                  <div class="main-info-inner${p.cover ? ' image' : ''}">
                    <div class="left"><a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/bangumi/play/ep${p.id}">${utils.encodeHTML(p.title)}</a></div>
                    ${p.cover ? `
                    <div class="image-wrap">
                      <a target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/bangumi/play/ep${p.id}">
                        <img class="ppic" title="${utils.encodeHTML(`${p.title} ${p.long_title}`)}" src="${utils.toHTTPS(p.cover)}" />
                      </a>
                    </div>` : ''}
                    <div class="detail">
                      <a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/bangumi/play/ep${p.id}">${utils.encodeHTML(p.long_title)}</a> ${utils.getTime(p.duration / 1000)}${p.dimension?.height && p.dimension?.width ? ` <span class="description">${p.dimension.rotate ? `${p.dimension.height}×${p.dimension.width}` : `${p.dimension.width}×${p.dimension.height}`}</span>` : ''}${p.badge ? ` ${p.badge}` : ''}<br />
                      ${p.pub_time ? `<strong>发布时间：</strong>${utils.getDate(p.pub_time)}<br />` : ''}
                      ${p.cid ? `<strong>cid：</strong>${p.cid} ` : ''}<a target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/bangumi/play/ep${p.id}">ep${p.id}</a> <a href="?vid=${utils.toBV(p.aid)}">${utils.toBV(p.aid)}</a>
                    </div>
                  </div>
                </div>`).join('')}`).join('') : ''}
                <strong>简介：</strong><br />
                ${utils.markText(result.evaluate)}`;
              sendHTML(200, { title: `${result.title} 的信息`, imageBackground: utils.toHTTPS(result.bkg_cover || result.cover), content, vid: requestVid });
              break;
            case -352:
            case -401:
            case -412:
            case -799:
              respHeaders.set('Retry-After', '600');
              sendHTML(429, { title: '请求被拦截', content: '抱歉，本 API 的请求已被 B 站拦截，请等一段时间后重试 awa', vid: requestVid });
              break;
            case -404:
              sendHTML(404, { title: '番剧不存在', content: '您想要获取信息的番剧不存在！QAQ', vid: requestVid });
              break;
            default:
              sendHTML(400, { title: '获取番剧信息失败', content: '获取番剧信息失败，请稍后重试 awa', vid: requestVid });
          }
        } else if (responseType === 2) { // 回复封面数据
          if (json.code === 0) {
            const result = json.result!;
            if (responseAttributes.includes('REDIRECT')) { // 允许本 API 重定向到 B 站服务器的封面地址
              resolve(utils.redirect(307, utils.toHTTPS(result.cover)));
            } else {
              const filename = encodeURIComponent(`${result.title} 的封面.${new URL(result.cover).pathname.split('.').at(-1)}`); // 设置封面的文件名
              const resp = await fetch(utils.toHTTPS(result.cover)); // 获取 B 站服务器存储的封面
              if (resp.status === 200) {
                respHeaders.set('Cache-Control', 's-maxage=60, stale-while-revalidate');
                respHeaders.set('Content-Type', resp.headers.get('Content-Type')!);
                respHeaders.set('Content-Disposition', `inline; filename=${filename}`);
                send(200, resp.body);
              } else {
                if (responseAttributes.includes('ERRORWHENFAILED') && fetchDest !== 2) {
                  if (fetchDest === 1) {
                    sendHTML(404, { title: `获取 ${result.title} 的封面数据失败`, content: `获取 ${utils.encodeHTML(result.title)} 的封面数据失败，请稍后重试 awa`, vid: requestVid });
                  } else {
                    sendJSON(404, { code: -404, message: 'cannot fetch image', data: null, extInfo: { errType: 'upstreamServerRespError', upstreamServerUrl: utils.toHTTPS(result.title), upstreamServerRespStatus: resp.status } });
                  }
                } else {
                  respHeaders.set('Content-Type', 'image/png');
                  send(404, fs.createReadStream('./assets/nocover.png'));
                }
              }
            }
          } else { // 番剧信息获取失败，回复默认封面
            if (responseAttributes.includes('ERRORWHENFAILED') && fetchDest !== 2) {
              if (fetchDest === 1) {
                sendHTML(404, { title: `获取 ${type === 3 ? 'ss' : 'ep'}${vid} 的封面数据失败`, content: `获取 ${type === 3 ? 'ss' : 'ep'}${vid} 的封面数据失败，这个视频可能不存在哟 qwq`, vid: requestVid });
              } else {
                sendJSON(404, { code: -404, message: '啥都木有', data: null, extInfo: { errType: 'upstreamServerNoData' } });
              }
            } else {
              respHeaders.set('Content-Type', 'image/png');
              send(404, fs.createReadStream('./assets/nocover.png'));
            }
          }
        } else { // 回复 JSON
          switch (json.code) {
            case 0:
              sendJSON(200, { code: 0, message: json.message, data: json.result! });
              break;
            case -352:
            case -401:
            case -412:
            case -799:
              respHeaders.set('Retry-After', '600');
              sendJSON(429, { code: json.code, message: json.message, data: null, extInfo: { errType: 'upstreamServerRequestBanned' } });
              break;
            case -404:
              sendJSON(404, { code: -404, message: json.message, data: null, extInfo: { errType: 'upstreamServerNoData' } });
              break;
            default:
              sendJSON(400, { code: json.code, message: json.message, data: null, extInfo: { errType: 'upstreamServerNoData' } });
          }
        }
      }
    } else { // 编号无效
      if (responseType === 1) { // 回复 HTML
        if (!requestVid) { // 没有设置参数“vid”
          sendHTML(200, { title: '获取哔哩哔哩视频 / 剧集 / 番剧信息及数据', newStyle: true, content: `
            本 API 可以获取指定 B 站视频、剧集、番剧的信息及数据。<br />
            基本用法：https://${req.headers.get('host')}<wbr />/api<wbr />/getvideo?vid=<span class="notice">您想获取信息的视频、剧集、番剧的编号</span><br />
            更多用法见<a target="_blank" rel="noopener external nofollow noreferrer" href="https://github.com/${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}/blob/${process.env.VERCEL_GIT_COMMIT_REF}/README.md#%E8%8E%B7%E5%8F%96%E5%93%94%E5%93%A9%E5%93%94%E5%93%A9%E8%A7%86%E9%A2%91--%E5%89%A7%E9%9B%86--%E7%95%AA%E5%89%A7%E4%BF%A1%E6%81%AF%E5%8F%8A%E6%95%B0%E6%8D%AE">本站的使用说明</a>。` });
        } else { // 设置了“vid”参数但无效
          sendHTML(400, { title: '编号无效', content: `
            您输入的编号无效！<br />
            请输入一个正确的编号吧 awa` });
        }
      } else if (responseType === 2) { // 回复封面数据
        if (responseAttributes.includes('ERRORWHENFAILED') && fetchDest !== 2) {
          if (fetchDest === 1) {
            sendHTML(400, { title: '编号无效', content: `
              您输入的编号无效！<br />
              请输入一个正确的编号吧 awa` });
          } else {
            sendJSON(400, { code: -400, message: '请求错误', data: null, extInfo: { errType: 'internalServerInvalidRequest' } });
          }
        } else {
          respHeaders.set('Content-Type', 'image/png');
          send(400, fs.createReadStream('./assets/nocover.png'));
        }
      } else { // 回复 JSON
        sendJSON(400, { code: -400, message: '请求错误', data: null, extInfo: { errType: 'internalServerInvalidRequest' } });
      }
    }
  } catch (e) {
    resolve(utils.send500(responseType, e));
  }
});
export const HEAD = GET, OPTIONS = GET, POST = GET, PUT = GET, DELETE = GET, PATCH = GET;
