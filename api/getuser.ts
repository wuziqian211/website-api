/* 获取哔哩哔哩用户信息
 *   https://api.yumeharu.top/api/getuser
 * 使用说明见 https://github.com/wuziqian211/website-api/blob/main/README.md#%E8%8E%B7%E5%8F%96%E5%93%94%E5%93%A9%E5%93%94%E5%93%A9%E7%94%A8%E6%88%B7%E4%BF%A1%E6%81%AF。
 * 作者：晨叶梦春（https://www.yumeharu.top/）
 */

import type { booleanNumber, secondLevelTimestamp, InternalAPIResponse, APIResponse, UserCardData, UserInfoData, UserCardsData, UsersInfoItem, UsersInfoData, InternalAPIGetUserInfoData, InternalAPIGetUsersInfoData } from '../assets/types.d.ts';
import type { SendHTMLData } from '../assets/utils.ts';
import type { BodyInit } from 'undici-types';

import fs from 'node:fs';
import * as utils from '../assets/utils.js';

export const GET = (req: Request): Promise<Response> => new Promise(async resolve => {
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
        <div><label for="mid">请输入您想要获取信息的用户的 UID（最多 200 个，以逗号分隔）：</label></div>
        <div><input type="text" name="mid" id="mid" value="${utils.encodeHTML(data.mid ?? '')}" pattern="[ ,;_\\/\\\\，、]*(?:(?!0+[ ,;_\\/\\\\，、])\\d+[ ,;_\\/\\\\，、]+)*(?!0+(?:[ ,;_\\/\\\\，、]|$))\\d+[ ,;_\\/\\\\，、]*" inputmode="numeric" autocomplete="off" spellcheck="false" /> <input type="submit" value="获取" /></div>
      </form>` })), // 发送 HTML 响应到客户端
          sendJSON = (status: number, data: InternalAPIResponse<unknown>): void => resolve(utils.sendJSON(status, respHeaders, data)), // 发送 JSON 数据到客户端
          send = (status: number, data: BodyInit): void => resolve(utils.send(status, respHeaders, data)); // 发送其他数据到客户端

    const requestMid = params.get('mid');
    if (requestMid && /^\d+$/.test(requestMid) && BigInt(requestMid) > 0) { // 客户端提供的 UID 只有一个且有效
      const mid = BigInt(requestMid);

      let json: InternalAPIResponse<InternalAPIGetUserInfoData | null>;
      const cjson = <{ ts?: secondLevelTimestamp; code: number; message: string; card?: UserCardData }> await utils.callAPI('https://account.bilibili.com/api/member/getCardByMid', { params: { mid }, withCookie: true });
      if (cjson.code === 0) {
        const card = cjson.card!;
        json = { code: 0, message: '0', data: { mid: utils.largeNumberHandler(mid), name: '', approve: false, sex: '', face: '', face_nft: 0, face_nft_type: 0, sign: '', description: '', rank: 10000, DisplayRank: '10000', level: null, jointime: 0, regtime: 0, spacesta: 0, place: '', moral: 0, silence: 0, coins: 0, article: 0, attentions: [], fans: null, friend: null, attention: null, following: null, follower: null, level_info: { next_exp: null, current_level: null, current_min: null, current_exp: null }, fans_badge: false, fans_medal: { show: false, wear: false, medal: null }, official: { role: 0, title: '', desc: '', type: -1 }, official_verify: { type: -1, desc: '' }, vip: { type: 0, status: 0, due_date: 0, vip_pay_type: 0, theme_type: 0, label: { path: '', text: '', label_theme: '', text_color: '', bg_style: 0, bg_color: '', border_color: '', use_img_label: true, img_label_uri_hans: '', img_label_uri_hant: '', img_label_uri_hans_static: '', img_label_uri_hant_static: '' }, avatar_subscript: 0, nickname_color: '', role: 0, avatar_subscript_url: '', tv_vip_status: 0, tv_vip_pay_type: 0, tv_due_date: 0, avatar_icon: { icon_resource: {} } }, pendant: { pid: 0, name: '', image: '', expire: 0, image_enhance: '', image_enhance_frame: '', n_pid: 0 }, nameplate: { nid: 0, name: '', image: '', image_small: '', level: '', condition: '' }, user_honour_info: { mid: 0, colour: null, tags: [], is_latest_100honour: 0 }, is_followed: false, top_photo: '', theme: {}, sys_notice: {}, live_room: null, birthday: 0, school: { name: '' }, profession: { name: '', department: '', title: '', is_show: 0 }, tags: null, series: { user_upgrade_status: 3, show_upgrade_window: false }, is_senior_member: 0, mcn_info: null, gaia_res_type: 0, gaia_data: null, is_risk: false, elec: { show_info: { show: false, state: -1, title: '', icon: '', jump_url: '' } }, contract: { is_display: false, is_follow_display: false }, certificate_show: false, name_render: null }, extInfo: { upstreamServerResponseInfo: [{ url: 'https://account.bilibili.com/api/member/getCardByMid', type: 'json', code: 0, message: '0' }] } };
        json.data = { ...json.data!, ...card, mid: utils.largeNumberHandler(card.mid), rank: +card.rank, level: card.level_info.current_level, silence: <booleanNumber> +(card.spacesta === -2), following: card.attention, follower: card.fans, official: { role: 0, title: card.official_verify.desc, desc: '', type: card.official_verify.type }, pendant: { pid: card.pendant.pid, name: card.pendant.name, image: card.pendant.image, expire: card.pendant.expire, image_enhance: '', image_enhance_frame: '', n_pid: card.pendant.pid }, birthday: Math.floor(Date.parse(`${card.birthday}T00:00:00+08:00`) / 1000) };
        if (responseType !== 2) { // 回复头像数据时，只需要调用上面的 API 而无需调用下面的 API 即可获取头像地址
          const ujson = <APIResponse<UserInfoData>> await utils.callAPI('https://api.bilibili.com/x/space/wbi/acc/info', { params: { mid, token: '', web_location: 1550101 }, wbiSign: true, withCookie: true });
          if (ujson.code === 0) {
            json.message = ujson.message;
            json.data = { ...json.data, ...ujson.data, is_followed: false, birthday: Date.parse(`${card.birthday}T00:00:00+08:00`) / 1000 };
          }
          json.extInfo!.upstreamServerResponseInfo!.push({ url: 'https://api.bilibili.com/x/space/wbi/acc/info', type: 'json', code: ujson.code, message: ujson.message });
        }
      } else {
        json = { code: cjson.code, message: cjson.message, data: null, extInfo: { upstreamServerResponseInfo: [{ url: 'https://account.bilibili.com/api/member/getCardByMid', type: 'json', code: cjson.code, message: cjson.message }] } };
      }

      switch (responseType) {
        case 1: { // 回复 HTML
          switch (json.code) {
            case 0: {
              const data = json.data!, ranks: Record<number, string> = { 5000: '非正式会员', 10000: '普通会员', 20000: '字幕君', 25000: 'VIP', 30000: '真·职人', 32000: '管理员' };
              const content = `
                <div class="main-info-outer">
                  <div class="main-info-inner">
                    <div class="image-wrap${data.pendant.pid ? ' has-frame' : ''}">
                      <img class="face" title="${utils.encodeHTML(data.name)}" src="${utils.toHTTPS(data.face)}" />
                      ${data.pendant.pid ? `<img class="face-frame" alt title="${utils.encodeHTML(data.pendant.name)}" src="${utils.toHTTPS(data.pendant.image_enhance || data.pendant.image)}" />` : ''}
                      ${data.face_nft ? `<img class="face-icon icon-face-nft${[0, 1].includes(data.official.type) || data.vip.status ? ' second' : ''}" alt title="数字藏品" />` : ''}
                      ${data.official.type === 0 ? '<img class="face-icon icon-personal" alt title="UP 主认证" />' : data.official.type === 1 ? '<img class="face-icon icon-business" alt title="机构认证" />' : data.vip.status ? '<img class="face-icon icon-big-vip" alt title="大会员" />' : ''}
                    </div>
                    <div class="detail">
                      <strong>${utils.encodeHTML(data.name)}</strong>
                      ${data.sex === '男' ? '<img class="sex" alt="♂️" title="男" src="/assets/male.png" />' : data.sex === '女' ? '<img class="sex" alt="♀️" title="女" src="/assets/female.png" />' : ''}
                      <a target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/blackboard/help.html#/?qid=59e2cffdaa69465486497bb35a5ac295"><img class="level" alt="Lv${data.is_senior_member ? '6⚡' : data.level}" title="${data.is_senior_member ? '6 级（硬核会员）' : `${data.level} 级`}" src="/assets/level_${data.is_senior_member ? '6%2B' : data.level}.svg" /></a>
                      ${data.vip.status ? data.vip.label.use_img_label && (data.vip.label.img_label_uri_hans || data.vip.label.img_label_uri_hans_static) ? `<a target="_blank" rel="noopener external nofollow noreferrer" href="https://account.bilibili.com/big"><img class="vip" alt="${utils.encodeHTML(data.vip.label.text)}" title="${utils.encodeHTML(data.vip.label.text)}（过期时间：${utils.getDate(data.vip.due_date / 1000)}）" src="${utils.toHTTPS(data.vip.label.img_label_uri_hans || data.vip.label.img_label_uri_hans_static)}" /></a>` : `<a class="vip" target="_blank" rel="noopener external nofollow noreferrer" href="https://account.bilibili.com/big" style="${data.vip.label.bg_color ? `background: ${utils.encodeHTML(data.vip.label.bg_color)};` : ''}${data.vip.label.text_color ? `color: ${utils.encodeHTML(data.vip.label.text_color)};` : ''}">${utils.encodeHTML(data.vip.label.text)}</a>` : ''}
                      ${data.nameplate.nid ? `<img class="pendant" alt="${utils.encodeHTML(data.nameplate.name)}" title="${utils.encodeHTML(data.nameplate.name)}（${utils.encodeHTML(data.nameplate.level)}，${utils.encodeHTML(data.nameplate.condition)}）" src="${utils.toHTTPS(data.nameplate.image)}" />` : ''}
                      ${data.fans_medal.show && data.fans_medal.medal ? `<a target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${data.fans_medal.medal.target_id}"><div class="fans-medal" style="background: linear-gradient(90deg, #${data.fans_medal.medal.medal_color_start.toString(16).padStart(6, '0')}, #${data.fans_medal.medal.medal_color_end.toString(16).padStart(6, '0')});">${utils.encodeHTML(data.fans_medal.medal.medal_name)}<div class="fans-medal-level" style="color: #${data.fans_medal.medal.medal_color.toString(16).padStart(6, '0')};">${data.fans_medal.medal.level}</div></div></a>` : ''}
                      <br />
                      <span class="description">UID：${mid}</span>${data.fans_badge ? ' <span class="description">粉丝勋章</span>' : ''}${data.silence ? ' <span class="notice"><img class="notice-icon" alt="⚠️" /> 该账号封禁中</span>' : ''}
                      <br />
                      ${[0, 1].includes(data.official.type) ? `<img class="official-icon icon-${data.official.type === 0 ? 'personal" alt="⚡" title="UP 主认证" /> <strong class="text-personal">bilibili UP 主' : 'business" alt="⚡" title="机构认证" /> <strong class="text-business">bilibili 机构'}认证${data.official.title ? '：' : ''}</strong>${utils.encodeHTML(data.official.title)}${data.official.desc ? `<span class="description">（${utils.encodeHTML(data.official.desc)}）</span>` : ''}<br />` : ''}
                      ${data.profession.is_show ? `<img class="official-icon icon-profession" alt="Ⓥ" title="职业资质认证" /> 职业资质认证：${data.profession.title ? `${utils.encodeHTML(data.profession.title)} ` : ''}${utils.encodeHTML(data.profession.department || data.profession.name)}<br />` : ''}
                      ${data.tags?.length ? `<span class="description">${data.tags.map(t => `<span class="icon-font icon-tag"></span> ${utils.encodeHTML(t)}`).join(' ')}</span><br />` : ''}
                      ${data.sys_notice && 'content' in data.sys_notice && data.sys_notice.content ? `<${data.sys_notice.url ? `a class="notice${data.sys_notice.notice_type === 2 ? ' tribute' : ''}" target="_blank" rel="noopener external nofollow noreferrer" href="${utils.toHTTPS(data.sys_notice.url)}"` : `span class="notice${data.sys_notice.notice_type === 2 ? ' tribute' : ''}"`}><img class="notice-icon${data.sys_notice.notice_type === 2 ? ' tribute' : ''}" alt="${data.sys_notice.notice_type === 2 ? '🕯️' : '⚠️'}" /> ${utils.encodeHTML(data.sys_notice.content)}</${data.sys_notice.url ? 'a' : 'span'}>` : ''}
                    </div>
                    <a class="main-info-link" target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${mid}"></a>
                  </div>
                </div>
                <strong>用户权限等级：</strong>${data.rank in ranks ? `${ranks[data.rank]}（${data.rank}）` : data.rank}<br />
                <strong>生日：</strong>${data.birthday ? utils.getDate(data.birthday).slice(0, 10) : '保密'}<br />
                ${data.school?.name ? `<strong>学校：</strong>${utils.encodeHTML(data.school.name)}<br />` : ''}
                <strong>关注数：</strong>${utils.getNumber(data.following)}<br />
                <strong>粉丝数：</strong>${utils.getNumber(data.follower)}<br />
                <strong>个性签名：</strong><br />
                ${utils.markText(data.sign)}`;
              sendHTML(200, { title: `${data.name} 的信息`, appleTouchIcon: utils.toHTTPS(data.face), imageBackground: data.top_photo ? utils.toHTTPS(data.top_photo) : '/assets/top-photo.png', content, mid: requestMid });
              break;
            }
            case -352: // 风控校验失败（请求标头或参数不合法）
            case -401: // 非法访问（被识别为爬虫）
            case -403: // 访问权限不足（Wbi 参数错误）
            case -412: // 请求被拦截（请求太频繁或被识别为爬虫）
            case -509: // 请求过于频繁，请稍后再试（URL 非 Wbi，旧）
            case -799: // 请求过于频繁，请稍后再试（URL 非 Wbi）
              respHeaders.set('Retry-After', '600');
              sendHTML(429, { title: '请求被拦截', newStyle: true, content: '抱歉，本 API 的请求已被 B 站拦截，请等一段时间后再试一下 awa', mid: requestMid });
              break;
            case -404: // 啥都木有
            case -626: // 用户不存在
              sendHTML(404, { title: '用户不存在', newStyle: true, content: `UID${mid} 对应的用户不存在！QAQ`, mid: requestMid });
              break;
            default:
              sendHTML(400, { title: '获取用户信息失败', newStyle: true, content: `获取 UID${mid} 的信息失败，请稍后重试 awa`, mid: requestMid });
          }
          break;
        }
        case 2: { // 回复头像数据
          if (json.code === 0) {
            const data = json.data!;
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
                    sendHTML(404, { title: `获取 ${data.name} 的头像数据失败`, newStyle: true, content: `获取 ${utils.encodeHTML(data.name)} 的头像数据失败，请稍后重试 awa`, mid: requestMid });
                  } else {
                    sendJSON(404, { code: -404, message: 'cannot fetch image', data: null, extInfo: { errType: 'upstreamServerRespError', upstreamServerResponseInfo: [{ url: utils.toHTTPS(data.face), type: 'image', status: resp.status }] } });
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
                sendHTML(404, { title: `获取 UID${mid} 的头像数据失败`, newStyle: true, content: `获取 UID${mid} 的头像数据失败，该用户可能不存在哟 qwq`, mid: requestMid });
              } else {
                sendJSON(404, { code: -404, message: '啥都木有', data: null, extInfo: { errType: 'upstreamServerNoData' } });
              }
            } else {
              respHeaders.set('Content-Type', 'image/jpeg');
              send(404, fs.createReadStream('./assets/noface.jpg'));
            }
          }
          break;
        }
        default: // 回复 JSON
          switch (json.code) {
            case 0:
              sendJSON(200, { code: 0, message: json.message, data: json.data, extInfo: json.extInfo! });
              break;
            case -352:
            case -401:
            case -403:
            case -412:
            case -509:
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
    } else if (requestMid && requestMid.split(/[ ,;_/\\，、\r\n]/).filter(m => m).length && requestMid.split(/[ ,;_/\\，、\r\n]/).filter(m => m).every(m => /^\d+$/.test(m) && BigInt(m) > 0)) { // 客户端提供的 UID 为多个且均有效
      const mids = [...new Set(requestMid.split(/[ ,;_/\\，、\r\n]/).filter(m => m).map(m => BigInt(m)))];
      if (mids.length > 200) {
        if (responseType === 1) { // 回复 HTML
          sendHTML(400, { title: '用户数量过多', newStyle: true, content: '您提供的要获取信息的用户的 UID 太多了！请您提供不超过 200 个 UID 哟 qwq', mid: requestMid });
        } else { // 回复 JSON
          sendJSON(400, { code: 40143, message: '批量大小超过限制', data: null, extInfo: { errType: 'internalServerInvalidRequest' } });
        }
        return;
      }

      const cjson = <APIResponse<UserCardsData>> await utils.callAPI('https://api.bilibili.com/x/polymer/pc-electron/v1/user/cards', { params: { uids: mids.join(',') }, withCookie: true });
      if (cjson.code === 0) {
        const restUsers = [...mids], jsonList: Promise<APIResponse<UsersInfoData>>[] = [], usersInfo: UsersInfoItem[] = [];
        while (restUsers.length) {
          jsonList.push(<Promise<APIResponse<UsersInfoData>>> utils.callAPI('https://api.vc.bilibili.com/account/v1/user/cards', { params: { uids: restUsers.slice(0, 50).join(',') }, withCookie: true }));
          restUsers.splice(0, 50);
        }
        for await (const ujson of jsonList) {
          if (ujson.code === 0) usersInfo.push(...ujson.data);
        }
        usersInfo.forEach(i => i.mid in cjson.data && Object.assign(cjson.data[i.mid], { sign: i.sign, rank: i.rank, level: i.level, silence: i.silence }));
      }

      if (responseType === 1) { // 回复 HTML
        switch (cjson.code) {
          case 0: {
            const data = <InternalAPIGetUsersInfoData> cjson.data, ranks: Record<number, string> = { 5000: '非正式会员', 10000: '普通会员', 20000: '字幕君', 25000: 'VIP', 30000: '真·职人', 32000: '管理员' };
            const content = `
              <div class="grid user-list">
                ${Object.values(data).map(u => `
                <div class="grid-item main-info-outer" id="user-${u.mid}" style="background-image: url(${utils.toHTTPS(u.face)});">
                  <div class="main-info-inner image">
                    <div class="image-wrap${u.pendant?.pid ? ' has-frame' : ''}">
                      <img class="face" title="${utils.encodeHTML(u.name)}" src="${utils.toHTTPS(u.face)}" />
                      ${u.pendant?.pid ? `<img class="face-frame" alt title="${utils.encodeHTML(u.pendant.name)}" src="${utils.toHTTPS(u.pendant.image_enhance || u.pendant.image)}" />` : ''}
                      ${u.face_nft ? `<img class="face-icon icon-face-nft${[0, 1].includes(u.official.type) || u.vip.status ? ' second' : ''}" alt title="数字藏品" />` : ''}
                      ${u.official.type === 0 ? '<img class="face-icon icon-personal" alt title="UP 主认证" />' : u.official.type === 1 ? '<img class="face-icon icon-business" alt title="机构认证" />' : u.vip.status ? '<img class="face-icon icon-big-vip" alt title="大会员" />' : ''}
                    </div>
                    <div class="detail">
                      <strong>${utils.encodeHTML(u.name)}</strong>
                      ${'level' in u ? `<a target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/blackboard/help.html#/?qid=59e2cffdaa69465486497bb35a5ac295"><img class="level" alt="Lv${u.level}" title="${u.level} 级" src="/assets/level_${u.level}.svg" /></a>` : ''}
                      ${u.vip.status ? u.vip.label.use_img_label && (u.vip.label.img_label_uri_hans || u.vip.label.img_label_uri_hans_static) ? `<a target="_blank" rel="noopener external nofollow noreferrer" href="https://account.bilibili.com/big"><img class="vip" alt="${utils.encodeHTML(u.vip.label.text)}" title="${utils.encodeHTML(u.vip.label.text)}（过期时间：${utils.getDate(+u.vip.due_date / 1000)}）" src="${utils.toHTTPS(u.vip.label.img_label_uri_hans || u.vip.label.img_label_uri_hans_static)}" /></a>` : `<a class="vip" target="_blank" rel="noopener external nofollow noreferrer" href="https://account.bilibili.com/big" style="${u.vip.label.bg_color ? `background: ${utils.encodeHTML(u.vip.label.bg_color)};` : ''}${u.vip.label.text_color ? `color: ${utils.encodeHTML(u.vip.label.text_color)};` : ''}">${utils.encodeHTML(u.vip.label.text)}</a>` : ''}
                      <br />
                      <span class="description">UID：${u.mid}</span>${u.silence ? ' <span class="notice"><img class="notice-icon" alt="⚠️" /> 该账号封禁中</span>' : ''}
                      <br />
                      ${[0, 1].includes(u.official.type) ? `<img class="official-icon icon-${u.official.type === 0 ? 'personal" alt="⚡" title="UP 主认证" /> <strong class="text-personal">bilibili UP 主' : 'business" alt="⚡" title="机构认证" /> <strong class="text-business">bilibili 机构'}认证${u.official.title ? '：' : ''}</strong>${utils.encodeHTML(u.official.title)}${u.official.desc ? `<span class="description">（${utils.encodeHTML(u.official.desc)}）</span>` : ''}<br />` : ''}
                      ${'rank' in u ? `<strong>用户权限等级：</strong>${u.rank in ranks ? `${ranks[u.rank]}（${u.rank}）` : u.rank}<br />` : ''}
                      ${'sign' in u ? `<span class="description">${utils.markText(u.sign)}</span>` : ''}
                    </div>
                    <a class="main-info-link" target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${u.mid}"></a>
                  </div>
                </div>`).join('')}
              </div>`;
            sendHTML(200, { title: `${mids.length <= 3 ? `${Object.values(data).map(u => u.name).join('、')} ` : `${mids.length} 个用户`}的信息`, imageBackground: '/assets/top-photo.png', content, mid: requestMid });
            break;
          }
          case -352:
          case -401:
          case -403:
          case -412:
          case -509:
          case -799:
            respHeaders.set('Retry-After', '600');
            sendHTML(429, { title: '请求被拦截', newStyle: true, content: '抱歉，本 API 的请求已被 B 站拦截，请等一段时间后再试一下 awa', mid: requestMid });
            break;
          default:
            sendHTML(400, { title: '获取用户信息失败', newStyle: true, content: '获取用户信息失败，请稍后重试 awa', mid: requestMid });
        }
      } else { // 回复 JSON（目前暂时无法回复图片数据）
        switch (cjson.code) {
          case 0:
            sendJSON(200, { code: 0, message: cjson.message, data: <InternalAPIGetUsersInfoData> cjson.data, extInfo: { upstreamServerResponseInfo: [{ url: 'https://api.bilibili.com/x/polymer/pc-electron/v1/user/cards', type: 'json', code: 0, message: cjson.message }] } });
            break;
          case -352:
          case -401:
          case -403:
          case -412:
          case -509:
          case -799:
            respHeaders.set('Retry-After', '600');
            sendJSON(429, { code: cjson.code, message: cjson.message, data: null, extInfo: { errType: 'upstreamServerRequestBanned' } });
            break;
          case -404:
            sendJSON(404, { code: -404, message: cjson.message, data: null, extInfo: { errType: 'upstreamServerNoData' } });
            break;
          default:
            sendJSON(400, { code: cjson.code, message: cjson.message, data: null, extInfo: { errType: 'upstreamServerNoData' } });
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
          sendHTML(400, { title: 'UID 无效', newStyle: true, content: `
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
              sendHTML(400, { title: 'UID 无效', newStyle: true, content: `
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
