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
 *     如果“accept”的值包含“html”，或者“sec-fetch-dest”的值为“document”（比如浏览器直接访问本API页面），则返回HTML数据；
 *     如果“accept”的值包含“image”，或者“sec-fetch-dest”的值为“image”（比如在<img>标签的“src”参数填写本API网址），而且填写了有效的“vid”参数，则返回对应视频的封面；
 *     否则，返回json。
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
const fetch = require('node-fetch');
const {readFileSync} = require('fs');
const {join} = require('path');
const file = fileName => readFileSync(join(__dirname, '..', fileName));
const URLEncode = require('urlencode');
const toHTTPS = url => {
  let u = url.split(':');
  u[0] = 'https'; // 将协议改成HTTPS
  return u.join(':');
};
const getDate = ts => {
  let t = new Date(ts * 1000);
  let d = new Date(t.getTime() + (t.getTimezoneOffset() + 480) * 60000);
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
};
const getTime = s => typeof s === 'number' ? `${s >= 3600 ? `${Math.floor(s / 3600)}:` : ''}${Math.floor(s % 3600 / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}` : '';
const getNumber = n => typeof n === 'number' ? n >= 100000000 ? `${n / 100000000} 亿` : n >= 10000 ? `${n / 10000} 万` : `${n}` : '';
const tobv = aid => { // AV号转BV号，改编自https://www.zhihu.com/question/381784377/answer/1099438784
  const table = 'fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF';
  const t = (aid ^ 177451812) + 8728348608;
  let bvid = ['B', 'V', '1', , ,'4', , '1', , '7', , , ];
  for (let i = 0; i < 6; i++) {
    bvid[[11, 10, 3, 8, 4, 6][i]] = table[Math.floor(t / (58 ** i)) % 58];
  }
  return bvid.join('');
};
const toBV = vid => {
  if (typeof vid !== 'string') return;
  if ((vid.slice(0, 2) === 'av' || vid.slice(0, 2) === 'AV') && /^\d+$/.test(vid.slice(2))) { // 判断参数值开头是否为“av”或“AV”且剩余部分为数字
    return tobv(parseInt(vid.slice(2)));
  } else if (/^\d+$/.test(vid)) { // 判断参数值是否为数字
    return tobv(parseInt(vid));
  } else if (vid.length === 12 && (vid.slice(0, 2) === 'BV' || vid.slice(0, 2) === 'bv') && vid[2] === '1' && vid[5] === '4' && vid[7] === '1' && vid[9] === '7' && /^[1-9A-HJ-NP-Za-km-z]+$/.test(vid.slice(2))) { // 判断参数值是否为BV号
    return 'BV' + vid.slice(2); // 直接返回
  }
};
const HTML = require('../assets/html');
const encodeHTML = str => typeof str === 'string' ? str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\n/g, '<br />') : '';
module.exports = (req, res) => {
  const st = Date.now();
  const sendHTML = data => res.send(HTML(st, {title: data.title, style: data.style, body: `
      ${data.content}
      <form action="/api/getvideo" method="get">
        <div>
          <label for="vid">请输入您想要获取信息的视频的 AV 或 BV 号：</label>
        </div>
        <div>2
          <input type="text" name="vid" id="vid" value="${data.vid}" placeholder="av…/BV…" pattern="^[0-9A-HJ-NP-Za-km-z]+$" maxlength="12" autocomplete="off" spellcheck="false" />
          <input type="submit" value="获取" />
        </div>
      </form>
    `})); // 将HTML数据发送到客户端
  const accept = req.headers.accept || '*/*';
  const vid = toBV(req.query.vid); // 将视频ID转换成BV号
  if (vid) { // 判断视频ID是否有效
    fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${vid}`).then(resp => resp.json()).then(json => {
      if (req.query.type === 'data') { // 获取视频数据
        if (json.code === 0 && json.data.pages) { // 视频有效
          var cid;
          if (/^\d+$/.test(req.query.cid)) {
            json.data.pages.forEach(p => parseInt(req.query.cid) === p.cid ? cid = parseInt(req.query.cid) : void 0);
          } else if (/^\d+$/.test(req.query.p)) {
            cid = json.data.pages[parseInt(req.query.p) - 1]?.cid;
          }
          cid = cid || json.data.cid;
          const q = [6, 16, 32, 64];
          var u;
          const get = n => {
            fetch(`https://api.bilibili.com/x/player/playurl?bvid=${vid}&cid=${cid}&qn=${q[n]}&fnval=${q[n] === 6 ? 1 : 0}&fnver=0`).then(resp => resp.json()).then(vjson => {
              if (vjson.code === 0 && vjson.data.durl[0].size <= 5000000) { // 视频地址获取成功，且视频大小不超过5MB（1MB=1000KB；本API的服务商限制API发送的内容不能超过5MB）
                u = vjson.data.durl[0].url;
                if (n < q.length - 1) { // 视频还没有达到本API能获取到的最高分辨率
                  get(n + 1); // 继续尝试获取更高分辨率的视频
                  return;
                }
              }
              if (u) { // 当前分辨率的视频获取失败，或者已经达到最高分辨率了，但上一分辨率的视频获取成功
                fetch(u, {headers: {Referer: `https://www.bilibili.com/video/${vid}`, 'User-Agent': 'Mozilla/5.0 BiliDroid/6.61.0 (bbcallen@gmail.com)'}}).then(resp => {
                  const t = u.slice(0, u.indexOf('?'));
                  const filename = URLEncode(`${json.data.title}.${t.slice(t.lastIndexOf('.') + 1)}`, 'UTF-8'); // 设置视频的文件名
                  if (resp.status === 200) {
                    res.status(200).setHeader('Content-Type', resp.headers.get('Content-Type')).setHeader('Content-Disposition', `inline;filename=${filename}`);
                    return resp.buffer();
                  } else {
                    res.status(req.headers['sec-fetch-dest'] === 'video' ? 200 : 404).setHeader('Content-Type', 'video/mp4');
                    return file('assets/error.mp4');
                  }
                }).then(buffer => res.send(buffer));
              } else { // 视频获取失败
                res.status(500);
                sendHTML({title: '视频太大', content: `抱歉，由于您想要获取数据的视频太大，本 API 无法向您发送那么大的数据哟 qwq<br />
      如想下载视频，请使用其他工具哟 awa`, vid: req.query.vid});
              }
            });
          };
          get(0);
        } else { // 视频无效
          res.status(req.headers['sec-fetch-dest'] === 'video' ? 200 : 404).setHeader('Content-Type', 'video/mp4').send(file('assets/error.mp4'));
        }
      } else { // 获取视频信息
        if (accept.indexOf('html') !== -1 || req.headers['sec-fetch-dest'] === 'document' || req.headers['x-pjax'] === 'true') { // 客户端提供的接受类型含HTML，或者是Pjax发出的请求，返回HTML
          switch (json.code) {
            case 0:
              res.status(200);
              let pagesHTML = '';
              json.data.pages && json.data.pages.forEach(p => pagesHTML += `<br />
      <strong>P${p.page}&emsp;${encodeHTML(p.part)}</strong>&emsp;${getTime(p.duration)}`);
              if (json.data.rights.is_cooperation) {
                var staffHTML = '';
                json.data.staff.forEach(u => staffHTML += `<br />
      <a class="noul" target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${u.mid}"><img class="uface" alt="" title="${u.name} 的头像" src="${toHTTPS(u.face)}" referrerpolicy="no-referrer" /> <strong>${u.name}</strong></a>&emsp;${u.title}&emsp;${getNumber(u.follower)} 粉丝`);
              }
              sendHTML({title: `视频 ${encodeHTML(json.data.title)} 的信息`, style: `
      body {
        background: url("${toHTTPS(json.data.pic)}") no-repeat center/cover fixed #FFF;
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
      }
      header {
        background-color: rgba(238, 238, 238, 0.5);
      }
      main {
        background-color: rgba(255, 255, 255, 0.5);
      }
      @media (prefers-color-scheme: dark) {
        body {
          background-color: #222;
          backdrop-filter: blur(20px) brightness(0.5);
          -webkit-backdrop-filter: blur(20px) brightness(0.5);
        }
        header {
          background-color: rgba(51, 51, 51, 0.5);
        }
        main {
          background-color: rgba(34, 34, 34, 0.5);
        }
      }
    `, content: `<a class="noul" target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/video/${vid}"><img class="vpic" alt="" title="${encodeHTML(json.data.title)} 的封面" src="${toHTTPS(json.data.pic)}" referrerpolicy="no-referrer" /> <strong>${encodeHTML(json.data.title)}</strong></a>${json.data.forward ? `&emsp;已与 <a href="/api/getvideo?vid=${tobv(json.data.forward)}">${tobv(json.data.forward)}</a> 撞车` : ''}<br />
      ${json.data.videos}P&emsp;${getTime(json.data.duration)}&emsp;${json.data.copyright === 1 ? '自制' : '转载'}${json.data.rights.no_reprint ? '（未经作者授权，禁止转载）' : ''}<br />
      <strong>分区：</strong>${json.data.tname}<br />
      <s><strong>投稿时间：</strong>${getDate(json.data.ctime)}（可能不准确）</s><br />
      <strong>发布时间：</strong>${getDate(json.data.pubdate)}${pagesHTML}
      <div class="table">
        <table>
          <thead>
            <tr><th>播放量</th><th>弹幕数</th><th>评论数</th><th>点赞数</th><th>投币数</th><th>收藏数</th><th>分享数</th></tr>
          </thead>
          <tbody>
            <tr><td>${getNumber(json.data.stat.view)}</td><td>${getNumber(json.data.stat.danmaku)}</td><td>${getNumber(json.data.stat.reply)}</td><td>${getNumber(json.data.stat.like)}</td><td>${getNumber(json.data.stat.coin)}</td><td>${getNumber(json.data.stat.favorite)}</td><td>${getNumber(json.data.stat.share)}</td></tr>
          </tbody>
        </table>
      </div>
      ${json.data.rights.is_cooperation ? `<strong>合作成员：</strong>${staffHTML}` : `<strong>UP 主：</strong><a class="noul" target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${json.data.owner.mid}"><img class="uface" alt="" title="${json.data.owner.name} 的头像" src="${toHTTPS(json.data.owner.face)}" referrerpolicy="no-referrer" /> <strong>${json.data.owner.name}</strong></a>`}<br />
      <strong>简介：</strong><br />
      ${encodeHTML(json.data.desc)}`, vid: req.query.vid});
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
        } else if (accept.indexOf('image') !== -1 || req.headers['sec-fetch-dest'] === 'image') { // 客户端提供的接受类型含图片（不含HTML），获取封面
          if (json.code === 0) {
            if (req.query.allow_redirect != undefined) { // 允许本API重定向到B站服务器的封面地址
              res.status(307).setHeader('Location', toHTTPS(json.data.pic)).json({code: 307, data: {url: toHTTPS(json.data.pic)}});
            } else {
              fetch(toHTTPS(json.data.pic)).then(resp => { // 获取B站服务器存储的封面
                const a = toHTTPS(json.data.pic).split('.');
                const filename = URLEncode(`${json.data.title} 的封面.${a[a.length - 1]}`, 'UTF-8'); // 设置封面的文件名
                if (resp.status === 200) {
                  res.status(200).setHeader('Content-Type', resp.headers.get('Content-Type')).setHeader('Content-Disposition', `inline;filename=${filename}`);
                  return resp.buffer();
                } else {
                  res.status(404).setHeader('Content-Type', 'image/png').setHeader('Content-Disposition', `inline;filename=${filename}`);
                  return file('assets/nopic.png');
                }
              }).then(buffer => res.send(buffer));
            }
          } else { // 视频信息获取失败，返回默认封面
            res.status(404).setHeader('Content-Type', 'image/png').setHeader('Content-Disposition', 'inline;filename=%E8%A7%86%E9%A2%91%E4%B8%8D%E5%AD%98%E5%9C%A8.png').send(file('assets/nopic.png')); // 视频不存在.png
          }
        } else { // 接受类型既不含HTML，也不含图片，返回json
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
    });
  } else { // 视频ID无效
    if (req.query.type === 'data') {
      res.status(req.headers['sec-fetch-dest'] === 'video' ? 200 : 400).setHeader('Content-Type', 'video/mp4').send(file('assets/error.mp4'));
    } else {
      if (accept.indexOf('html') !== -1 || req.headers['sec-fetch-dest'] === 'document' || req.headers['x-pjax'] === 'true') { // 客户端提供的接受类型有HTML，或者是Pjax发出的请求，返回HTML
        if (!req.query.vid) { // 没有设置参数“vid”
          res.status(200);
          sendHTML({title: '获取哔哩哔哩视频信息及数据', content: `本 API 可以获取指定 B 站视频的信息及数据。<br />
      用法：${process.env.URL}/api/getvideo?vid=<mark>您想获取信息的视频的 AV 或 BV 号</mark><br />
      更多用法见<a target="_blank" rel="noopener external nofollow noreferrer" href="https://github.com/${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}/blob/${process.env.VERCEL_GIT_COMMIT_REF}/api/getvideo.js">本 API 源码</a>。`, vid: ''});
        } else { // 设置了“vid”参数但无效
          res.status(400);
          sendHTML({title: '视频 ID 无效', content: `您输入的 AV 或 BV 号无效！<br />
      请输入一个正确的 AV 或 BV 号吧 awa`, vid: ''});
        }
      } else if (accept.indexOf('image') !== -1 || req.headers['sec-fetch-dest'] === 'image') { // 客户端提供的接受类型有图片（不含HTML），返回默认封面
        res.status(400).setHeader('Content-Type', 'image/png').send(file('assets/nopic.png'));
      } else { // 接受类型既不含HTML，也不含图片，返回json
        res.status(400).json({code: -400, message: '请求错误'});
      }
    }
  }
};
