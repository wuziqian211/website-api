/* 获取哔哩哔哩用户信息及关注、粉丝数
 *   https://api.wuziqian211.top/api/getuser
 * 本API允许任何合法网站与程序等调用，但本站不会存储任何访问记录，用户的信息及关注、粉丝数等，仅转发与处理B站API的返回数据。
 * 特别注意：请勿将本API用于非法用途！
 * 如果您的网站、程序等能正常调用B站的API，最好直接使用B站的API，会更快一些。
 * 请求参数（区分大小写）：
 *   mid：您想获取用户信息及关注、粉丝数的用户的UID。
 *   allow_redirect：如果存在本参数，则获取头像数据时可能会重定向到B站服务器的头像地址。
 *   type：如果本参数的值为“info”，只返回用户信息；如果值为“follow”，只返回用户关注、粉丝数；否则都返回。
 * 返回类型：
 *   本API会根据HTTP请求头中“accept”与“sec-fetch-dest”的值，返回不同类型的数据。
 *   如果“accept”的值包含“html”，或者“sec-fetch-dest”的值为“document”（比如浏览器直接访问本API页面），则返回HTML数据。
 *   如果“accept”的值包含“image”，或者“sec-fetch-dest”的值为“image”（比如在<img>标签的“src”参数填写本API网址），那么：如果填写了有效的“mid”参数，则返回对应用户的头像数据；如果未填写参数，则返回随机头像。
 *   否则，返回json。
 * 响应代码（填写参数时）：
 *   200：用户存在
 *   307（注意不是302）：临时重定向
 *   404：用户不存在
 *   429（注意不是412）：请求太频繁，已被B站的API拦截
 *   400：UID无效，或者因其他原因请求失败
 * 作者：wuziqian211
 *   https://wuziqian211.top/
 *   https://space.bilibili.com/425503913
 */
