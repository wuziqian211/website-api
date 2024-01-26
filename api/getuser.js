/* 获取哔哩哔哩用户信息
 *   https://api.yumeharu.top/api/getuser
 * 使用说明见 https://github.com/wuziqian211/website-api/blob/main/README.md#%E8%8E%B7%E5%8F%96%E5%93%94%E5%93%A9%E5%93%94%E5%93%A9%E7%94%A8%E6%88%B7%E4%BF%A1%E6%81%AF。
 * 作者：wuziqian211（https://www.yumeharu.top/）
 */

import fs from 'node:fs/promises';
import utils from '../assets/utils.js';

export default async (req, res) => {
  let { startTime, accept } = utils.initialize(req), // 获取 API 开始执行时间与客户端接受响应的类型
    responseType = accept, responseAttributes = [];
  if (req.query.type?.toUpperCase() === 'JSON') {
    responseType = 0;
  } else if (['HTML', 'PAGE'].includes(req.query.type?.toUpperCase())) {
    responseType = 1;
  } else {
    const splitString = req.query.type?.toUpperCase().split('_');
    if (['IMAGE', 'FACE', 'AVATAR'].includes(splitString?.[0])) {
      responseType = 2;
      splitString.shift(); // 删除第一个元素
      responseAttributes = splitString;
    }
  }
  
  try {
    const sendHTML = data => utils.sendHTML(res, startTime, { ...data, desc: '获取哔哩哔哩用户信息', body: `
      ${data.content}
      <form>
        <div><label for="mid">请输入您想要获取信息的用户的 UID：</label></div>
        <div><input type="number" name="mid" id="mid" value="${data.mid}" min="1" max="9223372036854775807" autocomplete="off" /> <input type="submit" value="获取" /></div>
      </form>` }); // 发送 HTML 响应到客户端
    const sendJSON = data => utils.sendJSON(res, startTime, data); // 发送 JSON 数据到客户端
    
    if (/^\d+$/.test(req.query.mid) && parseInt(req.query.mid) > 0) { // 判断 UID 是否是正整数
      const headers = { Cookie: `SESSDATA=${process.env.SESSDATA}; bili_jct=${process.env.bili_jct}`, Origin: 'https://space.bilibili.com', Referer: `https://space.bilibili.com/${req.query.mid}`, 'User-Agent': process.env.userAgent }, mid = parseInt(req.query.mid);
      
      let json;
      const cjson = await (await fetch(`https://account.bilibili.com/api/member/getCardByMid?mid=${mid}`, { headers })).json();
      if (cjson.code === 0) {
        json = { code: 0, message: cjson.message, data: { face_nft: null, face_nft_type: null, jointime: 0, moral: 0, fans_badge: null, fans_medal: null, vip: null, nameplate: null, user_honour_info: null, is_followed: false, top_photo: null, theme: null, sys_notice: null, live_room: null, school: null, profession: null, tags: null, series: null, is_senior_member: null, mcn_info: null, is_risk: null, elec: null, contract: null, ...cjson.card, mid: parseInt(cjson.card.mid), rank: parseInt(cjson.card.rank), birthday: new Date(`${cjson.card.birthday}T00:00:00+08:00`).getTime() / 1000, level: cjson.card.level_info.current_level, silence: cjson.card.spacesta === -2 ? 1 : 0, official: { role: null, title: cjson.card.official_verify.desc, desc: '', type: cjson.card.official_verify.type }, following: cjson.card.attention, follower: cjson.card.fans } };
        const ujson = await (await fetch(`https://api.bilibili.com/x/space/wbi/acc/info?${await utils.encodeWbi({ mid })}`, { headers })).json(); // （备用）获取多用户信息：https://api.vc.bilibili.com/account/v1/user/cards?uids=(...),(...),……（最多 50 个用户）
        if (ujson.code === 0) {
          json.message = ujson.message, json.data = { ...json.data, ...ujson.data, coins: cjson.card.coins, birthday: new Date(`${cjson.card.birthday}T00:00:00+08:00`).getTime() / 1000 };
        }
      } else {
        json = cjson;
      }
      
      if (responseType === 1) { // 回复 HTML
        switch (json.code) {
          case 0:
            const content = `
              <img style="display: none;" src="${json.data.top_photo ? utils.toHTTPS(json.data.top_photo) : '/assets/top-photo.png'}" referrerpolicy="no-referrer" />
              <div class="info">
                <div class="wrap${json.data.pendant?.image ? ' has-frame' : ''}">
                  <a target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${mid}">
                    <img class="face" alt title="${utils.encodeHTML(json.data.name)}" src="${utils.toHTTPS(json.data.face)}" referrerpolicy="no-referrer" />
                    ${json.data.pendant?.pid ? `<img class="face-frame" alt title="${utils.encodeHTML(json.data.pendant.name)}" src="${utils.toHTTPS(json.data.pendant.image_enhance || json.data.pendant.image)}" referrerpolicy="no-referrer" />` : ''}
                    ${json.data.face_nft ? `<img class="face-icon icon-face-nft${[0, 1].includes(json.data.official.type) || json.data.vip?.status ? ' second' : ''}" alt title="数字藏品" />` : ''}
                    ${json.data.official.type === 0 ? '<img class="face-icon icon-personal" alt title="UP 主认证" />' : json.data.official.type === 1 ? '<img class="face-icon icon-business" alt title="机构认证" />' : json.data.vip?.status ? '<img class="face-icon icon-big-vip" alt title="大会员" />' : ''}
                  </a>
                </div>
                <div>
                  <a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${mid}">${utils.encodeHTML(json.data.name)}</a>
                  ${json.data.sex === '男' ? '<img class="sex" alt="男" title="男" src="/assets/male.png" />' : json.data.sex === '女' ? '<img class="sex" alt="女" title="女" src="/assets/female.png" />' : ''}
                  <a class="no-underline" target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/blackboard/help.html#/?qid=59e2cffdaa69465486497bb35a5ac295"><img class="level" alt="Lv${json.data.is_senior_member ? '6⚡' : json.data.level}" title="${json.data.is_senior_member ? '6+' : json.data.level} 级" src="/assets/level_${json.data.is_senior_member ? '6%2B' : json.data.level}.svg" /></a>
                  ${json.data.spacesta === -10 ? '<span class="description">（账号已注销）</span>' : ''}
                  <br />
                  ${[0, 1].includes(json.data.official.type) ? `<img class="official-icon icon-${json.data.official.type === 0 ? 'personal" alt title="UP 主认证" /> <strong class="text-personal">bilibili UP 主' : 'business" alt title="机构认证" /> <strong class="text-business">bilibili 机构'}认证：</strong>${utils.encodeHTML(json.data.official.title)}${json.data.official.desc ? `<span class="description">（${utils.encodeHTML(json.data.official.desc)}）` : ''}</span><br />` : ''}
                  ${json.data.silence ? '<span class="notice"><img class="notice-icon" alt /> 该账号封禁中</span><br />' : ''}
                  ${json.data.sys_notice?.content ? `<${json.data.sys_notice.url ? `a class="notice" target="_blank" rel="noopener external nofollow noreferrer" href="${json.data.sys_notice.url}"` : 'span class="notice"'} style="${json.data.sys_notice.bg_color ? `background: ${json.data.sys_notice.bg_color};` : ''}${json.data.sys_notice.text_color ? `color: ${json.data.sys_notice.text_color};` : ''}"><img class="notice-icon" alt src="${utils.toHTTPS(json.data.sys_notice.icon)}" referrerpolicy="no-referrer" /> ${json.data.sys_notice.content}</${json.data.sys_notice.url ? 'a' : 'span'}>` : ''}
                </div>
              </div>
              <strong>生日：</strong>${json.data.birthday ? utils.getDate(json.data.birthday).slice(0, 10) : '保密'}<br />
              <strong>注册时间：</strong>${utils.getDate(json.data.regtime)}<br />
              <strong>关注数：</strong>${utils.getNumber(json.data.following)}<br />
              <strong>粉丝数：</strong>${utils.getNumber(json.data.follower)}<br />
              <strong>个性签名：</strong><br />
              ${utils.markText(utils.encodeHTML(json.data.sign))}`;
            res.status(200);
            sendHTML({ title: `${json.data.name} 的信息`, appleTouchIcon: utils.toHTTPS(json.data.face), style: utils.renderExtraStyle(json.data.top_photo ? utils.toHTTPS(json.data.top_photo) : '/assets/top-photo.png'), content, mid: req.query.mid });
            break;
          case -352: // 风控校验失败（请求标头不合法）
          case -401: // 非法访问
          case -403: // 访问权限不足（wbi 参数不合法）
          case -412: // 请求被拦截
          case -799: // 请求过于频繁，请稍后再试（URL 非 wbi）
            res.status(429).setHeader('Retry-After', '600');
            sendHTML({ title: '请求被拦截', content: '抱歉，本 API 的请求已被 B 站拦截，请等一段时间后重试 awa', mid: req.query.mid });
            break;
          case -404: // 啥都木有
          case -626: // 用户不存在
            res.status(404);
            sendHTML({ title: '用户不存在', content: `UID${mid} 对应的用户不存在！QAQ`, mid: req.query.mid });
            break;
          default:
            res.status(400);
            sendHTML({ title: '获取用户信息失败', content: `获取 UID${mid} 的信息失败，请稍后重试 awa`, mid: req.query.mid });
        }
      } else if (responseType === 2) { // 回复头像数据
        if (json.code === 0) {
          if (responseAttributes.includes('REDIRECT') || req.query.allow_redirect != undefined) { // 允许本 API 重定向到 B 站服务器的头像地址
            utils.redirect(res, startTime, utils.toHTTPS(json.data.face), 307);
          } else {
            const filename = encodeURIComponent(`${json.data.name} 的头像.${new URL(json.data.face).pathname.split('.').at(-1)}`); // 设置头像的文件名
            const resp = await fetch(utils.toHTTPS(json.data.face)); // 获取 B 站服务器存储的头像
            if (resp.ok) {
              res.status(200).setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate').setHeader('Content-Type', resp.headers.get('Content-Type')).setHeader('Content-Disposition', `inline; filename=${filename}`);
              utils.send(res, startTime, Buffer.from(await resp.arrayBuffer()));
            } else {
              res.status(404);
              if (responseAttributes.includes('ERRORWHENFAILED') && accept !== 2) {
                if (accept === 1) {
                  sendHTML({ title: `获取 ${json.data.name} 的头像数据失败`, content: `获取 ${utils.encodeHTML(json.data.name)} 的头像数据失败，请稍后重试 awa`, mid: req.query.mid });
                } else {
                  sendJSON({ code: -404, message: '啥都木有', data: null });
                }
              } else {
                res.setHeader('Content-Type', 'image/jpeg');
                utils.send(res, startTime, await fs.readFile('./assets/noface.jpg'));
              }
            }
          }
        } else { // 用户信息获取失败，回复默认头像
          res.status(404);
          if (responseAttributes.includes('ERRORWHENFAILED') && accept !== 2) {
            if (accept === 1) {
              sendHTML({ title: `获取 UID${mid} 的头像数据失败`, content: `获取 UID${mid} 的头像数据失败，请稍后重试 awa`, mid: req.query.mid });
            } else {
              sendJSON({ code: -404, message: '啥都木有', data: null });
            }
          } else {
            res.setHeader('Content-Type', 'image/jpeg');
            utils.send(res, startTime, await fs.readFile('./assets/noface.jpg'));
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
          case -403:
          case -412:
          case -799:
            res.status(429).setHeader('Retry-After', '600');
            sendJSON({ code: json.code, message: json.message, data: null });
            break;
          case -404:
          case -626:
            res.status(404);
            sendJSON({ code: -404, message: json.message, data: null });
            break;
          default:
            res.status(400);
            sendJSON({ code: json.code, message: json.message, data: null });
        }
      }
    } else { // UID 无效
      if (responseType === 1) { // 回复 HTML
        if (!req.query.mid) { // 没有设置 UID 参数
          res.status(200);
          sendHTML({ title: '获取哔哩哔哩用户信息', content: `
            本 API 可以获取指定 B 站用户的信息。<br />
            基本用法：https://${req.headers.host}/api/getuser?mid=<span class="notice">您想获取信息的用户的 UID</span><br />
            更多用法见<a target="_blank" rel="noopener external nofollow noreferrer" href="https://github.com/${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}/blob/${process.env.VERCEL_GIT_COMMIT_REF}/README.md#%E8%8E%B7%E5%8F%96%E5%93%94%E5%93%A9%E5%93%94%E5%93%A9%E7%94%A8%E6%88%B7%E4%BF%A1%E6%81%AF">本站的使用说明</a>。`, mid: '' });
        } else { // 设置了 UID 参数但无效
          res.status(400);
          sendHTML({ title: 'UID 无效', content: `
            您输入的 UID 无效！<br />
            请输入一个正确的 UID 吧 awa`, mid: '' });
        }
      } else if (responseType === 2) { // 回复头像数据
        if (!req.query.mid) { // 没有设置 UID 参数，回复随机头像
          const faces = ['1-22', '1-33', '2-22', '2-33', '3-22', '3-33', '4-22', '4-33', '5-22', '5-33', '6-33'];
          res.status(200).setHeader('Content-Type', 'image/jpeg');
          utils.send(res, startTime, await fs.readFile(`./assets/${faces[Math.floor(Math.random() * 11)]}.jpg`));
        } else { // 设置了 UID 参数但无效，回复默认头像
          res.status(400);
          if (responseAttributes.includes('ERRORWHENFAILED') && accept !== 2) {
            if (accept === 1) {
              sendHTML({ title: 'UID 无效', content: `
                您输入的 UID 无效！<br />
                请输入一个正确的 UID 吧 awa`, mid: '' });
            } else {
              sendJSON({ code: -400, message: '请求错误', data: null });
            }
          } else {
            res.setHeader('Content-Type', 'image/jpeg');
            utils.send(res, startTime, await fs.readFile('./assets/noface.jpg'));
          }
        }
      } else { // 回复 JSON
        res.status(400);
        sendJSON({ code: -400, message: '请求错误', data: null });
      }
    }
  } catch (e) {
    utils.send500(accept, res, startTime, e);
  }
};
