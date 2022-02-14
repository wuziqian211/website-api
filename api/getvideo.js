/* 获取哔哩哔哩视频信息（尚未完成）
 *   https://api.wuziqian211.top/api/getvideo
 * 本API允许任何合法来源的网站与程序等调用，但本网站不会存储任何日志、视频信息与视频数据，仅转发B站服务器的返回内容。
 * 特别注意：请勿将本API用于非法用途！
 * 如果您的网站、程序等能正常调用B站的API，最好直接使用B站的API，会更快一些。
 * 请求参数（区分大小写）：
 *   vid：您想获取视频信息的AV或BV号。
 *   cid：该视频分P的cid。
 *   p：该视频的第几个分P。
 *   allow_redirect：如果存在本参数，则获取封面或视频数据时可能会重定向到B站服务器的地址。
 *   video：如果存在本参数，则无论如何总是返回视频数据。
 *   其中，“cid”与“p”只能在获取视频数据时填写，且只能填写其中一个，如果不填，默认为P1。
 * 返回类型：
 *   如果请求参数中包含“video”这个项，则无论如何，本API总是返回视频数据。
 *   否则，本API会检测HTTP请求头中“accept”的值：
 *     如果“accept”的值包含“html”（比如浏览器直接访问本API页面），则返回HTML数据；
 *     如果包含“image”（比如在<img>标签的“src”参数填写本API网址），且填写了有效的“id”参数，就返回对应视频的封面；
 *     否则，返回json。
 * 响应代码：
 *   200：视频存在
 *   404：视频不存在
 *   403：视频需登录才能获取信息
 *   429（注意不是412）：请求太频繁，已被B站的API拦截
 *   400：参数无效，或者因其他原因请求失败
 *   307：临时重定向
 * 作者：wuziqian211
 *   https://wuziqian211.top/
 *   https://space.bilibili.com/425503913
 */
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
const toBV = vid => {
  if (typeof vid !== 'string') return;
  if ((vid.slice(0, 2) === 'av' || vid.slice(0, 2) === 'AV') && /^\d+$/.test(vid.slice(2))) { // 判断参数值开头是否为“av”或“AV”且剩余部分为数字
    var av = parseInt(vid.slice(2));
  } else if (/^\d+$/.test(vid)) { // 判断参数值是否为数字
    var av = parseInt(vid);
  } else if (vid.length === 12 && (vid.slice(0, 2) === 'BV' || vid.slice(0, 2) === 'bv') && vid[2] === '1' && vid[5] === '4' && vid[7] === '1' && vid[9] === '7' && /^[1-9A-HJ-NP-Za-km-z]+$/.test(vid.slice(2))) { // 判断参数值是否为BV号
    return 'BV' + vid.slice(2); // 直接返回
  } else {
    return;
  }
  // AV号转BV号，改编自zhihu.com/question/381784377/answer/1099438784
  const table = 'fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF';
  const t = (av ^ 177451812) + 8728348608;
  let bv = ['B', 'V', '1', , ,'4', , '1', , '7', , ,];
  for (let i = 0; i < 6; i++) {
    bv[[11, 10, 3, 8, 4, 6][i]] = table[Math.floor(t / (58 ** i)) % 58];
  }
  return bv.join('');
};
const HTML = require('../assets/html');
const encodeHTML = str => typeof str === 'string' ? str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\n/g, '<br />') : '';
module.exports = (req, res) => {
  const sendHTML = data => res.send(HTML({title: data.title, data: `
      <span class="face animate__animated animate__fadeIn animate__faster">:${data.face}</span>
      <p class="content animate__animated animate__fadeIn animate__faster">${data.content}</p>
      <form class="animate__animated animate__fadeIn animate__faster" action="/api/getvideo" method="GET">
        <div>
          <label for="vid">请输入您想要获取信息的视频的 AV 或 BV 号：</label>
        </div>
        <div>
          <input type="text" name="vid" id="vid" value="${data.vid}" maxlength="12" autocomplete="off" />
          <input type="submit" value="获取" />
        </div>
      </form>
      <p class="home animate__animated animate__fadeIn animate__faster"><a href="/api/">返回 API 首页</a></p>
      <span class="tips animate__animated animate__fadeIn animate__faster">${data.tips}</span>`})); // 将HTML数据发送到客户端
  const vid = toBV(req.query.vid); // 将视频ID转换成BV号
  if (vid) { // 判断视频ID是否有效
    if (req.query.video == undefined) { // 获取视频信息
      fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${vid}`).then(resp => resp.json()).then(json => {
        if ((req.headers.accept && req.headers.accept.indexOf('html') !== -1) || req.headers['x-pjax'] === 'true') { // 客户端提供的接受类型含HTML，或者是Pjax发出的请求，返回HTML
          switch (json.code) {
            case 0:
              res.status(200);
              if (json.data.rights.is_cooperation) {
                let staffHTML = '';
                json.data.staff.forEach(u => staffHTML += `        <a class="noul" target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${u.mid}"><img class="uface" alt="${u.name} 的头像" src="${toHTTPS(u.face)}" referrerpolicy="no-referrer" /> ${u.name}</a>&emsp;${u.title}<br />
`)
              }
              sendHTML({title: `视频 ${encodeHTML(json.data.title)} 的信息`, face: ')', content: `
        <a class="noul" target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/video/${vid}"><img class="vpic" alt="${encodeHTML(json.data.title)} 的封面" src="${toHTTPS(json.data.pic)}" referrerpolicy="no-referrer" /> ${encodeHTML(json.data.title)}</a><br />
        ${json.data.videos}P&emsp;${getTime(json.data.duration)}&emsp;${json.data.copyright === 1 ? '自制' : '转载'}${json.data.rights.no_reprint ? '（未经作者授权，禁止转载）' : ''}
      </p>
      <div class="table animate__animated animate__fadeIn animate__faster">
        <table>
          <thead>
            <tr><th>播放量</th><th>弹幕数</th><th>评论数</th><th>点赞数</th><th>投币数</th><th>收藏数</th><th>分享数</th></tr>
          </thead>
          <tbody>
            <tr><td>${json.data.stat.view}</td><td>${json.data.stat.danmaku}</td><td>${json.data.stat.reply}</td><td>${json.data.stat.like}</td><td>${json.data.stat.coin}</td><td>${json.data.stat.favorite}</td><td>${json.data.stat.share}</td></tr>
          </tbody>
        </table>
      </div>
      <p class="content animate__animated animate__fadeIn animate__faster">
        ${json.data.rights.is_cooperation ? `合作成员信息：<br />
${staffHTML}` : `UP主：<a class="noul" target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${json.data.owner.mid}"><img class="uface" alt="${json.data.owner.name} 的头像" src="${toHTTPS(json.data.owner.face)}" referrerpolicy="no-referrer" /> ${json.data.owner.name}</a><br />
        `}<s>投稿时间：${getDate(json.data.ctime)}（可能不准确）</s><br />
        发布时间：${getDate(json.data.pubdate)}<br />
        简介：<br />
        ${encodeHTML(json.data.desc)}
      `, vid: req.query.vid, tips: 'OK'});
              break;
            case -412:
              res.status(429).setHeader('Retry-After', '600');
              sendHTML({title: '操作太频繁', face: '(', content: '您的请求过于频繁，已被 B 站拦截 qwq<br />请稍后重试 awa', vid: req.query.vid, tips: 'REQUEST_TOO_FAST'});
              break;
            case -404:
            case 62002:
              res.status(404);
              sendHTML({title: '视频不存在', face: '(', content: '您想要获取信息的视频不存在！QAQ', vid: req.query.vid, tips: 'NOT_FOUND'});
              break;
            case -403:
              res.status(403);
              sendHTML({title: '获取视频信息需登录', face: '(', content: `这个视频需要登录才能获取信息！QwQ<br />您可以在 B 站获取<a target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/video/${vid}">这个视频的信息</a>哟 awa`, vid: req.query.vid, tips: 'FORBIDDEN'});
              break;
            default:
              res.status(400);
              sendHTML({title: '获取视频信息失败', face: '(', content: '获取视频信息失败，请稍后重试 awa', vid: req.query.vid, tips: 'BAD_REQUEST'});
          }
        } else if (req.headers.accept && req.headers.accept.indexOf('image') !== -1) { // 客户端提供的接受类型含图片（不含HTML），获取封面
          if (json.code === 0) {
            if (req.query.allow_redirect != undefined) { // 允许本API重定向到B站服务器的封面地址
              res.status(307).setHeader('Location', toHTTPS(json.data.pic)).json({code: 307, data: {url: toHTTPS(json.data.pic)}});
            } else {
              fetch(toHTTPS(json.data.pic)).then(resp => { // 获取B站服务器存储的封面
                const a = toHTTPS(json.data.pic).split('.');
                const filename = URLEncode(`${json.data.title} 的封面.${a[a.length - 1]}`, 'UTF-8'); // 设置头像的文件名
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
/* 尚未完成
        } else { // 接受类型既不含HTML，也不含图片，返回json
          switch (json.code) {
            case 0:
              if (req.query.type === 'info') { // 仅获取用户信息
                res.status(200).json({code: 0, data: {name: json.data.name, sex: json.data.sex, face: toHTTPS(json.data.face), level: json.data.level}});
              } else {
                fetch(`https://api.bilibili.com/x/relation/stat?vvid=${vid}`).then(resp => resp.json()).then(json => {
                  if (json.code === 0) {
                    res.status(200).json({code: 0, data: {name: json.data.name, sex: json.data.sex, face: toHTTPS(json.data.face), level: json.data.level, following: json.data.following, follower: json.data.follower}});
                  } else {
                    res.status(200).json({code: 0, data: {name: json.data.name, sex: json.data.sex, face: toHTTPS(json.data.face), level: json.data.level}});
                  }
                });
              }
              break;
            case -412:
              res.status(429).setHeader('Retry-After', '600').json({code: -412});
              break;
            case -404:
              res.status(404).json({code: -404});
              break;
            default:
              res.status(400).json({code: json.code});
          }
*/
        }
      });
/* 尚未完成
    } else { // 获取视频数据
      
*/
    }
  } else { // 视频ID无效
    if ((req.headers.accept && req.headers.accept.indexOf('html') !== -1) || req.headers['x-pjax'] === 'true') { // 客户端提供的接受类型有HTML，或者是Pjax发出的请求，返回HTML
      if (!req.query.vid) { // 没有设置参数“vid”
        res.status(200);
        sendHTML({title: '获取哔哩哔哩视频信息', face: ')', content: `本 API 可以获取指定 B 站视频的信息。<br />用法：${process.env.URL}/api/getvideo?vid={您想获取信息的视频的 AV 或 BV 号}<br />更多用法见<a target="_blank" rel="noopener external nofollow noreferrer" href="https://github.com/${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}/blob/${process.env.VERCEL_GIT_COMMIT_REF}/api/getvideo.js">本 API 源码</a>。`, vid: '', tips: 'OK'});
      } else { // 设置了“vid”参数但无效
        res.status(400);
        sendHTML({title: '视频 ID 无效', face: '(', content: '您输入的视频的 AV 或 BV 号无效！<br />请输入一个正确的 AV 或 BV 号吧 awa', vid: '', tips: 'BAD_REQUEST'});
      }
    } else if (req.headers.accept && req.headers.accept.indexOf('image') !== -1) { // 客户端提供的接受类型有图片（不含HTML），返回默认封面
      res.status(400).setHeader('Content-Type', 'image/png').send(file('assets/nopic.png'));
    } else { // 接受类型既不含HTML，也不含图片，返回json
      res.status(400).json({code: -400});
    }
  }
};
