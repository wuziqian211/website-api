/* 获取哔哩哔哩视频信息及数据
 *   https://api.wuziqian211.top/api/getvideo
 * 本API允许任何合法网站与程序等调用，但本站不会存储任何访问记录，视频的信息、数据等，仅转发与处理B站API的返回数据。
 * 特别注意：请勿将本API用于非法用途！获取的视频的数据仅供预览，要下载视频，请使用其他工具，本API只能获取大小不超过5MB（1MB=1000KB）的视频。
 * 如果您的网站、程序等能正常调用B站的API，最好直接使用B站的API，会更快一些。
 * 请求参数（区分大小写）：
 *   vid：您想获取视频信息或数据的AV或BV号。
 *   cid：该视频分P的cid。
 *   p：该视频的第几个分P。
 *   allow_redirect：如果存在本参数，则获取封面数据时可能会重定向到B站服务器的封面地址。
 *   type：如果本参数的值为“data”，则返回视频数据，否则返回视频信息。
 *   其中，“cid”与“p”只能在获取视频数据时填写，且只能填写其中一个，如果不填，默认为P1。
 * 返回类型：
 *   如果请求参数“type”的值为“data”，则返回视频数据。
 *   否则，本API会检测HTTP请求头中“accept”与“sec-fetch-dest”的值：
 *     如果“accept”的值包含“html”，或者“sec-fetch-dest”的值为“document”（比如用浏览器直接访问本API页面），则返回HTML数据；
 *     如果“accept”的值包含“image”，或者“sec-fetch-dest”的值为“image”（比如在<img>标签的“src”参数填写本API网址），而且填写了有效的“vid”参数，则返回对应视频的封面；
 *     否则，返回JSON。
 * 响应代码（填写参数时）：
 *   200：视频存在
 *   307（注意不是302）：临时重定向
 *   403：需登录才能获取该视频的信息，本API无能为力
 *   404：视频不存在
 *   429（注意不是412）：请求太频繁，已被B站的API拦截
 *   400：视频ID无效，或者因其他原因请求失败
 *   500/504：视频太大，本API无法发送数据
 * 作者：wuziqian211
 *   https://wuziqian211.top/
 *   https://space.bilibili.com/425503913
 */
