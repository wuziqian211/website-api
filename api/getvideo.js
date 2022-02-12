/* 获取哔哩哔哩视频信息（尚未完成）
 * https://api.wuziqian211.top/api/getvideo
 * 本API主要的目的是，帮助那些想得到B站API的数据，却因为一些安全原因而无法获取数据的网站与程序等。
 * 如果您的网站、程序等能正常调用B站API，最好直接使用B站API，会更快一些。
 * 请求参数（区分大小写）：
 *   vid：您想获取视频信息的AV或BV号。
 *   cid：该视频分P的cid。
 *   p：该视频的第几个分P。
 *   video：如果存在本参数，则无论如何总是返回视频数据。
 *   其中，“cid”与“p”只能填写其中一个或者不填。
 * 返回类型：
 *   如果请求参数中包含“video”这个项，则无论如何，本API总是返回视频数据。
 *   否则，本API会检测HTTP请求头中“accept”的值：
 *     如果“accept”的值包含“html”（比如浏览器直接访问本API页面），则返回HTML数据；
 *     如果包含“image”（比如在<img>标签的“src”参数填写本API网址），且填写了有效的“id”参数，就返回对应视频的封面；
 *     否则，返回json。
 * 响应代码：
 *   200：视频存在
 *   404：视频不存在
 *   429（注意不是412）：请求太频繁，已被B站的API拦截
 *   400：参数无效，或者因其他原因请求失败
 * 作者：wuziqian211
 *   https://wuziqian211.top/
 *   https://space.bilibili.com/425503913
 */
