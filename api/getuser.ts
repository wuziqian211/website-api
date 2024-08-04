/* 获取哔哩哔哩用户信息
 *   https://api.yumeharu.top/api/getuser
 * 使用说明见 https://github.com/wuziqian211/website-api/blob/main/README.md#%E8%8E%B7%E5%8F%96%E5%93%94%E5%93%A9%E5%93%94%E5%93%A9%E7%94%A8%E6%88%B7%E4%BF%A1%E6%81%AF。
 * 作者：wuziqian211（https://www.yumeharu.top/）
 */

import type { APIResponse, InternalAPIResponse, SendHTMLData } from '../assets/utils.js';
import type { resolveFn, CardData, SpaceAccInfoData } from '../assets/constants.js';
import type { BodyInit } from 'undici-types';

import fs from 'node:fs';
import utils from '../assets/utils.js';

export const GET = (req: Request): Promise<Response> => new Promise(async (resolve: resolveFn<Response>): Promise<void> => {
  const initData = utils.initialize(req, [0, 1, 2], resolve); // 获取请求参数与回复数据类型
  const { params, respHeaders, fetchDest } = initData, responseAttributes: string[] = [];
  let { responseType } = initData;
  const splitString = params.get('type')?.toUpperCase().split('_');
  if (splitString?.[0] && ['IMAGE', 'FACE', 'AVATAR'].includes(splitString[0])) {
    responseType = 2;
    splitString.shift(); // 删除第一个元素
    responseAttributes.push(...splitString);
  }
  
  try {
    const sendHTML = (status: number, data: Omit<SendHTMLData, 'body'> & { content: string; mid?: string }): void => resolve(utils.sendHTML(status, respHeaders, { ...data, desc: '获取哔哩哔哩用户信息', body: `
      ${data.content}
      <form>
        <div><label for="mid">请输入您想要获取信息的用户的 UID：</label></div>
        <div><input type="number" name="mid" id="mid" value="${data.mid ?? ''}" min="1" max="9223372036854775807" autocomplete="off" /> <input type="submit" value="获取" /></div>
      </form>` })), // 发送 HTML 响应到客户端
          sendJSON = (status: number, data: InternalAPIResponse<unknown>): void => resolve(utils.sendJSON(status, respHeaders, data)), // 发送 JSON 数据到客户端
          send = (status: number, data: BodyInit): void => resolve(utils.send(status, respHeaders, data)); // 发送其他数据到客户端
    
    const requestMid = params.get('mid');
    if (requestMid && /^\d+$/.test(requestMid) && BigInt(requestMid) > 0) { // 判断 UID 是否是正整数
      const headers = new Headers({ Cookie: `SESSDATA=${process.env.SESSDATA}; bili_jct=${process.env.bili_jct}`, Origin: 'https://space.bilibili.com', Referer: `https://space.bilibili.com/${requestMid}`, 'User-Agent': process.env.userAgent! }),
            mid = BigInt(requestMid);
      
      let json;
      const cjson = <{ ts?: number; code: number; message: string; card?: CardData }>await (await fetch(`https://account.bilibili.com/api/member/getCardByMid?mid=${mid}`, { headers })).json();
      if (cjson.code === 0) {
        const card = cjson.card!;
        json = { code: 0, message: '0', data: { mid: utils.largeNumberHandler(mid), name: null, approve: false, sex: null, face: null, face_nft: null, face_nft_type: null, sign: null, description: '', rank: null, DisplayRank: null, level: null, jointime: 0, regtime: 0, spacesta: null, place: '', moral: 0, silence: null, coins: null, article: 0, attentions: [], fans: null, friend: null, attention: null, following: null, follower: null, level_info: { next_exp: null, current_level: null, current_min: null, current_exp: null }, fans_badge: null, fans_medal: { show: null, wear: null, medal: null }, official: { role: null, title: null, desc: null, type: null }, official_verify: { type: null, desc: null }, vip: null, pendant: null, nameplate: null, user_honour_info: null, is_followed: false, top_photo: null, theme: {}, sys_notice: null, live_room: null, birthday: 0, school: { name: null }, profession: { name: null, department: null, title: null, is_show: null }, tags: null, series: null, is_senior_member: null, mcn_info: null, gaia_res_type: 0, gaia_data: null, is_risk: false, elec: { show_info: null }, contract: { is_display: null, is_follow_display: null }, certificate_show: null, name_render: null }, extInfo: { dataSource: ['getCardByMid'] } };
        Object.assign(json.data, { ...card, mid: utils.largeNumberHandler(card.mid), rank: utils.largeNumberHandler(card.rank), level: card.level_info.current_level, silence: +(card.spacesta === -2), following: card.attention, follower: card.fans, official: { role: null, title: card.official_verify.desc, desc: null, type: card.official_verify.type }, birthday: Math.floor(Date.parse(`${card.birthday}T00:00:00+08:00`) / 1000) });
        if (responseType !== 2) { // 回复头像数据时，只需要调用上面的 API 而无需调用下面的 API 即可获取头像地址
          const ujson = <APIResponse<SpaceAccInfoData>>await (await fetch(`https://api.bilibili.com/x/space/wbi/acc/info?${await utils.encodeWbi({ mid: mid.toString() })}`, { headers })).json(); // （备用）获取多用户信息：https://api.bilibili.com/x/polymer/pc-electron/v1/user/cards?uids=(...),(...),……
          if (ujson.code === 0) {
            json.message = ujson.message;
            Object.assign(json.data, { ...ujson.data, coins: card.coins, is_followed: false, birthday: Date.parse(`${card.birthday}T00:00:00+08:00`) / 1000 });
            json.extInfo.dataSource.push('spaceAccInfo');
          } else {
            Object.assign(json.extInfo, { spaceAccInfoCode: ujson.code, spaceAccInfoMessage: ujson.message });
          }
        }
      } else {
        json = { code: cjson.code, message: cjson.message, data: null };
      }
      
      if (responseType === 1) { // 回复 HTML
        switch (json.code) {
          case 0:
            const data: CardData & SpaceAccInfoData & { mid: number | string; following: number; follower: number; birthday: number } = json.data!;
            const content = `
              <img style="display: none;" alt src="${data.top_photo ? utils.toHTTPS(data.top_photo) : '/assets/top-photo.png'}" />
              <div class="main-info-outer">
                <div class="main-info-inner">
                  <div class="image-wrap${data.pendant?.image ? ' has-frame' : ''}">
                    <a target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${mid}">
                      <img class="face" title="${utils.encodeHTML(data.name)}" src="${utils.toHTTPS(data.face)}" />
                      ${data.pendant?.pid ? `<img class="face-frame" alt title="${utils.encodeHTML(data.pendant.name)}" src="${utils.toHTTPS(data.pendant.image_enhance || data.pendant.image)}" />` : ''}
                      ${data.face_nft ? `<img class="face-icon icon-face-nft${[0, 1].includes(data.official.type) || data.vip?.status ? ' second' : ''}" alt title="数字藏品" />` : ''}
                      ${data.official.type === 0 ? '<img class="face-icon icon-personal" alt title="UP 主认证" />' : data.official.type === 1 ? '<img class="face-icon icon-business" alt title="机构认证" />' : data.vip?.status ? '<img class="face-icon icon-big-vip" alt title="大会员" />' : ''}
                    </a>
                  </div>
                  <div class="detail">
                    <a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${mid}">${utils.encodeHTML(data.name)}</a>
                    ${data.sex === '男' ? '<img class="sex" alt="♂️" title="男" src="/assets/male.png" />' : data.sex === '女' ? '<img class="sex" alt="♀️" title="女" src="/assets/female.png" />' : ''}
                    <a target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/blackboard/help.html#/?qid=59e2cffdaa69465486497bb35a5ac295"><img class="level" alt="Lv${data.is_senior_member ? '6⚡' : data.level}" title="${data.is_senior_member ? '6 级（硬核会员）' : `${data.level} 级`}" src="/assets/level_${data.is_senior_member ? '6%2B' : data.level}.svg" /></a>
                    <br />
                    ${[0, 1].includes(data.official.type) ? `<img class="official-icon icon-${data.official.type === 0 ? 'personal" alt="⚡" title="UP 主认证" /> <strong class="text-personal">bilibili UP 主' : 'business" alt="⚡" title="机构认证" /> <strong class="text-business">bilibili 机构'}认证${data.official.title ? '：' : ''}</strong>${utils.encodeHTML(data.official.title)}${data.official.desc ? `<span class="description">（${utils.encodeHTML(data.official.desc)}）</span>` : ''}<br />` : ''}
                    ${data.tags?.length ? `<span class="description">${data.tags.map(t => `<span class="icon-font icon-tag"></span> ${utils.encodeHTML(t)}`).join(' ')}</span><br />` : ''}
                    ${data.silence ? '<span class="notice"><img class="notice-icon" alt="⚠️" /> 该账号封禁中</span><br />' : ''}
                    ${data.sys_notice?.content ? `<${data.sys_notice.url ? `a class="notice${data.sys_notice.notice_type === 2 ? ' tribute' : ''}" target="_blank" rel="noopener external nofollow noreferrer" href="${data.sys_notice.url}"` : `span class="notice${data.sys_notice.notice_type === 2 ? ' tribute' : ''}"`}><img class="notice-icon${data.sys_notice.notice_type === 2 ? ' tribute' : ''}" alt="${data.sys_notice.notice_type === 2 ? '🕯️' : '⚠️'}" /> ${utils.encodeHTML(data.sys_notice.content)}</${data.sys_notice.url ? 'a' : 'span'}>` : ''}
                  </div>
                </div>
              </div>
              <strong>生日：</strong>${data.birthday ? utils.getDate(data.birthday).slice(0, 10) : '保密'}<br />
              ${data.school?.name ? `<strong>学校：</strong>${utils.encodeHTML(data.school.name)}<br />` : ''}
              <strong>注册时间：</strong>${utils.getDate(data.regtime)}<br />
              <strong>关注数：</strong>${utils.getNumber(data.following)}<br />
              <strong>粉丝数：</strong>${utils.getNumber(data.follower)}<br />
              <strong>个性签名：</strong><br />
              ${utils.markText(data.sign)}`;
            sendHTML(200, { title: `${data.name} 的信息`, appleTouchIcon: utils.toHTTPS(data.face), imageBackground: data.top_photo ? utils.toHTTPS(data.top_photo) : '/assets/top-photo.png', content, mid: requestMid });
            break;
          case -352: // 风控校验失败（请求标头不合法）
          case -401: // 非法访问
          case -403: // 访问权限不足（wbi 参数不合法）
          case -412: // 请求被拦截
          case -799: // 请求过于频繁，请稍后再试（URL 非 wbi）
            respHeaders.set('Retry-After', '600');
            sendHTML(429, { title: '请求被拦截', content: '抱歉，本 API 的请求已被 B 站拦截，请等一段时间后重试 awa', mid: requestMid });
            break;
          case -404: // 啥都木有
          case -626: // 用户不存在
            sendHTML(404, { title: '用户不存在', content: `UID${mid} 对应的用户不存在！QAQ`, mid: requestMid });
            break;
          default:
            sendHTML(400, { title: '获取用户信息失败', content: `获取 UID${mid} 的信息失败，请稍后重试 awa`, mid: requestMid });
        }
      } else if (responseType === 2) { // 回复头像数据
        if (json.code === 0) {
          const data: CardData & SpaceAccInfoData & { mid: number | string; following: number; follower: number; birthday: number } = json.data!;
          if (responseAttributes.includes('REDIRECT')) { // 允许本 API 重定向到 B 站服务器的头像地址
            resolve(utils.redirect(307, utils.toHTTPS(data.face)));
          } else {
            const filename = encodeURIComponent(`${data.name} 的头像.${new URL(data.face).pathname.split('.').at(-1)}`); // 设置头像的文件名
            const resp = await fetch(utils.toHTTPS(data.face)); // 获取 B 站服务器存储的头像
            if (resp.ok) {
              respHeaders.set('Cache-Control', 's-maxage=60, stale-while-revalidate');
              respHeaders.set('Content-Type', resp.headers.get('Content-Type')!);
              respHeaders.set('Content-Disposition', `inline; filename=${filename}`);
              send(200, resp.body);
            } else {
              if (responseAttributes.includes('ERRORWHENFAILED') && fetchDest !== 2) {
                if (fetchDest === 1) {
                  sendHTML(404, { title: `获取 ${data.name} 的头像数据失败`, content: `获取 ${utils.encodeHTML(data.name)} 的头像数据失败，请稍后重试 awa`, mid: requestMid });
                } else {
                  sendJSON(404, { code: -404, message: 'cannot fetch image', data: null, extInfo: { errType: 'upstreamServerRespError', upstreamServerUrl: utils.toHTTPS(data.face), upstreamServerRespStatus: resp.status } });
                }
              } else {
                respHeaders.set('Content-Type', 'image/jpeg');
                send(404, fs.createReadStream('./assets/noface.jpg'));
              }
            }
          }
        } else { // 用户信息获取失败，回复默认头像
          if (responseAttributes.includes('ERRORWHENFAILED') && fetchDest !== 2) {
            if (fetchDest === 1) {
              sendHTML(404, { title: `获取 UID${mid} 的头像数据失败`, content: `获取 UID${mid} 的头像数据失败，该用户可能不存在哟 qwq`, mid: requestMid });
            } else {
              sendJSON(404, { code: -404, message: '啥都木有', data: null, extInfo: { errType: 'upstreamServerNoData' } });
            }
          } else {
            respHeaders.set('Content-Type', 'image/jpeg');
            send(404, fs.createReadStream('./assets/noface.jpg'));
          }
        }
      } else { // 回复 JSON
        switch (json.code) {
          case 0:
            sendJSON(200, { code: 0, message: json.message, data: json.data, extInfo: json.extInfo });
            break;
          case -352:
          case -401:
          case -403:
          case -412:
          case -799:
            respHeaders.set('Retry-After', '600');
            sendJSON(429, { code: json.code, message: json.message, data: null, extInfo: { errType: 'upstreamServerRequestBanned' } });
            break;
          case -404:
          case -626:
            sendJSON(404, { code: -404, message: json.message, data: null, extInfo: { errType: 'upstreamServerNoData' } });
            break;
          default:
            sendJSON(400, { code: json.code, message: json.message, data: null, extInfo: { errType: 'upstreamServerNoData' } });
        }
      }
    } else { // UID 无效
      if (responseType === 1) { // 回复 HTML
        if (!requestMid) { // 没有设置 UID 参数
          sendHTML(200, { title: '获取哔哩哔哩用户信息', newStyle: true, content: `
            本 API 可以获取指定 B 站用户的信息。<br />
            基本用法：https://${req.headers.get('host')}<wbr />/api<wbr />/getuser?mid=<span class="notice">您想获取信息的用户的 UID</span><br />
            更多用法见<a target="_blank" rel="noopener external nofollow noreferrer" href="https://github.com/${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}/blob/${process.env.VERCEL_GIT_COMMIT_REF}/README.md#%E8%8E%B7%E5%8F%96%E5%93%94%E5%93%A9%E5%93%94%E5%93%A9%E7%94%A8%E6%88%B7%E4%BF%A1%E6%81%AF">本站的使用说明</a>。` });
        } else { // 设置了 UID 参数但无效
          sendHTML(400, { title: 'UID 无效', content: `
            您输入的 UID 无效！<br />
            请输入一个正确的 UID 吧 awa` });
        }
      } else if (responseType === 2) { // 回复头像数据
        if (!requestMid) { // 没有设置 UID 参数，回复随机头像
          const faces = ['1-22', '1-33', '2-22', '2-33', '3-22', '3-33', '4-22', '4-33', '5-22', '5-33', '6-33'];
          respHeaders.set('Content-Type', 'image/jpeg');
          send(200, fs.createReadStream(`./assets/${faces[Math.floor(Math.random() * faces.length)]}.jpg`));
        } else { // 设置了 UID 参数但无效，回复默认头像
          if (responseAttributes.includes('ERRORWHENFAILED') && fetchDest !== 2) {
            if (fetchDest === 1) {
              sendHTML(400, { title: 'UID 无效', content: `
                您输入的 UID 无效！<br />
                请输入一个正确的 UID 吧 awa` });
            } else {
              sendJSON(400, { code: -400, message: '请求错误', data: null, extInfo: { errType: 'internalServerInvalidRequest' } });
            }
          } else {
            respHeaders.set('Content-Type', 'image/jpeg');
            send(400, fs.createReadStream('./assets/noface.jpg'));
          }
        }
      } else { // 回复 JSON
        sendJSON(400, { code: -400, message: '请求错误', data: null, extInfo: { errType: 'internalServerInvalidRequest' } });
      }
    }
  } catch (e) {
    resolve(utils.send500(responseType, e));
  }
});
export const HEAD = GET, OPTIONS = GET, POST = GET, PUT = GET, DELETE = GET, PATCH = GET;