'use strict';
import fetch from 'node-fetch';
import URLEncode from 'urlencode';
import {readFileSync} from 'fs';
import * as utils from '../assets/utils.mjs';
const file = fileName => readFileSync(new URL(fileName, import.meta.url));
export default async (req, res) => {
  const startTime = Date.now();
  try {
    const sendHTML = data => res.setHeader('Content-Type', 'text/html; charset=utf-8').send(utils.renderHTML({startTime, title: data.title, style: data.style, desc: '获取哔哩哔哩视频信息及数据', body: `
      ${data.content}
      <form>
        <div>
          <label for="vid">请输入您想要获取信息的视频的 AV 或 BV 号：</label>
        </div>
        <div>
          <input type="text" name="vid" id="vid" value="${data.vid}" placeholder="av…/BV…" pattern="^(?:BV|bv)1[1-9A-HJ-NP-Za-km-z]{2}4[1-9A-HJ-NP-Za-km-z]1[1-9A-HJ-NP-Za-km-z]7[1-9A-HJ-NP-Za-km-z]{2}$|^(?:AV|av)?[0-9]+$" maxlength="12" autocomplete="off" spellcheck="false" />
          <input type="submit" value="获取" />
        </div>
      </form>
    `})); // 将HTML数据发送到客户端
    const accept = utils.getAccept(req);
    const vid = utils.toBV(req.query.vid); // 将视频ID转换成BV号
    if (vid) { // 判断视频ID是否有效
      const json = await (await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${vid}`)).json();
      if (req.query.type === 'data') { // 获取视频数据
        let cid;
        if (json.code === 0 && json.data.pages) {
          if (/^\d+$/.test(req.query.cid)) {
            cid = json.data.pages.indexOf(parseInt(req.query.cid)) === -1 ? 0 : parseInt(req.query.cid);
          } else if (/^\d+$/.test(req.query.p)) {
            cid = json.data.pages[parseInt(req.query.p) - 1]?.cid;
          } else {
            cid = json.data.cid;
          }
        }
        if (cid) { // 视频有效
          const q = [6, 16, 32, 64];
          var u;
          const get = async n => {
            const vjson = await (await fetch(`https://api.bilibili.com/x/player/playurl?bvid=${vid}&cid=${cid}&qn=${q[n]}&fnval=${q[n] === 6 ? 1 : 0}&fnver=0`)).json();
            if (vjson.code === 0 && vjson.data.durl[0].size <= 5000000) { // 视频地址获取成功，且视频大小不超过5MB（1MB=1000KB；本API的服务商限制API发送的内容不能超过5MB）
              u = vjson.data.durl[0].url;
              if (n < q.length - 1) { // 视频还没有达到本API能获取到的最高分辨率
                get(n + 1); // 继续尝试获取更高分辨率的视频
                return;
              }
            }
            if (u) { // 当前分辨率的视频获取失败，或者已经达到最高分辨率了，但上一分辨率的视频获取成功
              const t = u.slice(0, u.indexOf('?'));
              const filename = URLEncode(`${json.data.title}.${t.slice(t.lastIndexOf('.') + 1)}`, 'UTF-8'); // 设置视频的文件名
              const resp = await fetch(u, {headers: {Referer: `https://www.bilibili.com/video/${vid}`, 'User-Agent': 'Mozilla/5.0 BiliDroid/6.71.0 (bbcallen@gmail.com)'}});
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
            } else { // 视频获取失败
              if (req.headers['sec-fetch-dest'] === 'video') {
                res.status(200).setHeader('Content-Type', 'video/mp4').send(file('../assets/error.mp4'));
              } else {
                res.status(500);
                sendHTML({title: '无法获取视频数据', content: `抱歉，由于您想要获取数据的视频无法下载（原因可能是视频太大，或者版权限制，等等），本 API 无法向您发送这个视频的数据哟 qwq<br />
      如果您想下载视频，最好使用其他工具哟 awa`, vid: req.query.vid});
              }
            }
          };
          get(0);
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
              let pagesHTML = '';
              json.data.pages && json.data.pages.forEach(p => pagesHTML += `<br />
      <strong>P${p.page} ${utils.encodeHTML(p.part)}</strong> ${utils.getTime(p.duration)}`);
              let staffHTML = '';
              if (json.data.rights.is_cooperation) {
                json.data.staff.forEach(u => staffHTML += `<br />
      <a class="no-underline" target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${u.mid}"><img class="uface" alt="" title="${utils.encodeHTML(u.name)} 的头像" src="${utils.toHTTPS(u.face)}" referrerpolicy="no-referrer" /> <strong>${utils.encodeHTML(u.name)}</strong></a> ${utils.encodeHTML(u.title)} ${utils.getNumber(u.follower)} 粉丝`);
              }
              sendHTML({title: `视频 ${utils.encodeHTML(json.data.title)} 的信息`, style: `
      body {
        -webkit-backdrop-filter: blur(20px);
        backdrop-filter: blur(20px);
        background: url("${utils.toHTTPS(json.data.pic)}") center/cover no-repeat fixed #fff;
        transition: background 0.5s 0.5s;
      }
      header, main {
        background: #ffffff80;
      }
      @media (prefers-color-scheme: dark) {
        body {
          -webkit-backdrop-filter: blur(20px) brightness(0.5);
          backdrop-filter: blur(20px) brightness(0.5);
          background-color: #222;
        }
        header, main {
          background: #22222280;
        }
      }
    `, content: `<a class="no-underline" target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/video/${vid}"><img class="vpic" alt="" title="${utils.encodeHTML(json.data.title)} 的封面" src="${utils.toHTTPS(json.data.pic)}" referrerpolicy="no-referrer" /> <strong>${utils.encodeHTML(json.data.title)}</strong></a>${json.data.forward ? ` 已与 <a href="/api/getvideo?vid=${utils.tobv(json.data.forward)}">${utils.tobv(json.data.forward)}</a> 撞车` : ''}<br />
      ${json.data.videos}P ${utils.getTime(json.data.duration)} ${json.data.copyright === 1 ? '自制' : '转载'}${json.data.rights.no_reprint ? '（未经作者授权，禁止转载）' : ''}<br />
      <strong>分区：</strong>${utils.encodeHTML(json.data.tname)}<br />
      <s><strong>投稿时间：</strong>${utils.getDate(json.data.ctime)}（可能不准确）</s><br />
      <strong>发布时间：</strong>${utils.getDate(json.data.pubdate)}${pagesHTML}
      <table>
        <thead>
          <tr><th>播放量</th><th>弹幕数</th><th>评论数</th><th>点赞数</th><th>投币数</th><th>收藏数</th><th>分享数</th></tr>
        </thead>
        <tbody>
          <tr><td>${utils.getNumber(json.data.stat.view)}</td><td>${utils.getNumber(json.data.stat.danmaku)}</td><td>${utils.getNumber(json.data.stat.reply)}</td><td>${utils.getNumber(json.data.stat.like)}</td><td>${utils.getNumber(json.data.stat.coin)}</td><td>${utils.getNumber(json.data.stat.favorite)}</td><td>${utils.getNumber(json.data.stat.share)}</td></tr>
        </tbody>
      </table>
      ${json.data.rights.is_cooperation ? `<strong>合作成员：</strong>${staffHTML}` : `<strong>UP 主：</strong><a class="no-underline" target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${json.data.owner.mid}"><img class="uface" alt="" title="${utils.encodeHTML(json.data.owner.name)} 的头像" src="${utils.toHTTPS(json.data.owner.face)}" referrerpolicy="no-referrer" /> <strong>${utils.encodeHTML(json.data.owner.name)}</strong></a>`}<br />
      <strong>简介：</strong><br />
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
              const filename = URLEncode(`${json.data.title} 的封面.${a[a.length - 1]}`, 'UTF-8'); // 设置封面的文件名
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
    } else { // 视频ID无效
      if (accept === 1) { // 客户端想要获取类型为“文档”的数据，返回HTML
        if (!req.query.vid) { // 没有设置参数“vid”
          res.status(200);
          sendHTML({title: '获取哔哩哔哩视频信息及数据', content: `本 API 可以获取指定 B 站视频的信息及数据。<br />
      用法：${process.env.URL}/api/getvideo?vid=<mark>您想获取信息的视频的 AV 或 BV 号</mark><br />
      更多用法见<a target="_blank" rel="noopener external nofollow noreferrer" href="https://github.com/${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}/blob/${process.env.VERCEL_GIT_COMMIT_REF}/api/getvideo.mjs">本 API 源码</a>。`, vid: ''});
        } else { // 设置了“vid”参数但无效
          res.status(400);
          sendHTML({title: '视频 ID 无效', content: `您输入的 AV 或 BV 号无效！<br />
      请输入一个正确的 AV 或 BV 号吧 awa`, vid: ''});
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
