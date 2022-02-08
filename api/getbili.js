/* 获取哔哩哔哩用户信息及其关注、粉丝数
 * https://api.wuziqian211.top/api/getbili
 * 本API主要的目的是，帮助那些想得到B站API的数据，却因为一些安全原因而无法获取数据的网站与程序等。
 * 如果您的网站、程序等能正常调用B站API，最好直接使用B站API。
 * 提示：
 *   本API会检测请求头中“accept”的值，以返回不同类型的数据。
 *   如果“accept”的值包含“html”（比如浏览器直接访问本API页面），则返回HTML数据。
 *   如果包含“image”（比如在<img>标签的“src”参数填写本API网址），且填写了参数“mid”，就返回对应用户的头像数据；如果未填写参数，就返回随机头像。
 *   否则，返回json。
 * 参数：
 *   mid：您想获取用户信息及关注、粉丝数的用户的UID。
 *   allow_redirect：如果包含本参数，则获取头像数据时可能会重定向到B站服务器的头像地址。
 *   type：当本参数的值为“info”时只返回用户信息，当值为“follow”时只返回用户关注、粉丝数，否则都返回。
 * 作者：wuziqian211
 *   https://wuziqian211.top/
 *   https://space.bilibili.com/425503913
 */
const fetch = require('node-fetch');
const {readFileSync} = require('fs');
const {join} = require('path');
const file = fileName => readFileSync(join(__dirname, '..', fileName));
const URLEncode = require('urlencode');
const HTML = require('../assets/html');
module.exports = (req, res) => {
  const sendHTML = data => res.status(data.status).send(HTML({title: data.title, data: `
      <span class="face animate__animated animate__fadeIn animate__faster">:${data.face}</span>
      <p class="content animate__animated animate__fadeIn animate__faster">${data.content}</p>
      <form class="animate__animated animate__fadeIn animate__faster" action="/api/getbili" method="GET">
        <div>
          <label for="mid">请输入您想要获取信息及关注、粉丝数的用户的 UID：</label>
        </div>
        <div>
          <input type="number" name="mid" id="mid" value="${data.mid}" min="1" max="9223372036854775807" autocomplete="off" />
          <input type="submit" value="获取" />
        </div>
      </form>
      <p class="home animate__animated animate__fadeIn animate__faster"><a href="/">返回 API 首页</a></p>
      <span class="tips animate__animated animate__fadeIn animate__faster">${data.tips}</span>`})); // 将HTML数据发送到客户端
  if (/^[0-9]+$/.test(req.query.mid)) { // 判断UID是否是非负整数
    if (req.query.type === 'follow') { // 仅获取用户关注、粉丝数
      fetch(`https://api.bilibili.com/x/relation/stat?vmid=${req.query.mid}`).then(resp => resp.json()).then(fjson => {
        if ((req.headers.accept && req.headers.accept.indexOf('html') !== -1) || req.headers['x-pjax'] === 'true') { // 客户端提供的接受类型含HTML，或者是Pjax发出的请求，返回HTML
          switch (fjson.code) {
            case 0:
              sendHTML({status: 200, title: `UID${req.query.mid} 的关注、粉丝数`, face: ')', content: `关注数：${fjson.data.following}<br />粉丝数：${fjson.data.follower}`, mid: req.query.mid, tips: 'OK'});
              break;
            case -412:
              sendHTML({status: 412, title: '操作太频繁', face: '(', content: '您的请求过于频繁，已被 B 站拦截qwq<br />请稍后重试awa', mid: req.query.mid, tips: 'REQUEST_TOO_FAST'});
              break;
            case -404:
              sendHTML({status: 404, title: '用户不存在', face: '(', content: `UID${req.query.mid} 对应的用户不存在！QAQ`, mid: req.query.mid, tips: 'NOT_FOUND'});
              break;
            default:
              sendHTML({status: 400, title: '获取用户关注、粉丝数失败', face: '(', content: `获取 UID${req.query.mid} 的关注、粉丝数失败，请稍后重试awa`, mid: req.query.mid, tips: 'BAD_REQUEST'});
          }
        } else { // 接受类型不含HTML，返回json
          switch (fjson.code) {
            case 0:
              res.status(200).json({code: 0, data: {following: fjson.data.following, follower: fjson.data.follower}});
              break;
            case -412:
              res.status(412).json({code: -412});
              break;
            case -404:
              res.status(404).json({code: -404});
              break;
            default:
              res.status(400).json({code: fjson.code});
          }
        }
      });
    } else { // 不是仅获取关注、粉丝数
      fetch(`https://api.bilibili.com/x/space/acc/info?mid=${req.query.mid}`).then(resp => resp.json()).then(json => {
        if ((req.headers.accept && req.headers.accept.indexOf('html') !== -1) || req.headers['x-pjax'] === 'true') { // 客户端提供的接受类型含HTML，或者是Pjax发出的请求，返回HTML
          switch (json.code) {
            case 0:
              let t = json.data.face.split(':');
              t[0] = 'https'; // 将头像地址的协议改成HTTPS
              const c = `<a target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${req.query.mid}" style="text-decoration: none;"><img class="uface" alt="${json.data.name} 的头像" src="${t.join(':')}" referrerpolicy="no-referrer" /> ${json.data.name}</a> <a target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/blackboard/help.html#/?qid=59e2cffdaa69465486497bb35a5ac295" style="text-decoration: none;"><img class="ulevel" alt="Lv${json.data.level}" src="/assets/level_${json.data.level}.svg" /></a>`;
              if (req.query.type === 'info') { // 仅获取用户信息
                sendHTML({status: 200, title: `${json.data.name} 的用户信息`, face: ')', content: c, mid: req.query.mid, tips: 'OK'});
              } else {
                fetch(`https://api.bilibili.com/x/relation/stat?vmid=${req.query.mid}`).then(resp => resp.json()).then(fjson => {
                  if (fjson.code === 0) {
                    sendHTML({status: 200, title: `${json.data.name} 的用户信息及关注、粉丝数`, face: ')', content: c + `<br />关注数：${fjson.data.following}<br />粉丝数：${fjson.data.follower}`, mid: req.query.mid, tips: 'OK'});
                  } else {
                    sendHTML({status: 200, title: `${json.data.name} 的用户信息`, face: ')', content: c, mid: req.query.mid, tips: 'OK'});
                  }
                });
              }
              break;
            case -412:
              sendHTML({status: 412, title: '操作太频繁', face: '(', content: '您的请求过于频繁，已被 B 站拦截qwq<br />请稍后重试awa', mid: req.query.mid, tips: 'REQUEST_TOO_FAST'});
              break;
            case -404:
              sendHTML({status: 404, title: '用户不存在', face: '(', content: `UID${req.query.mid} 对应的用户不存在！QAQ`, mid: req.query.mid, tips: 'NOT_FOUND'});
              break;
            default:
              sendHTML({status: 400, title: '获取用户信息失败', face: '(', content: `获取 UID${req.query.mid} 的信息失败，请稍后重试awa`, mid: req.query.mid, tips: 'BAD_REQUEST'});
          }
        } else if (req.headers.accept && req.headers.accept.indexOf('image') !== -1) { // 客户端提供的接受类型含图片（不含HTML），获取头像
          if (json.code === 0) {
            let t = json.data.face.split(':');
            t[0] = 'https'; // 将头像地址的协议改成HTTPS
            if (req.query.allow_redirect != undefined) { // 允许本API重定向到B站服务器的头像地址
              res.status(307).setHeader('Location', t.join(':')).setHeader('Refresh', `0; url=${t.join(':')}`).json({code: 307, data: {url: t.join(':')}});
            } else {
              fetch(t.join(':')).then(resp => { // 获取B站服务器的头像
                const a = t.join(':').split('.');
                const filename = URLEncode(`${json.data.name} 的头像.${a[a.length - 1]}`, 'UTF-8'); // 设置头像的文件名
                res.status(resp.status).setHeader('Content-Type', resp.headers.get('Content-Type')).setHeader('Content-Disposition', `inline;filename=${filename}`);
                return resp.buffer();
              }).then(buffer => res.send(buffer));
            }
          } else { // 用户信息获取失败，返回默认头像
            res.status(404).setHeader('Content-Type', 'image/jpeg').setHeader('Content-Disposition', 'inline;filename=%E7%94%A8%E6%88%B7%E4%B8%8D%E5%AD%98%E5%9C%A8.jpg').send(file('assets/noface.jpg')); // 用户不存在.jpg
          }
        } else { // 接受类型既不含HTML，也不含图片，返回json
          switch (json.code) {
            case 0:
              let t = json.data.face.split(':');
              t[0] = 'https'; // 将头像地址的协议改成HTTPS
              if (req.query.type === 'info') { // 仅获取用户信息
                res.status(200).json({code: 0, data: {name: json.data.name, sex: json.data.sex, face: t.join(':'), level: json.data.level}});
              } else {
                fetch(`https://api.bilibili.com/x/relation/stat?vmid=${req.query.mid}`).then(resp => resp.json()).then(fjson => {
                  if (fjson.code === 0) {
                    res.status(200).json({code: 0, data: {name: json.data.name, sex: json.data.sex, face: t.join(':'), level: json.data.level, following: fjson.data.following, follower: fjson.data.follower}});
                  } else {
                    res.status(200).json({code: 0, data: {name: json.data.name, sex: json.data.sex, face: t.join(':'), level: json.data.level}});
                  }
                });
              }
              break;
            case -412:
              res.status(412).json({code: -412});
              break;
            case -404:
              res.status(404).json({code: -404});
              break;
            default:
              res.status(400).json({code: json.code});
          }
        }
      });
    }
  } else { // UID无效
    if ((req.headers.accept && req.headers.accept.indexOf('html') !== -1) || req.headers['x-pjax'] === 'true') { // 客户端提供的接受类型有HTML，或者是Pjax发出的请求，返回HTML
      if (!req.query.mid) { // 没有设置UID参数
        sendHTML({status: 200, title: '获取哔哩哔哩用户信息及关注、粉丝数', face: ')', content: `本 API 可以获取指定 B 站用户的信息及其关注、粉丝数。<br />用法：${process.env.URL}/api/getbili?mid={您想获取信息及关注、粉丝数的用户的 UID}<br />更多用法见<a target="_blank" rel="noopener external nofollow noreferrer" href="https://github.com/${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}/blob/${process.env.VERCEL_GIT_COMMIT_REF}/api/getbili.js">本 API 源码</a>。`, mid: '', tips: 'OK'});
      } else { // 设置了UID参数但无效
        sendHTML({status: 400, title: 'UID 无效', face: '(', content: '您输入的 UID 无效！<br />请输入一个正确的 UID 吧awa', mid: '', tips: 'BAD_REQUEST'});
      }
    } else if (req.headers.accept && req.headers.accept.indexOf('image') !== -1) { // 客户端提供的接受类型有图片（不含HTML），获取头像
      if (!req.query.mid) { // 没有设置UID参数，返回随机头像
        const faces = ['1-22', '1-33', '2-22', '2-33', '3-22', '3-33', '4-22', '4-33', '5-22', '5-33', '6-33'];
        res.status(200).setHeader('Content-Type', 'image/jpeg').send(file(`assets/${faces[Math.floor(Math.random() * 11)]}.jpg`));
      } else { // 设置了UID参数但无效，返回默认头像
        res.status(400).setHeader('Content-Type', 'image/jpeg').send(file('assets/noface.jpg'));      
      }
    } else { // 接受类型既不含HTML，也不含图片，返回json
      res.status(400).json({code: -400});
    }
  }
};
