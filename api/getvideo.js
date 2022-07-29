/* 获取哔哩哔哩视频 / 剧集 / 番剧 / 影视信息及数据
 *   https://api.wuziqian211.top/api/getvideo
 * 使用说明见https://github.com/wuziqian211/website-api/blob/main/README.md#%E8%8E%B7%E5%8F%96%E5%93%94%E5%93%A9%E5%93%94%E5%93%A9%E8%A7%86%E9%A2%91--%E5%89%A7%E9%9B%86--%E7%95%AA%E5%89%A7--%E5%BD%B1%E8%A7%86%E4%BF%A1%E6%81%AF%E5%8F%8A%E6%95%B0%E6%8D%AE。
 * 作者：wuziqian211（https://wuziqian211.top/）
 */
'use strict';
import fetch from 'node-fetch';
import {readFileSync} from 'fs';
import * as utils from '../assets/utils.js';
const file = fileName => readFileSync(new URL(fileName, import.meta.url));
export default async (req, res) => {
  const startTime = performance.now();
  try {
    const sendHTML = data => res.setHeader('Content-Type', 'text/html; charset=utf-8').send(utils.renderHTML({startTime, title: data.title, style: data.style, desc: '获取哔哩哔哩视频 / 剧集 / 番剧 / 影视信息及数据', body: `
      ${data.content}
      <form>
        <div>
          <label for="vid">请输入您想要获取信息的视频 / 剧集 / 番剧 / 影视的编号（仅输入数字会被视为 AV 号）：</label>
        </div>
        <div>
          <input type="text" name="vid" id="vid" value="${data.vid}" placeholder="av…/BV…/md…/ss…/ep…" pattern="^(?:BV|bv)1[1-9A-HJ-NP-Za-km-z]{2}4[1-9A-HJ-NP-Za-km-z]1[1-9A-HJ-NP-Za-km-z]7[1-9A-HJ-NP-Za-km-z]{2}$|^(?:AV|av|md|ss|ep)?[0-9]+$" maxlength="12" autocomplete="off" spellcheck="false" />
          <input type="submit" value="获取" />
        </div>
      </form>
    `})); // 将HTML数据发送到客户端
    const accept = utils.getAccept(req);
    const {type, vid} = utils.getVidType(req.query.vid); // 判断用户给出的编号类型
    if (type === 1) { // 编号为AV号或BV号
      const json = await (await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${vid}`)).json(); // （备用）获取更详细的信息https://api.bilibili.com/x/web-interface/view/detail?bvid=BV1……
      if (req.query.type === 'data') { // 获取视频数据
        let cid;
        if (json.code === 0 && json.data.pages) {
          if (/^\d+$/.test(req.query.cid)) { // 用户提供的cid有效
            cid = json.data.pages.map(p => p.cid).indexOf(parseInt(req.query.cid)) === -1 ? 0 : parseInt(req.query.cid); // 若API返回的pages中包含用户提供的cid，则将变量“cid”设置为用户提供的cid
          } else if (/^\d+$/.test(req.query.p)) { // 用户提供的参数“p”有效
            cid = json.data.pages[parseInt(req.query.p) - 1]?.cid; // 将变量“cid”设置为该P的cid
          } else {
            cid = json.data.cid; // 将变量“cid”设置为该视频第1P的cid
          }
        }
        if (cid) { // 视频有效
          const q = [6, 16, 32, 64]; // 240P、360P、480P、720P
          let u;
          for (let n = 0; n < q.length; n++) {
            const vjson = await (await fetch(`https://api.bilibili.com/x/player/playurl?bvid=${vid}&cid=${cid}&qn=${q[n]}&fnval=${q[n] === 6 ? 1 : 0}&fnver=0`)).json(); // （备用）添加html5=1参数获取到的视频链接似乎可以不限Referer
            if (vjson.code === 0 && vjson.data.durl[0].size <= 5000000) { // 视频地址获取成功，且视频大小不超过5MB（1MB=1000KB；本API的服务商限制API发送的内容不能超过5MB）
              u = vjson.data.durl[0].url;
            } else {
              break;
            }
          }
          if (u) { // 视频地址获取成功
            const t = u.slice(0, u.indexOf('?'));
            const filename = encodeURIComponent(`${json.data.title}.${t.slice(t.lastIndexOf('.') + 1)}`); // 设置视频的文件名
            const resp = await fetch(u, {headers: {Referer: `https://www.bilibili.com/video/${vid}`}});
            if (resp.ok) {
              res.status(200).setHeader('Content-Type', resp.headers.get('Content-Type')).setHeader('Content-Disposition', `inline; filename=${filename}`).send(Buffer.from(await resp.arrayBuffer()));
            } else {
              if (req.headers['sec-fetch-dest'] === 'video') {
                res.status(200).setHeader('Content-Type', 'video/mp4').send(file('../assets/error.mp4'));
              } else {
                res.status(404);
                sendHTML({title: '获取视频数据失败', content: '获取视频数据失败，请稍后重试 awa', vid: req.query.vid});
              }
            }
          } else { // 视频地址获取失败
            if (req.headers['sec-fetch-dest'] === 'video') {
              res.status(200).setHeader('Content-Type', 'video/mp4').send(file('../assets/error.mp4'));
            } else {
              res.status(500);
              sendHTML({title: '无法获取视频数据', content: `抱歉，由于您想要获取数据的视频无法下载（原因可能是视频太大，或者版权限制，等等），本 API 无法向您发送这个视频的数据哟 qwq<br />
      如果您想下载视频，最好使用其他工具哟 awa`, vid: req.query.vid});
            }
          }
        } else { // 视频无效
          if (req.headers['sec-fetch-dest'] === 'video') {
            res.status(200).setHeader('Content-Type', 'video/mp4').send(file('../assets/error.mp4'));
          } else {
            res.status(404);
            sendHTML({title: '无法获取视频数据', content: '获取视频数据失败，您想获取的视频可能不存在，或者您可能输入了错误的分 P 哟 qwq', vid: req.query.vid});
          }
        }
      } else { // 获取视频信息
        if (accept === 1) { // 客户端想要获取类型为“文档”的数据，返回HTML
          switch (json.code) {
            case 0:
              res.status(200);
              sendHTML({title: `${utils.encodeHTML(json.data.title)} 的信息`, style: utils.renderExtraStyle(utils.toHTTPS(json.data.pic)), content: `<a class="no-underline" target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/video/${vid}"><img class="vpic" alt="" title="${utils.encodeHTML(json.data.title)}" src="${utils.toHTTPS(json.data.pic)}" referrerpolicy="no-referrer" /> <strong>${utils.encodeHTML(json.data.title)}</strong></a>（av${json.data.aid}，${utils.encodeHTML(json.data.bvid)}）${json.data.forward ? ` 已与 <a href="?vid=${utils.toBV(json.data.forward)}">${utils.toBV(json.data.forward)}</a> 撞车` : ''}<br />
      ${json.data.videos}P ${utils.getTime(json.data.duration)} ${json.data.copyright === 1 ? '自制' : '转载'}${json.data.rights.no_reprint ? '（未经作者授权，禁止转载）' : ''}${json.data.stat.evaluation ? ` ${utils.encodeHTML(json.data.stat.evaluation)}` : ''}${json.data.stat.now_rank ? ` 当前排名第 ${json.data.stat.now_rank} 名` : ''}${json.data.stat.his_rank ? ` 历史最高排名第 ${json.data.stat.his_rank} 名` : ''}<br />
      ${json.data.stat.argue_msg ? `<strong class="mark">${utils.encodeHTML(json.data.stat.argue_msg)}</strong><br />
      ` : ''}<strong class="mark">分区：</strong>${utils.encodeHTML(json.data.tname)}<br />
      <s><strong class="mark">投稿时间：</strong>${utils.getDate(json.data.ctime)}（已弃用）</s><br />
      <strong class="mark">发布时间：</strong>${utils.getDate(json.data.pubdate)}
      <table>
        <thead>
          <tr><th>播放量</th><th>弹幕数</th><th>评论数</th><th>点赞数</th><th>投币数</th><th>收藏数</th><th>分享数</th></tr>
        </thead>
        <tbody>
          <tr><td>${utils.getNumber(json.data.stat.view)}</td><td>${utils.getNumber(json.data.stat.danmaku)}</td><td>${utils.getNumber(json.data.stat.reply)}</td><td>${utils.getNumber(json.data.stat.like)}</td><td>${utils.getNumber(json.data.stat.coin)}</td><td>${utils.getNumber(json.data.stat.favorite)}</td><td>${utils.getNumber(json.data.stat.share)}</td></tr>
        </tbody>
      </table>
      ${json.data.rights.is_cooperation ? `<strong class="mark">合作成员：</strong><br />
      ${json.data.staff.map(u => `<a class="no-underline" target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${u.mid}"><img class="uface" alt="" title="${utils.encodeHTML(u.name)}" src="${utils.toHTTPS(u.face)}" referrerpolicy="no-referrer" /> <strong>${utils.encodeHTML(u.name)}</strong></a>（<strong class="mark">粉丝数：</strong>${utils.getNumber(u.follower)}） ${utils.encodeHTML(u.title)}`).join(`<br />
      `)}` : `<strong class="mark">UP 主：</strong><a class="no-underline" target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${json.data.owner.mid}"><img class="uface" alt="" title="${utils.encodeHTML(json.data.owner.name)}" src="${utils.toHTTPS(json.data.owner.face)}" referrerpolicy="no-referrer" /> <strong>${utils.encodeHTML(json.data.owner.name)}</strong></a>`}<br />
      ${json.data.pages ? `${json.data.pages.map(p => `<strong class="mark">P${p.page} ${utils.encodeHTML(p.part)}</strong>（<strong class="mark">cid：</strong>${p.cid}） ${utils.getTime(p.duration)}`).join(`<br />
      `)}<br />
      ` : ''}<strong class="mark">简介：</strong><br />
      ${utils.encodeHTML(json.data.desc)}`, vid: req.query.vid});
              break;
            case -412:
              res.status(429).setHeader('Retry-After', '600');
              sendHTML({title: '请求被拦截', content: '抱歉，本 API 的请求已被 B 站拦截，请等一段时间后重试 awa', vid: req.query.vid});
              break;
            case -404:
            case 62002:
              res.status(404);
              sendHTML({title: '视频不存在', content: '您想要获取信息的视频不存在！QAQ', vid: req.query.vid});
              break;
            case -403:
              res.status(403);
              sendHTML({title: '获取视频信息需登录', content: `这个视频需要登录才能获取信息！QwQ<br />
      您可以在 B 站获取<a target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/video/${vid}">这个视频的信息</a>哟 awa`, vid: req.query.vid});
              break;
            default:
              res.status(400);
              sendHTML({title: '获取视频信息失败', content: '获取视频信息失败，请稍后重试 awa', vid: req.query.vid});
          }
        } else if (accept === 2) { // 客户端想要获取类型为“图片”的数据，获取封面
          if (json.code === 0) {
            if (req.query.allow_redirect != undefined) { // 允许本API重定向到B站服务器的封面地址
              res.status(307).setHeader('Location', utils.toHTTPS(json.data.pic)).json({code: 307, data: {url: utils.toHTTPS(json.data.pic)}});
            } else {
              const a = utils.toHTTPS(json.data.pic).split('.');
              const filename = encodeURIComponent(`${json.data.title} 的封面.${a[a.length - 1]}`); // 设置封面的文件名
              const resp = await fetch(utils.toHTTPS(json.data.pic)); // 获取B站服务器存储的封面
              if (resp.status === 200) {
                res.status(200).setHeader('Content-Type', resp.headers.get('Content-Type')).setHeader('Content-Disposition', `inline; filename=${filename}`).send(Buffer.from(await resp.arrayBuffer()));
              } else {
                res.status(404).setHeader('Content-Type', 'image/png').send(file('../assets/nopic.png'));
              }
            }
          } else { // 视频信息获取失败，返回默认封面
            res.status(404).setHeader('Content-Type', 'image/png').send(file('../assets/nopic.png'));
          }
        } else { // 否则，返回JSON
          switch (json.code) {
            case 0:
              res.status(200).json({code: 0, data: json.data});
              break;
            case -412:
              res.status(429).setHeader('Retry-After', '600').json({code: -412});
              break;
            case -404:
            case 62002:
              res.status(404).json({code: -404});
              break;
            case -403:
              res.status(403).json({code: -403});
              break;
            default:
              res.status(400).json({code: json.code, message: json.message});
          }
        }
      }
    } else if (type === 2) { // 编号为mdid
      const json = await (await fetch(`https://api.bilibili.com/pgc/review/user?media_id=${vid}`)).json();
      if (accept === 1) { // 客户端想要获取类型为“文档”的数据，返回HTML
        switch (json.code) {
          case 0:
            res.status(307).setHeader('Location', `?vid=ss${json.result.media.season_id}`).json({code: 307, data: {url: `?vid=ss${json.result.media.season_id}`}});
            break;
          case -412:
            res.status(429).setHeader('Retry-After', '600');
            sendHTML({title: '请求被拦截', content: '抱歉，本 API 的请求已被 B 站拦截，请等一段时间后重试 awa', vid: req.query.vid});
            break;
          case -404:
            res.status(404);
            sendHTML({title: '剧集不存在', content: '您想要获取信息的剧集不存在！QAQ', vid: req.query.vid});
            break;
          default:
            res.status(400);
            sendHTML({title: '获取剧集信息失败', content: '获取剧集信息失败，请稍后重试 awa', vid: req.query.vid});
        }
      } else if (accept === 2) { // 客户端想要获取类型为“图片”的数据，获取封面
        if (json.code === 0) {
          if (req.query.allow_redirect != undefined) { // 允许本API重定向到B站服务器的封面地址
            res.status(307).setHeader('Location', utils.toHTTPS(json.result.media.cover)).json({code: 307, data: {url: utils.toHTTPS(json.result.media.cover)}});
          } else {
            const a = utils.toHTTPS(json.result.media.cover).split('.');
            const filename = encodeURIComponent(`${json.result.media.title} 的封面.${a[a.length - 1]}`); // 设置封面的文件名
            const resp = await fetch(utils.toHTTPS(json.result.media.cover)); // 获取B站服务器存储的封面
            if (resp.status === 200) {
              res.status(200).setHeader('Content-Type', resp.headers.get('Content-Type')).setHeader('Content-Disposition', `inline; filename=${filename}`).send(Buffer.from(await resp.arrayBuffer()));
            } else {
              res.status(404).setHeader('Content-Type', 'image/png').send(file('../assets/nopic.png'));
            }
          }
        } else { // 剧集信息获取失败，返回默认封面
          res.status(404).setHeader('Content-Type', 'image/png').send(file('../assets/nopic.png'));
        }
      } else { // 否则，返回JSON
        switch (json.code) {
          case 0:
            res.status(200).json({code: 0, result: json.result});
            break;
          case -412:
            res.status(429).setHeader('Retry-After', '600').json({code: -412});
            break;
          case -404:
            res.status(404).json({code: -404});
            break;
          default:
            res.status(400).json({code: json.code, message: json.message});
        }
      }
    } else if (type === 3 || type === 4) { // 编号为ssid或epid
      const json = await (await fetch(`https://api.bilibili.com/pgc/view/web/season?${type === 3 ? 'season' : 'ep'}_id=${vid}`)).json();
      if (req.query.type === 'data') { // 获取剧集中某一集的视频数据
        let bvid, cid, epid, n, P;
        if (json.code === 0) {
          if (type === 3) { // 编号为ssid
            if (/^\d+$/.test(req.query.cid)) { // 用户提供的cid有效
              n = json.result.episodes.map(p => p.cid).indexOf(parseInt(req.query.cid)); // 在正片中寻找cid与用户提供的cid相同的一集
              if (n === -1) { // 在正片中没有找到
                for (let i = 0; i < json.result.section.length; i++) { // 在其他部分寻找
                  n = json.result.section[i].episodes.map(p => p.cid).indexOf(parseInt(req.query.cid));
                  if (n !== -1) {
                    P = json.result.section[i].episodes[n];
                    break;
                  }
                }
              } else {
                P = json.result.episodes[n];
              }
            } else if (type === 3 && /^\d+$/.test(req.query.p)) { // 用户提供的参数“p”有效
              P = json.result.episodes[parseInt(req.query.p) - 1];
            } else {
              P = json.result.episodes[0]; // 第1集
            }
          } else { // 编号为epid
            n = json.result.episodes.map(p => p.id).indexOf(vid); // 在正片中寻找epid与用户提供的epid相同的一集
            if (n === -1) { // 在正片中没有找到
              for (let i = 0; i < json.result.section.length; i++) { // 在其他部分寻找
                n = json.result.section[i].episodes.map(p => p.id).indexOf(vid);
                if (n !== -1) {
                  P = json.result.section[i].episodes[n];
                  break;
                }
              }
            } else {
              P = json.result.episodes[n];
            }
          }
          ({bvid, cid, id: epid} = P || {}); // 如果不加圆括号，左边的花括号及其里面的内容会被视为一个语句块
        }
        if (bvid && cid && epid) { // 剧集有效
          const q = [6, 16, 32, 64]; // 240P、360P、480P、720P
          let u;
          for (let n = 0; n < q.length; n++) {
            const vjson = await (await fetch(`https://api.bilibili.com/pgc/player/web/playurl?bvid=${bvid}&ep_id=${epid}&cid=${cid}&qn=${q[n]}&fnval=${q[n] === 6 ? 1 : 0}&fnver=0`)).json();
            if (vjson.code === 0 && vjson.result.durl[0].size <= 5000000) { // 视频地址获取成功，且视频大小不超过5MB（1MB=1000KB；本API的服务商限制API发送的内容不能超过5MB；真的有不超过5MB大小的番剧或者影视？）
              u = vjson.result.durl[0].url;
            } else {
              break;
            }
          }
          if (u) { // 视频地址获取成功
            const t = u.slice(0, u.indexOf('?'));
            const filename = encodeURIComponent(`${json.result.title}.${t.slice(t.lastIndexOf('.') + 1)}`); // 设置视频的文件名
            const resp = await fetch(u, {headers: {Referer: `https://www.bilibili.com/bangumi/play/${type === 3 ? 'ss' : 'ep'}${vid}`}});
            if (resp.ok) {
              res.status(200).setHeader('Content-Type', resp.headers.get('Content-Type')).setHeader('Content-Disposition', `inline; filename=${filename}`).send(Buffer.from(await resp.arrayBuffer()));
            } else {
              if (req.headers['sec-fetch-dest'] === 'video') {
                res.status(200).setHeader('Content-Type', 'video/mp4').send(file('../assets/error.mp4'));
              } else {
                res.status(404);
                sendHTML({title: '获取视频数据失败', content: '获取这一集的视频数据失败，请稍后重试 awa', vid: req.query.vid});
              }
            }
          } else { // 视频地址获取失败
            if (req.headers['sec-fetch-dest'] === 'video') {
              res.status(200).setHeader('Content-Type', 'video/mp4').send(file('../assets/error.mp4'));
            } else {
              res.status(500);
              sendHTML({title: '无法获取视频数据', content: `抱歉，由于您想要获取的这一集的视频无法下载（原因可能是视频太大，或者版权限制，等等），本 API 无法向您发送这一集的视频的数据哟 qwq<br />
      如果您想下载这一集，最好使用其他工具哟 awa`, vid: req.query.vid});
            }
          }
        } else { // 剧集无效
          if (req.headers['sec-fetch-dest'] === 'video') {
            res.status(200).setHeader('Content-Type', 'video/mp4').send(file('../assets/error.mp4'));
          } else {
            res.status(404);
            sendHTML({title: '无法获取视频数据', content: '获取这一集的视频数据失败，您想获取的剧集可能不存在，或者您可能输入了错误的集号哟 qwq', vid: req.query.vid});
          }
        }
      } else { // 获取剧集信息
        if (accept === 1) { // 客户端想要获取类型为“文档”的数据，返回HTML
          switch (json.code) {
            case 0:
              res.status(200);
              sendHTML({title: `${utils.encodeHTML(json.result.title)} 的信息`, style: utils.renderExtraStyle(utils.toHTTPS(json.result.cover)), content: `<a class="no-underline" target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/bangumi/play/${type === 3 ? 'ss' : 'ep'}${vid}"><img class="vpic" alt="" title="${utils.encodeHTML(json.result.title)}" src="${utils.toHTTPS(json.result.cover)}" referrerpolicy="no-referrer" /> <strong>${utils.encodeHTML(json.result.title)}</strong></a><br />
      ${json.result.type === 1 ? '番剧' : json.result.type === 2 ? '电影' : json.result.type === 3 ? '纪录片' : json.result.type === 4 ? '国创' : json.result.type === 5 ? '电视剧' : json.result.type === 7 ? '综艺' : ''}${json.result.total === -1 ? '' : ` 已完结，共 ${json.result.total} 集`} ${json.result.areas.map(a => utils.encodeHTML(a.name)).join('、')} ${json.result.rating.score.toFixed(1)} 分（共 ${json.result.rating.count} 人评分）<br />
      <strong class="mark">发布时间：</strong>${utils.encodeHTML(json.result.publish.pub_time)}
      <table>
        <thead>
          <tr><th>播放量</th><th>弹幕数</th><th>评论数</th><th>点赞数</th><th>投币数</th><th>收藏数</th><th>分享数</th></tr>
        </thead>
        <tbody>
          <tr><td>${utils.getNumber(json.result.stat.views)}</td><td>${utils.getNumber(json.result.stat.danmakus)}</td><td>${utils.getNumber(json.result.stat.reply)}</td><td>${utils.getNumber(json.result.stat.likes)}</td><td>${utils.getNumber(json.result.stat.coins)}</td><td>${utils.getNumber(json.result.stat.favorites)}</td><td>${utils.getNumber(json.result.stat.share)}</td></tr>
        </tbody>
      </table>
      ${json.result.up_info ? `<strong class="mark">UP 主：</strong><a class="no-underline" target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${json.result.up_info.mid}"><img class="uface" alt="" title="${utils.encodeHTML(json.result.up_info.uname)}" src="${utils.toHTTPS(json.result.up_info.avatar)}" referrerpolicy="no-referrer" /> <strong>${utils.encodeHTML(json.result.up_info.uname)}</strong></a>（<strong class="mark">粉丝数：</strong>${utils.getNumber(json.result.up_info.follower)}）<br />
      ` : ''}<strong class="mark">正片：</strong><br />
      ${json.result.episodes.map(p => `<strong class="mark">${utils.encodeHTML(p.title)} ${utils.encodeHTML(p.long_title)}</strong>（<a href="?vid=${p.bvid}">${p.bvid}</a>，<a target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/bangumi/play/ep${p.id}">ep${p.id}</a>，<strong class="mark">cid：</strong>${p.cid}，<strong class="mark">发布时间：</strong>${utils.getDate(p.pub_time)}） ${utils.getTime(p.duration / 1000)}`).join(`<br />
      `)}<br />
      ${json.result.section ? `${json.result.section.map(s => `<strong class="mark">${utils.encodeHTML(s.title)}：</strong><br />
      ${s.episodes.map(p => `<strong class="mark">${utils.encodeHTML(p.title)} ${utils.encodeHTML(p.long_title)}</strong>（<a href="?vid=${p.bvid}">${p.bvid}</a>，<a target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/bangumi/play/ep${p.id}">ep${p.id}</a>，<strong class="mark">cid：</strong>${p.cid}，<strong class="mark">发布时间：</strong>${utils.getDate(p.pub_time)}） ${utils.getTime(p.duration / 1000)}`).join(`<br />
      `)}`).join(`<br />
      `)}<br />
      ` : ''}<strong class="mark">简介：</strong><br />
      ${utils.encodeHTML(json.result.evaluate)}`, vid: req.query.vid});
              break;
            case -412:
              res.status(429).setHeader('Retry-After', '600');
              sendHTML({title: '请求被拦截', content: '抱歉，本 API 的请求已被 B 站拦截，请等一段时间后重试 awa', vid: req.query.vid});
              break;
            case -404:
              res.status(404);
              sendHTML({title: '剧集不存在', content: '您想要获取信息的剧集不存在！QAQ', vid: req.query.vid});
              break;
            default:
              res.status(400);
              sendHTML({title: '获取剧集信息失败', content: '获取剧集信息失败，请稍后重试 awa', vid: req.query.vid});
          }
        } else if (accept === 2) { // 客户端想要获取类型为“图片”的数据，获取封面
          if (json.code === 0) {
            if (req.query.allow_redirect != undefined) { // 允许本API重定向到B站服务器的封面地址
              res.status(307).setHeader('Location', utils.toHTTPS(json.result.cover)).json({code: 307, data: {url: utils.toHTTPS(json.result.cover)}});
            } else {
              const a = utils.toHTTPS(json.result.cover).split('.');
              const filename = encodeURIComponent(`${json.result.title} 的封面.${a[a.length - 1]}`); // 设置封面的文件名
              const resp = await fetch(utils.toHTTPS(json.result.cover)); // 获取B站服务器存储的封面
              if (resp.status === 200) {
                res.status(200).setHeader('Content-Type', resp.headers.get('Content-Type')).setHeader('Content-Disposition', `inline; filename=${filename}`).send(Buffer.from(await resp.arrayBuffer()));
              } else {
                res.status(404).setHeader('Content-Type', 'image/png').send(file('../assets/nopic.png'));
              }
            }
          } else { // 视频信息获取失败，返回默认封面
            res.status(404).setHeader('Content-Type', 'image/png').send(file('../assets/nopic.png'));
          }
        } else { // 否则，返回JSON
          switch (json.code) {
            case 0:
              res.status(200).json({code: 0, result: json.result});
              break;
            case -412:
              res.status(429).setHeader('Retry-After', '600').json({code: -412});
              break;
            case -404:
              res.status(404).json({code: -404});
              break;
            default:
              res.status(400).json({code: json.code, message: json.message});
          }
        }
      }
    } else { // 编号无效
      if (accept === 1) { // 客户端想要获取类型为“文档”的数据，返回HTML
        if (!req.query.vid) { // 没有设置参数“vid”
          res.status(200);
          sendHTML({title: '获取哔哩哔哩视频 / 剧集 / 番剧 / 影视信息及数据', content: `本 API 可以获取指定 B 站视频 / 剧集 / 番剧 / 影视的信息及数据。<br />
      基本用法：https://${req.headers.host}/api/getvideo?vid=<mark>您想获取信息的视频 / 剧集 / 番剧 / 影视的编号</mark><br />
      更多用法见<a target="_blank" rel="noopener external nofollow noreferrer" href="https://github.com/${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}/blob/${process.env.VERCEL_GIT_COMMIT_REF}/README.md#%E8%8E%B7%E5%8F%96%E5%93%94%E5%93%A9%E5%93%94%E5%93%A9%E8%A7%86%E9%A2%91--%E5%89%A7%E9%9B%86--%E7%95%AA%E5%89%A7--%E5%BD%B1%E8%A7%86%E4%BF%A1%E6%81%AF%E5%8F%8A%E6%95%B0%E6%8D%AE">本站的使用说明</a>。`, vid: ''});
        } else { // 设置了“vid”参数但无效
          res.status(400);
          sendHTML({title: '编号无效', content: `您输入的编号无效！<br />
      请输入一个正确的编号吧 awa`, vid: ''});
        }
      } else if (accept === 2) { // 客户端想要获取类型为“图片”的数据，返回默认封面
        res.status(400).setHeader('Content-Type', 'image/png').send(file('../assets/nopic.png'));
      } else { // 否则，返回JSON
        res.status(400).json({code: -400, message: '请求错误'});
      }
    }
  } catch (e) {
    console.error(e);
    res.status(500).send(utils.render500(startTime));
  }
};
