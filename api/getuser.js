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
      const cjson = await (await fetch(`https://account.bilibili.com/api/member/getCardByMid?mid=${req.query.mid}`, { headers })).json();
      if (accept === 1) { // 客户端想要获取类型为“文档”的数据，返回HTML
        switch (cjson.code) {
          case 0:
            const ujson = await (await fetch(`https://api.bilibili.com/x/space/acc/info?mid=${req.query.mid}`, { headers })).json(); // （备用）获取多用户信息https://api.vc.bilibili.com/account/v1/user/cards?uids=xxx,xxx,……（最多50个）
            if (ujson.code === 0) {
              const content = `
                <img style="display: none;" src="${utils.toHTTPS(ujson.data.top_photo)}" referrerpolicy="no-referrer" />
                <div class="info">
                  <div class="wrap${ujson.data.pendant?.image ? ' has-frame' : ''}">
                    <a target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${req.query.mid}">
                      <img class="face" alt title="${utils.encodeHTML(ujson.data.name)}" src="${utils.toHTTPS(ujson.data.face)}" referrerpolicy="no-referrer" />
                      ${ujson.data.pendant?.pid ? `<img class="face-frame" alt title="${utils.encodeHTML(ujson.data.pendant.name)}" src="${utils.toHTTPS(ujson.data.pendant.image_enhance || ujson.data.pendant.image)}" referrerpolicy="no-referrer" />` : ''}
                      ${ujson.data.face_nft ? `<img class="face-icon${[0, 1].includes(ujson.data.official.type) || ujson.data.vip.status ? ' second' : ''}" alt title="数字藏品" src="/assets/nft-label.gif" />` : ''}
                      ${ujson.data.official.type === 0 ? '<img class="face-icon" alt title="UP 主认证" src="/assets/personal.svg" />' : ujson.data.official.type === 1 ? '<img class="face-icon" alt title="机构认证" src="/assets/business.svg" />' : ujson.data.vip.status ? '<img class="face-icon" alt title="大会员" src="/assets/big-vip.svg" />' : ''}
                    </a>
                  </div>
                  <div>
                    <a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${req.query.mid}">${utils.encodeHTML(ujson.data.name)}</a>
                    ${ujson.data.sex === '男' ? '<img class="sex" alt="男" title="男" src="/assets/male.png" />' : ujson.data.sex === '女' ? '<img class="sex" alt="女" title="女" src="/assets/female.png" />' : ''}
                    <a class="no-underline" target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/blackboard/help.html#/?qid=59e2cffdaa69465486497bb35a5ac295"><img class="level" alt="Lv${ujson.data.is_senior_member ? '6⚡' : ujson.data.level}" title="${ujson.data.is_senior_member ? '6+' : ujson.data.level} 级" src="/assets/level_${ujson.data.is_senior_member ? '6%2B' : ujson.data.level}.svg" /></a>
                    ${cjson.card.spacesta === -10 ? '<span class="description">（账号已注销）</span>' : ''}
                    <br />
                    ${[0, 1].includes(ujson.data.official.type) ? `<img class="official-icon" alt title="${ujson.data.official.type === 0 ? 'UP 主认证" src="/assets/personal.svg" /> <strong style="color: #ffc62e;">bilibili UP 主' : '机构认证" src="/assets/business.svg" /> <strong style="color: #4ac7ff;">bilibili 机构'}认证：</strong>${utils.encodeHTML(ujson.data.official.title)}${ujson.data.official.desc ? `<span class="description">（${utils.encodeHTML(ujson.data.official.desc)}）` : ''}</span><br />` : ''}
                    ${ujson.data.silence ? '<span class="notice"><img class="notice-icon" alt src="/assets/warning.png" /> 该账号封禁中</span><br />' : ''}
                    ${ujson.data.sys_notice?.content ? `<${ujson.data.sys_notice.url ? `a class="notice system" target="_blank" rel="noopener external nofollow noreferrer" href="${ujson.data.sys_notice.url}"` : 'span class="notice system"'}>${ujson.data.sys_notice.icon ? `<img class="notice-icon" alt src="${utils.toHTTPS(ujson.data.sys_notice.icon)}" referrerpolicy="no-referrer" /> ` : ''}${ujson.data.sys_notice.content}</${ujson.data.sys_notice.url ? 'a' : 'span'}><br />` : ''}
                    <span class="description">${utils.encodeHTML(ujson.data.sign)}</span>
                  </div>
                </div>
                <strong>生日：</strong>${cjson.card.birthday ? utils.encodeHTML(cjson.card.birthday) : '保密'}<br />
                <strong>注册时间：</strong>${utils.getDate(cjson.card.regtime)}<br />
                <strong>关注数：</strong>${utils.getNumber(cjson.card.attention)}<br />
                <strong>粉丝数：</strong>${utils.getNumber(cjson.card.fans)}`;
              const extraStyle = utils.renderExtraStyle(utils.toHTTPS(ujson.data.top_photo)) + (ujson.data.sys_notice?.content ? `
                ${ujson.data.sys_notice.url ? 'a' : 'span'}.notice.system {${ujson.data.sys_notice.bg_color ? `
                  background: ${ujson.data.sys_notice.bg_color};` : ''}${ujson.data.sys_notice.text_color ? `
                  color: ${ujson.data.sys_notice.text_color};` : ''}
                }` : '');
              res.status(200);
              sendHTML({ title: `${utils.encodeHTML(ujson.data.name)} 的信息`, appleTouchIcon: utils.toHTTPS(ujson.data.face), style: extraStyle, content, mid: req.query.mid });
            } else {
              const content = `
                <a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${req.query.mid}">
                <div class="info">
                  <div class="wrap${cjson.card.pendant?.image ? ' has-frame' : ''}">
                    <a target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${req.query.mid}">
                      <img class="face" alt title="${utils.encodeHTML(cjson.card.name)}" src="${utils.toHTTPS(cjson.card.face)}" referrerpolicy="no-referrer" />
                      ${cjson.card.pendant?.pid ? `<img class="face-frame" alt title="${utils.encodeHTML(cjson.card.pendant.name)}" src="${utils.toHTTPS(cjson.card.pendant.image)}" referrerpolicy="no-referrer" />` : ''}
                      ${cjson.card.official_verify.type === 0 ? '<img class="face-icon" alt title="UP 主认证" src="/assets/personal.svg" />' : cjson.card.official_verify.type === 1 ? '<img class="face-icon" alt title="机构认证" src="/assets/business.svg" />' : ''}
                    </a>
                  </div>
                  <div>
                    <a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${req.query.mid}">${utils.encodeHTML(cjson.card.name)}</a>
                    ${cjson.card.sex === '男' ? '<img class="sex" alt="男" title="男" src="/assets/male.png" />' : cjson.card.sex === '女' ? '<img class="sex" alt="女" title="女" src="/assets/female.png" />' : ''}
                    <a class="no-underline" target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/blackboard/help.html#/?qid=59e2cffdaa69465486497bb35a5ac295"><img class="level" alt="Lv${cjson.card.level_info.current_level}" title="${cjson.card.level_info.current_level} 级" src="/assets/level_${cjson.card.level_info.current_level}.svg" /></a>
                    ${cjson.card.spacesta === -10 ? '<span class="description">（账号已注销）</span>' : ''}
                    <br />
                    ${[0, 1].includes(cjson.card.official_verify.type) ? `<img class="official-icon" alt title="${cjson.card.official_verify.type === 0 ? 'UP 主认证" src="/assets/personal.svg" /> <strong style="color: #ffc62e;">bilibili UP 主' : '机构认证" src="/assets/business.svg" /> <strong style="color: #4ac7ff;">bilibili 机构'}认证：</strong>${utils.encodeHTML(cjson.card.official_verify.desc)}<br />` : ''}
                    ${cjson.card.spacesta === -2 ? '<span class="notice"><img class="notice-icon" alt src="/assets/warning.png" /> 该账号封禁中</span><br />' : ''}
                    <span class="description">${utils.encodeHTML(cjson.card.sign)}</span>
                  </div>
                </div>
                <strong>生日：</strong>${cjson.card.birthday ? utils.encodeHTML(cjson.card.birthday) : '保密'}<br />
                <strong>注册时间：</strong>${utils.getDate(cjson.card.regtime)}<br />
                <strong>关注数：</strong>${utils.getNumber(cjson.card.attention)}<br />
                <strong>粉丝数：</strong>${utils.getNumber(cjson.card.fans)}`;
              res.status(200);
              sendHTML({ title: `${utils.encodeHTML(cjson.card.name)} 的信息`, appleTouchIcon: utils.toHTTPS(cjson.card.face), style: utils.renderExtraStyle('/assets/top-photo.png'), content, mid: req.query.mid });
            }
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
        if (cjson.code === 0) {
          if (req.query.allow_redirect != undefined) { // 允许本API重定向到B站服务器的头像地址
            res.status(307).setHeader('Location', utils.toHTTPS(cjson.card.face)).json({ code: 307, data: { url: utils.toHTTPS(cjson.card.face) } });
          } else {
            const filename = encodeURIComponent(`${cjson.card.name} 的头像.${utils.toHTTPS(cjson.card.face).split('.').at(-1)}`); // 设置头像的文件名
            const resp = await fetch(utils.toHTTPS(cjson.card.face)); // 获取B站服务器存储的头像
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
        switch (cjson.code) {
          case 0:
            const ujson = await (await fetch(`https://api.bilibili.com/x/space/acc/info?mid=${req.query.mid}`, { headers })).json(); // （备用）获取多用户信息https://api.vc.bilibili.com/account/v1/user/cards?uids=xxx,xxx,……（最多50个）
            if (ujson.code === 0) {
              res.status(200).json({ code: 0, message: cjson.message, data: { ...cjson.card, ...ujson.data, birthday: new Date(`${cjson.card.birthday}T00:00:00+08:00`).getTime() / 1000, following: cjson.card.attention, follower: cjson.card.fans } });
            } else {
              res.status(200).json({ code: 0, message: cjson.message, data: cjson.card });
            }
            break;
          case -412:
            res.status(429).setHeader('Retry-After', '600').json({ code: -412, message: cjson.message });
            break;
          case -404:
          case -626:
            res.status(404).json({ code: -404, message: cjson.message });
            break;
          default:
            res.status(400).json({ code: cjson.code, message: cjson.message });
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
