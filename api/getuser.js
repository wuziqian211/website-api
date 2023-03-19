/* 获取哔哩哔哩用户信息
 *   https://api.wuziqian211.top/api/getuser
 * 使用说明见https://github.com/wuziqian211/website-api/blob/main/README.md#%E8%8E%B7%E5%8F%96%E5%93%94%E5%93%A9%E5%93%94%E5%93%A9%E7%94%A8%E6%88%B7%E4%BF%A1%E6%81%AF。
 * 作者：wuziqian211（https://wuziqian211.top/）
 */
import { readFileSync } from 'node:fs';
import * as utils from '../assets/utils.js';
const file = fileName => readFileSync(new URL(fileName, import.meta.url));
export default async (req, res) => {
  const startTime = performance.now();
  try {
    const sendHTML = data => res.setHeader('Content-Type', 'text/html; charset=utf-8').send(utils.renderHTML({ ...data, startTime, desc: '获取哔哩哔哩用户信息', body: `
      ${data.content}
      <form>
        <div><label for="mid">请输入您想要获取信息的用户的 UID：</label></div>
        <div><input type="number" name="mid" id="mid" value="${data.mid}" min="1" max="9223372036854775807" autocomplete="off" /> <input type="submit" value="获取" /></div>
      </form>` })); // 将HTML数据发送到客户端
    const accept = utils.getAccept(req);
    if (/^\d+$/.test(req.query.mid)) { // 判断UID是否是非负整数
      const headers = { Origin: 'https://space.bilibili.com', Referer: `https://space.bilibili.com/${req.query.mid}`, 'User-Agent': process.env.userAgent };
      let json;
      const cjson = await (await fetch(`https://account.bilibili.com/api/member/getCardByMid?mid=${req.query.mid}`, { headers })).json();
      if (cjson.code === 0) {
        json = { code: 0, message: cjson.message, data: { face_nft: null, face_nft_type: null, jointime: 0, moral: 0, fans_badge: null, fans_medal: null, vip: null, nameplate: null, user_honour_info: null, is_followed: false, top_photo: null, theme: null, sys_notice: null, live_room: null, school: null, profession: null, tags: null, series: null, is_senior_member: null, mcn_info: null, is_risk: null, elec: null, contract: null, ...cjson.card, mid: parseInt(cjson.card.mid), rank: parseInt(cjson.card.rank), birthday: new Date(`${cjson.card.birthday}T00:00:00+08:00`).getTime() / 1000, level: cjson.card.level_info.current_level, silence: cjson.card.spacesta === -2 ? 1 : 0, official: { role: null, title: cjson.card.official_verify.desc, desc: '', type: cjson.card.official_verify.type }, following: cjson.card.attention, follower: cjson.card.fans } };
        const ujson = await (await fetch(`https://api.bilibili.com/x/space/acc/info?mid=${req.query.mid}`, { headers })).json(); // （备用）获取多用户信息https://api.vc.bilibili.com/account/v1/user/cards?uids=xxx,xxx,……（最多50个）
        if (ujson.code === 0) {
          json.data = { ...json.data, ...ujson.data, coins: cjson.card.coins, birthday: new Date(`${cjson.card.birthday}T00:00:00+08:00`).getTime() / 1000 };
        }
      } else {
        json = cjson;
      }
      if (accept === 1) { // 客户端想要获取类型为“文档”的数据，返回HTML
        switch (json.code) {
          case 0:
            const content = `
              <img style="display: none;" src="${json.data.top_photo ? utils.toHTTPS(json.data.top_photo) : '/assets/top-photo.png'}" referrerpolicy="no-referrer" />
              <div class="info">
                <div class="wrap${json.data.pendant?.image ? ' has-frame' : ''}">
                  <a target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${req.query.mid}">
                    <img class="face" alt title="${utils.encodeHTML(json.data.name)}" src="${utils.toHTTPS(json.data.face)}" referrerpolicy="no-referrer" />
                    ${json.data.pendant?.pid ? `<img class="face-frame" alt title="${utils.encodeHTML(json.data.pendant.name)}" src="${utils.toHTTPS(json.data.pendant.image_enhance || json.data.pendant.image)}" referrerpolicy="no-referrer" />` : ''}
                    ${json.data.face_nft ? `<img class="face-icon icon-face-nft${[0, 1].includes(json.data.official.type) || json.data.vip?.status ? ' second' : ''}" alt title="数字藏品" />` : ''}
                    ${json.data.official.type === 0 ? '<img class="face-icon icon-personal" alt title="UP 主认证" />' : json.data.official.type === 1 ? '<img class="face-icon icon-business" alt title="机构认证" />' : json.data.vip?.status ? '<img class="face-icon icon-big-vip" alt title="大会员" />' : ''}
                  </a>
                </div>
                <div>
                  <a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${req.query.mid}">${utils.encodeHTML(json.data.name)}</a>
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
              ${utils.encodeHTML(json.data.sign)}`;
            res.status(200);
            sendHTML({ title: `${utils.encodeHTML(json.data.name)} 的信息`, appleTouchIcon: utils.toHTTPS(json.data.face), style: utils.renderExtraStyle(json.data.top_photo ? utils.toHTTPS(json.data.top_photo) : '/assets/top-photo.png'), content, mid: req.query.mid });
            break;
          case -412:
            res.status(429).setHeader('Retry-After', '600');
            sendHTML({ title: '请求被拦截', content: '抱歉，本 API 的请求已被 B 站拦截，请等一段时间后重试 awa', mid: req.query.mid });
            break;
          case -404:
          case -626:
            res.status(404);
            sendHTML({ title: '用户不存在', content: `UID${req.query.mid} 对应的用户不存在！QAQ`, mid: req.query.mid });
            break;
          default:
            res.status(400);
            sendHTML({ title: '获取用户信息失败', content: `获取 UID${req.query.mid} 的信息失败，请稍后重试 awa`, mid: req.query.mid });
        }
      } else if (accept === 2) { // 客户端想要获取类型为“图片”的数据，获取头像
        if (json.code === 0) {
          if (req.query.allow_redirect != undefined) { // 允许本API重定向到B站服务器的头像地址
            res.status(307).setHeader('Location', utils.toHTTPS(json.data.face)).json({ code: 307, data: { url: utils.toHTTPS(json.data.face) } });
          } else {
            const filename = encodeURIComponent(`${json.data.name} 的头像.${utils.toHTTPS(json.data.face).split('.').at(-1)}`); // 设置头像的文件名
            const resp = await fetch(utils.toHTTPS(json.data.face)); // 获取B站服务器存储的头像
            if (resp.ok) {
              res.status(200).setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate').setHeader('Content-Type', resp.headers.get('Content-Type')).setHeader('Content-Disposition', `inline; filename=${filename}`).send(Buffer.from(await resp.arrayBuffer()));
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
            res.status(200).json({ code: 0, message: json.message, data: json.data });
            break;
          case -412:
            res.status(429).setHeader('Retry-After', '600').json({ code: -412, message: json.message });
            break;
          case -404:
          case -626:
            res.status(404).json({ code: -404, message: json.message });
            break;
          default:
            res.status(400).json({ code: json.code, message: json.message });
        }
      }
    } else { // UID无效
      if (accept === 1) { // 客户端想要获取类型为“文档”的数据，返回HTML
        if (!req.query.mid) { // 没有设置UID参数
          res.status(200);
          sendHTML({ title: '获取哔哩哔哩用户信息', content: `
            本 API 可以获取指定 B 站用户的信息。<br />
            基本用法：https://${req.headers.host}/api/getuser?mid=<span class="notice">您想获取信息的用户的 UID</span><br />
            更多用法见<a target="_blank" rel="noopener external nofollow noreferrer" href="https://github.com/${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}/blob/${process.env.VERCEL_GIT_COMMIT_REF}/README.md#%E8%8E%B7%E5%8F%96%E5%93%94%E5%93%A9%E5%93%94%E5%93%A9%E7%94%A8%E6%88%B7%E4%BF%A1%E6%81%AF">本站的使用说明</a>。`, mid: '' });
        } else { // 设置了UID参数但无效
          res.status(400);
          sendHTML({ title: 'UID 无效', content: `
            您输入的 UID 无效！<br />
            请输入一个正确的 UID 吧 awa`, mid: '' });
        }
      } else if (accept === 2) { // 客户端想要获取类型为“图片”的数据，获取头像
        if (!req.query.mid) { // 没有设置UID参数，返回随机头像
          const faces = ['1-22', '1-33', '2-22', '2-33', '3-22', '3-33', '4-22', '4-33', '5-22', '5-33', '6-33'];
          res.status(200).setHeader('Content-Type', 'image/jpeg').send(file(`../assets/${faces[Math.floor(Math.random() * 11)]}.jpg`));
        } else { // 设置了UID参数但无效，返回默认头像
          res.status(400).setHeader('Content-Type', 'image/jpeg').send(file('../assets/noface.jpg'));
        }
      } else { // 否则，返回JSON
        res.status(400).json({ code: -400, message: '请求错误' });
      }
    }
  } catch (e) {
    res.status(500).send(utils.render500(startTime, e));
  }
};