'use strict';
const fetch = require('node-fetch'), {readFileSync} = require('fs'), {join} = require('path'), URLEncode = require('urlencode'), HTML = require('../assets/html');
const file = fileName => readFileSync(join(__dirname, '..', fileName));
const toHTTPS = url => {
  let u = url.split(':');
  u[0] = 'https'; // 将协议改成HTTPS
  return u.join(':');
};
const getNumber = n => typeof n === 'number' ? n >= 100000000 ? `${n / 100000000} 亿` : n >= 10000 ? `${n / 10000} 万` : `${n}` : '';
const encodeHTML = str => typeof str === 'string' ? str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\n/g, '<br />') : '';
module.exports = async (req, res) => {
  const st = Date.now();
  const sendHTML = data => res.setHeader('Content-Type', 'text/html; charset=utf-8').send(HTML(st, {title: data.title, style: data.style, body: `
      ${data.content}
      <form action="/api/getuser" method="get">
        <div>
          <label for="mid">请输入您想要获取信息及关注、粉丝数的用户的 UID：</label>
        </div>
        <div>
          <input type="number" name="mid" id="mid" value="${data.mid}" min="1" max="9223372036854775807" autocomplete="off" />
          <input type="submit" value="获取" />
        </div>
      </form>
    `})); // 将HTML数据发送到客户端
  const accept = req.headers.accept || '*/*';
  if (/^\d+$/.test(req.query.mid)) { // 判断UID是否是非负整数
    if (req.query.type === 'follow') { // 仅获取用户关注、粉丝数
      const fjson = await (await fetch(`https://api.bilibili.com/x/relation/stat?vmid=${req.query.mid}`)).json();
      if (accept.indexOf('html') !== -1 || req.headers['sec-fetch-dest'] === 'document' || req.headers['x-pjax'] === 'true') { // 客户端提供的接受类型含HTML，或者是Pjax发出的请求，返回HTML
        switch (fjson.code) {
          case 0:
            res.status(200);
            sendHTML({title: `UID${req.query.mid} 的关注、粉丝数`, content: `<strong>关注数：</strong>${getNumber(fjson.data.following)}<br />
      <strong>粉丝数：</strong>${getNumber(fjson.data.follower)}`, mid: req.query.mid});
            break;
          case -412:
            res.status(429).setHeader('Retry-After', '600');
            sendHTML({title: '请求被拦截', content: '抱歉，本 API 的请求已被 B 站拦截，请等一段时间后重试 awa', mid: req.query.mid});
            break;
          case -404:
            res.status(404);
            sendHTML({title: '用户不存在', content: `UID${req.query.mid} 对应的用户不存在！QAQ`, mid: req.query.mid});
            break;
          default:
            res.status(400);
            sendHTML({title: '获取用户关注、粉丝数失败', content: `获取 UID${req.query.mid} 的关注、粉丝数失败，请稍后重试 awa`, mid: req.query.mid});
        }
      } else { // 接受类型不含HTML，返回json
        switch (fjson.code) {
          case 0:
            res.status(200).json({code: 0, data: {following: fjson.data.following, follower: fjson.data.follower}});
            break;
          case -412:
            res.status(429).setHeader('Retry-After', '600').json({code: -412});
            break;
          case -404:
            res.status(404).json({code: -404});
            break;
          default:
            res.status(400).json({code: fjson.code, message: fjson.message});
        }
      }
    } else { // 不是仅获取关注、粉丝数
      const json = await (await fetch(`https://api.bilibili.com/x/space/acc/info?mid=${req.query.mid}`)).json();
      if (accept.indexOf('html') !== -1 || req.headers['sec-fetch-dest'] === 'document' || req.headers['x-pjax'] === 'true') { // 客户端提供的接受类型含HTML，或者是Pjax发出的请求，返回HTML
        switch (json.code) {
          case 0:
            res.status(200);
            const s = `
      @supports (backdrop-filter: blur(20px)) or (-webkit-backdrop-filter: blur(20px)) {
        body {
          background: url("${toHTTPS(json.data.top_photo)}") no-repeat center/cover fixed #FFF;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        header {
          background: #EEEEEE80;
        }
        main {
          background: #FFFFFF80;
        }
        @media (prefers-color-scheme: dark) {
          body {
            background-color: #222;
            backdrop-filter: blur(20px) brightness(0.5);
            -webkit-backdrop-filter: blur(20px) brightness(0.5);
          }
          header {
            background: #33333380;
          }
          main {
            background: #22222280;
          }
        }
      }
    `;
            const c = `<img style="display: none;" src="${toHTTPS(json.data.top_photo)}" referrerpolicy="no-referrer" />
      <a class="noul" target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${req.query.mid}"><img class="uface" alt="" title="${json.data.name} 的头像" src="${toHTTPS(json.data.face)}" referrerpolicy="no-referrer" /> <strong>${json.data.name}</strong></a>${json.data.sex === '男' ? ' <img class="usex" alt="男" title="男" src="/assets/male.png" />' : json.data.sex === '女' ? ' <img class="usex" alt="女" title="女" src="/assets/female.png" />' : ''} <a class="noul" target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/blackboard/help.html#/?qid=59e2cffdaa69465486497bb35a5ac295"><img class="ulevel" alt="Lv${json.data.is_senior_member ? '6&#x26A1;' : json.data.level}" title="${json.data.is_senior_member ? '6+' : json.data.level} 级" src="/assets/level_${json.data.is_senior_member ? '6+' : json.data.level}.svg" /></a>${json.data.silence ? '&emsp;已被封禁' : ''}<br />
      <strong>个性签名：</strong><br />
      ${encodeHTML(json.data.sign)}`;
            if (req.query.type === 'info') { // 仅获取用户信息
              sendHTML({title: `${json.data.name} 的用户信息`, style: s, content: c, mid: req.query.mid});
            } else {
              const fjson = await (await fetch(`https://api.bilibili.com/x/relation/stat?vmid=${req.query.mid}`)).json();
              if (fjson.code === 0) {
                sendHTML({title: `用户 ${json.data.name} 的信息及关注、粉丝数`, style: s, content: c + `<br />
      <strong>关注数：</strong>${getNumber(fjson.data.following)}<br />
      <strong>粉丝数：</strong>${getNumber(fjson.data.follower)}`, mid: req.query.mid});
              } else {
                sendHTML({title: `用户 ${json.data.name} 的信息`, style: s, content: c, mid: req.query.mid});
              }
            }
            break;
          case -412:
            res.status(429).setHeader('Retry-After', '600');
            sendHTML({title: '请求被拦截', content: '抱歉，本 API 的请求已被 B 站拦截，请等一段时间后重试 awa', mid: req.query.mid});
            break;
          case -404:
            res.status(404);
            sendHTML({title: '用户不存在', content: `UID${req.query.mid} 对应的用户不存在！QAQ`, mid: req.query.mid});
            break;
          default:
            res.status(400);
            sendHTML({title: '获取用户信息失败', content: `获取 UID${req.query.mid} 的信息失败，请稍后重试 awa`, mid: req.query.mid});
        }
      } else if (accept.indexOf('image') !== -1 || req.headers['sec-fetch-dest'] === 'image') { // 客户端提供的接受类型含图片（不含HTML），获取头像
        if (json.code === 0) {
          if (req.query.allow_redirect != undefined) { // 允许本API重定向到B站服务器的头像地址
            res.status(307).setHeader('Location', toHTTPS(json.data.face)).json({code: 307, data: {url: toHTTPS(json.data.face)}});
          } else {
            const a = toHTTPS(json.data.face).split('.');
            const filename = URLEncode(`${json.data.name} 的头像.${a[a.length - 1]}`, 'UTF-8'); // 设置头像的文件名
            const resp = await fetch(toHTTPS(json.data.face)); // 获取B站服务器存储的头像
            if (resp.ok) {
              res.status(200).setHeader('Content-Type', resp.headers.get('Content-Type')).setHeader('Content-Disposition', `inline; filename=${filename}`).send(await resp.buffer());
            } else {
              res.status(404).setHeader('Content-Type', 'image/jpeg').send(file('assets/noface.jpg'));
            }
          }
        } else { // 用户信息获取失败，返回默认头像
          res.status(404).setHeader('Content-Type', 'image/jpeg').send(file('assets/noface.jpg'));
        }
      } else { // 接受类型既不含HTML，也不含图片，返回json
        switch (json.code) {
          case 0:
            if (req.query.type === 'info') { // 仅获取用户信息
              res.status(200).json({code: 0, data: json.data});
            } else {
              const fjson = await (await fetch(`https://api.bilibili.com/x/relation/stat?vmid=${req.query.mid}`)).json();
              if (fjson.code === 0) {
                res.status(200).json({code: 0, data: Object.assign(json.data, {following: fjson.data.following, follower: fjson.data.follower})});
              } else {
                res.status(200).json({code: 0, data: json.data});
              }
            }
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
  } else { // UID无效
    if (accept.indexOf('html') !== -1 || req.headers['sec-fetch-dest'] === 'document' || req.headers['x-pjax'] === 'true') { // 客户端提供的接受类型有HTML，或者是Pjax发出的请求，返回HTML
      if (!req.query.mid) { // 没有设置UID参数
        res.status(200);
        sendHTML({title: '获取哔哩哔哩用户信息及关注、粉丝数', content: `本 API 可以获取指定 B 站用户的信息及关注、粉丝数。<br />
      用法：${process.env.URL}/api/getuser?mid=<mark>您想获取信息及关注、粉丝数的用户的 UID</mark><br />
      更多用法见<a target="_blank" rel="noopener external nofollow noreferrer" href="https://github.com/${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}/blob/${process.env.VERCEL_GIT_COMMIT_REF}/api/getuser.js">本 API 源码</a>。`, mid: ''});
      } else { // 设置了UID参数但无效
        res.status(400);
        sendHTML({title: 'UID 无效', content: `您输入的 UID 无效！<br />
      请输入一个正确的 UID 吧 awa`, mid: ''});
      }
    } else if (accept.indexOf('image') !== -1 || req.headers['sec-fetch-dest'] === 'image') { // 客户端提供的接受类型有图片（不含HTML），获取头像
      if (!req.query.mid) { // 没有设置UID参数，返回随机头像
        const faces = ['1-22', '1-33', '2-22', '2-33', '3-22', '3-33', '4-22', '4-33', '5-22', '5-33', '6-33'];
        res.status(200).setHeader('Content-Type', 'image/jpeg').send(file(`assets/${faces[Math.floor(Math.random() * 11)]}.jpg`));
      } else { // 设置了UID参数但无效，返回默认头像
        res.status(400).setHeader('Content-Type', 'image/jpeg').send(file('assets/noface.jpg'));
      }
    } else { // 接受类型既不含HTML，也不含图片，返回json
      res.status(400).json({code: -400, message: '请求错误'});
    }
  }
};