const fetch = require('node-fetch');
const {readFileSync} = require('fs');
const {join} = require('path');
const file = fileName => readFileSync(join(__dirname, '..', fileName));
const toHTTPS = url => {
  let u = url.split(':');
  u[0] = 'https'; // 将协议改成HTTPS
  return u.join(':');
};
const getTime = ts => {
  let t = new Date(ts * 1000);
  let d = new Date(t.getTime() + (t.getTimezoneOffset() + 480) * 60000);
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日 ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
};
const toAV = vid => {
  if (typeof vid !== 'string') return;
  if (vid.length === 12 && vid.slice(0, 2) === 'BV' && vid[2] === '1' && vid[5] === '4' && vid[7] === '1' && vid[9] === '7' && /^[1-9A-HJ-NP-Za-km-z]+$/.test(vid.slice(2))) { // 判断参数值是否是BV号
    // BV号转AV号，改编自www.zhihu.com/question/381784377/answer/1099438784
    const tr = {f: 0, Z: 1, o: 2, d: 3, R: 4, "9": 5, X: 6, Q: 7, D: 8, S: 9, U: 10, m: 11, "2": 12, "1": 13, y: 14, C: 15, k: 16, r: 17, "6": 18, z: 19, B: 20, q: 21, i: 22, v: 23, e: 24, Y: 25, a: 26, h: 27, "8": 28, b: 29, t: 30, "4": 31, x: 32, s: 33, W: 34, p: 35, H: 36, n: 37, J: 38, E: 39, "7": 40, j: 41, L: 42, "5": 43, V: 44, G: 45, "3": 46, g: 47, u: 48, M: 49, T: 50, K: 51, N: 52, P: 53, A: 54, w: 55, c: 56, F: 57};
    let av = 0;
    for (let i = 0; i < 6; i++) {
      av += tr[vid[[11, 10, 3, 8, 4, 6][i]]] * 58 ** i;
    }
    return (av - 8728348608) ^ 177451812;
  }
  if (vid.slice(0, 2) === 'av' || vid.slice(0, 2) === 'AV') { // 判断参数值的开头是否是“av”或“AV”
    return /^\d+$/.test(vid.slice(2)) ? vid.slice(2) : undefined;
  } else {
    return /^\d+$/.test(vid) ? vid : undefined;
  }
};
const HTML = require('../assets/html');
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
  const vid = toAV(req.query.vid); // 将视频ID转换成AV号
  if (vid != undefined) { // 判断视频ID是否有效
    if (req.query.video == undefined) { // 获取视频信息
      fetch(`https://api.bilibili.com/x/web-interface/view?aid=${vid}`).then(resp => resp.json()).then(json => {
/*
        if ((req.headers.accept && req.headers.accept.indexOf('html') !== -1) || req.headers['x-pjax'] === 'true') { // 客户端提供的接受类型含HTML，或者是Pjax发出的请求，返回HTML
*/
          switch (json.code) {
            case 0:
              res.status(200);
              sendHTML({title: `视频 ${json.data.title} 的信息`, face: ')', content: `<a class="noul" target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/video/av${vid}"><img class="vpic" alt="${json.data.title} 的封面" src="${toHTTPS(json.data.pic)}" referrerpolicy="no-referrer" /> ${json.data.title}</a><br />${json.data.videos}P&emsp;共 ${json.data.duration} 秒&emsp;${json.data.copyright === 1 ? '自制' : '转载'}<br />投稿时间：${getTime(json.data.ctime)}<br />发布时间：${getTime(json.data.pubdate)}<br />简介：${json.data.desc}`, vid: vid, tips: 'OK'});
              break;
            case -412:
              res.status(429).setHeader('Retry-After', '600');
              sendHTML({title: '操作太频繁', face: '(', content: '您的请求过于频繁，已被 B 站拦截 qwq<br />请稍后重试 awa', vid: vid, tips: 'REQUEST_TOO_FAST'});
              break;
            case -404:
              res.status(404);
              sendHTML({title: '视频不存在', face: '(', content: '您想要获取信息的视频不存在！QAQ', vid: vid, tips: 'NOT_FOUND'});
              break;
            default:
              res.status(400);
              sendHTML({title: '获取视频信息失败', face: '(', content: `获取视频信息失败，请稍后重试 awa`, vid: vid, tips: 'BAD_REQUEST'});
          }
/* 尚未完成
        } else if (req.headers.accept && req.headers.accept.indexOf('image') !== -1) { // 客户端提供的接受类型含图片（不含HTML），获取封面
          if (json.code === 0) {
            if (req.query.allow_redirect != undefined) { // 允许本API重定向到B站服务器的头像地址
              res.status(307).setHeader('Location', toHTTPS(json.data.face)).json({code: 307, data: {url: toHTTPS(json.data.face)}});
            } else {
              fetch(toHTTPS(json.data.face)).then(resp => { // 获取B站服务器的头像
                const a = toHTTPS(json.data.face).split('.');
                const filename = URLEncode(`${json.data.name} 的头像.${a[a.length - 1]}`, 'UTF-8'); // 设置头像的文件名
                if (resp.status === 200) {
                  res.status(200).setHeader('Content-Type', resp.headers.get('Content-Type')).setHeader('Content-Disposition', `inline;filename=${filename}`);
                  return resp.buffer();
                } else {
                  res.status(404).setHeader('Content-Type', 'image/jpeg').setHeader('Content-Disposition', `inline;filename=${filename}`);
                  return file('assets/noface.jpg');
                }
              }).then(buffer => res.send(buffer));
            }
          } else { // 用户信息获取失败，返回默认头像
            res.status(404).setHeader('Content-Type', 'image/jpeg').setHeader('Content-Disposition', 'inline;filename=%E7%94%A8%E6%88%B7%E4%B8%8D%E5%AD%98%E5%9C%A8.jpg').send(file('assets/noface.jpg')); // 用户不存在.jpg
          }
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
        }
*/
      });
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
/*
    } else if (req.headers.accept && req.headers.accept.indexOf('image') !== -1) { // 客户端提供的接受类型有图片（不含HTML），获取封面
      res.status(400).setHeader('Content-Type', 'image/jpeg').send(file(`assets/${faces[Math.floor(Math.random() * 11)]}.jpg`));
*/
    } else { // 接受类型既不含HTML，也不含图片，返回json
      res.status(400).json({code: -400});
    }
  }
};
