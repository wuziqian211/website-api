/* 获取哔哩哔哩用户信息及关注、粉丝数
 *   https://api.wuziqian211.top/api/getuser
 * 使用说明见https://github.com/wuziqian211/website-api/blob/main/README.md#user-content-apigetuserjs。
 * 作者：wuziqian211（https://wuziqian211.top/）
 */
'use strict';
import fetch from 'node-fetch';
import URLEncode from 'urlencode';
import {readFileSync} from 'fs';
import * as utils from '../assets/utils.js';
const file = fileName => readFileSync(new URL(fileName, import.meta.url));
export default async (req, res) => {
  const startTime = Date.now();
  try {
    const sendHTML = data => res.setHeader('Content-Type', 'text/html; charset=utf-8').send(utils.renderHTML({startTime, title: data.title, style: data.style, desc: '获取哔哩哔哩用户信息及关注、粉丝数', body: `
      ${data.content}
      <form>
        <div>
          <label for="mid">请输入您想要获取信息及关注、粉丝数的用户的 UID：</label>
        </div>
        <div>
          <input type="number" name="mid" id="mid" value="${data.mid}" min="1" max="9223372036854775807" autocomplete="off" />
          <input type="submit" value="获取" />
        </div>
      </form>
    `})); // 将HTML数据发送到客户端
    const accept = utils.getAccept(req);
    if (/^\d+$/.test(req.query.mid)) { // 判断UID是否是非负整数
      if (req.query.type === 'follow') { // 仅获取用户关注、粉丝数
        const fjson = await (await fetch(`https://api.bilibili.com/x/relation/stat?vmid=${req.query.mid}`)).json();
        if (accept === 1) { // 客户端想要获取类型为“文档”的数据，返回HTML
          switch (fjson.code) {
            case 0:
              res.status(200);
              sendHTML({title: `UID${req.query.mid} 的关注、粉丝数`, content: `<strong>关注数：</strong>${utils.getNumber(fjson.data.following)}<br />
      <strong>粉丝数：</strong>${utils.getNumber(fjson.data.follower)}`, mid: req.query.mid});
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
        } else { // 否则，返回JSON
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
        if (accept === 1) { // 客户端想要获取类型为“文档”的数据，返回HTML
          switch (json.code) {
            case 0:
              res.status(200);
              const style = `
      body {
        -webkit-backdrop-filter: blur(20px);
        backdrop-filter: blur(20px);
        background: url("${utils.toHTTPS(json.data.top_photo)}") center/cover no-repeat fixed #fff;
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
    `;
              const content = `<img style="display: none;" src="${utils.toHTTPS(json.data.top_photo)}" referrerpolicy="no-referrer" />
      <a class="no-underline" target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${req.query.mid}"><img class="uface" alt="" title="${utils.encodeHTML(json.data.name)}" src="${utils.toHTTPS(json.data.face)}" referrerpolicy="no-referrer" /> <strong>${utils.encodeHTML(json.data.name)}</strong></a>${json.data.sex === '男' ? ' <img class="usex" alt="男" title="男" src="/assets/male.png" />' : json.data.sex === '女' ? ' <img class="usex" alt="女" title="女" src="/assets/female.png" />' : ''} <a class="no-underline" target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/blackboard/help.html#/?qid=59e2cffdaa69465486497bb35a5ac295"><img class="ulevel" alt="Lv${json.data.is_senior_member ? '6⚡' : json.data.level}" title="${json.data.is_senior_member ? '6+' : json.data.level} 级" src="/assets/level_${json.data.is_senior_member ? '6+' : json.data.level}.svg" /></a>${json.data.silence ? ' 已被封禁' : ''}<br />
      <strong>个性签名：</strong><br />
      ${utils.encodeHTML(json.data.sign)}`;
              if (req.query.type === 'info') { // 仅获取用户信息
                sendHTML({title: `${utils.encodeHTML(json.data.name)} 的信息`, style, content, mid: req.query.mid});
              } else {
                const fjson = await (await fetch(`https://api.bilibili.com/x/relation/stat?vmid=${req.query.mid}`)).json();
                if (fjson.code === 0) {
                  sendHTML({title: `${utils.encodeHTML(json.data.name)} 的信息及关注、粉丝数`, style, content: content + `<br />
      <strong>关注数：</strong>${utils.getNumber(fjson.data.following)}<br />
      <strong>粉丝数：</strong>${utils.getNumber(fjson.data.follower)}`, mid: req.query.mid});
                } else {
                  sendHTML({title: `${utils.encodeHTML(json.data.name)} 的信息`, style, content, mid: req.query.mid});
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
        } else if (accept === 2) { // 客户端想要获取类型为“图片”的数据，获取头像
          if (json.code === 0) {
            if (req.query.allow_redirect != undefined) { // 允许本API重定向到B站服务器的头像地址
              res.status(307).setHeader('Location', utils.toHTTPS(json.data.face)).json({code: 307, data: {url: utils.toHTTPS(json.data.face)}});
            } else {
              const a = utils.toHTTPS(json.data.face).split('.');
              const filename = URLEncode(`${json.data.name} 的头像.${a[a.length - 1]}`, 'UTF-8'); // 设置头像的文件名
              const resp = await fetch(utils.toHTTPS(json.data.face)); // 获取B站服务器存储的头像
              if (resp.ok) {
                res.status(200).setHeader('Content-Type', resp.headers.get('Content-Type')).setHeader('Content-Disposition', `inline; filename=${filename}`).send(Buffer.from(await resp.arrayBuffer()));
              } else {
                res.status(404).setHeader('Content-Type', 'image/jpeg').send(file('../assets/noface.jpg'));
              }
            }
          } else { // 用户信息获取失败，返回默认头像
            res.status(404).setHeader('Content-Type', 'image/jpeg').send(file('../assets/noface.jpg'));
          }
        } else { // 否则，返回JSON
          switch (json.code) {
            case 0:
              if (req.query.type === 'info') { // 仅获取用户信息
                res.status(200).json({code: 0, data: json.data});
              } else {
                const fjson = await (await fetch(`https://api.bilibili.com/x/relation/stat?vmid=${req.query.mid}`)).json();
                if (fjson.code === 0) {
                  res.status(200).json({code: 0, data: {...json.data, following: fjson.data.following, follower: fjson.data.follower}});
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
      if (accept === 1) { // 客户端想要获取类型为“文档”的数据，返回HTML
        if (!req.query.mid) { // 没有设置UID参数
          res.status(200);
          sendHTML({title: '获取哔哩哔哩用户信息及关注、粉丝数', content: `本 API 可以获取指定 B 站用户的信息及关注、粉丝数。<br />
      基本用法：${process.env.URL}/api/getuser?mid=<mark>您想获取信息及关注、粉丝数的用户的 UID</mark><br />
      更多用法见<a target="_blank" rel="noopener external nofollow noreferrer" href="https://github.com/${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}/blob/${process.env.VERCEL_GIT_COMMIT_REF}/README.md#user-content-apigetuserjs">本站的使用说明</a>。`, mid: ''});
        } else { // 设置了UID参数但无效
          res.status(400);
          sendHTML({title: 'UID 无效', content: `您输入的 UID 无效！<br />
      请输入一个正确的 UID 吧 awa`, mid: ''});
        }
      } else if (accept === 2) { // 客户端想要获取类型为“图片”的数据，获取头像
        if (!req.query.mid) { // 没有设置UID参数，返回随机头像
          const faces = ['1-22', '1-33', '2-22', '2-33', '3-22', '3-33', '4-22', '4-33', '5-22', '5-33', '6-33'];
          res.status(200).setHeader('Content-Type', 'image/jpeg').send(file(`../assets/${faces[Math.floor(Math.random() * 11)]}.jpg`));
        } else { // 设置了UID参数但无效，返回默认头像
          res.status(400).setHeader('Content-Type', 'image/jpeg').send(file('../assets/noface.jpg'));
        }
      } else { // 否则，返回JSON
        res.status(400).json({code: -400, message: '请求错误'});
      }
    }
  } catch (e) {
    console.error(e);
    res.status(500).send(utils.render500(startTime));
  }
};
