import type { InternalAPIResponse, FriendInfo, SmmsUploadResponse } from '../assets/types.d.ts';
import type { BodyInit } from 'undici-types';

export const config = { runtime: 'edge' };

import { geolocation } from '@vercel/functions';
import { Redis } from '@upstash/redis';
import * as utils from '../assets/utils.js';

export default (req: Request): Promise<Response> => new Promise(async resolve => {
  const { params, respHeaders, responseType, isResponseTypeSpecified } = utils.initialize(req, [0, 1], resolve);
  try {
    const sendJSON = (status: number, data: InternalAPIResponse<unknown>): void => resolve(utils.sendJSON(status, respHeaders, data)),
          send = (status: number, data: BodyInit): void => resolve(utils.send(status, respHeaders, data));

    if (responseType === 1) {
      switch (params.get('id')) {
        case 'friends': // 对直接访问 /api/modules?id=friends 的浏览器发送重定向的回应
          resolve(utils.redirect(isResponseTypeSpecified ? 308 : 307, 'https://www.yumeharu.top/friends/', !isResponseTypeSpecified));
          break;
        default:
          resolve(utils.send404(1, !isResponseTypeSpecified));
      }
    } else {
      switch (params.get('id')) {
        case 'friends': { // 关系好的朋友们（不一定互关）
          const version = params.get('version'), redis = Redis.fromEnv(),
                info = (<FriendInfo[]> await redis.get('friendsInfo')).toSorted(() => 0.5 - Math.random());
          const { normalFriends, deletedFriends } = Object.groupBy(info, u => u.is_deleted ? 'deletedFriends' : 'normalFriends');

          respHeaders.set('Cache-Control', 's-maxage=600, stale-while-revalidate');
          if (version === '3') { // 第 3 版：简化名称
            sendJSON(200, { code: 0, message: '0', data: { n: normalFriends?.map(u => ({ a: utils.toHTTPS(u.face), i: u.official.type === 0 ? 0 : u.official.type === 1 ? 1 : u.vip.status ? 2 : undefined, n: u.face_nft || undefined, o: [0, 1].includes(u.official.type) ? u.official.title : undefined, c: u.vip.status ? '#fb7299' : undefined, t: u.name, d: u.sign, l: `https://space.bilibili.com/${u.mid}` })), d: deletedFriends?.map(u => ({ a: utils.toHTTPS(u.face), i: u.official.type === 0 ? 0 : u.official.type === 1 ? 1 : u.vip.status ? 2 : undefined, n: u.face_nft || undefined, o: [0, 1].includes(u.official.type) ? u.official.title : undefined, c: u.vip.status ? '#fb7299' : undefined, t: u.name, d: u.sign, l: `https://space.bilibili.com/${u.mid}` })) }, extInfo: { dataLength: info.length, dataSource: 'redis' } });
          } else if (version === '2') { // 第 2 版
            sendJSON(200, { code: 0, message: '0', data: normalFriends?.map(u => ({ image: utils.toHTTPS(u.face), icon: u.official.type === 0 ? 'personal' : u.official.type === 1 ? 'business' : u.vip.status ? 'big-vip' : undefined, color: u.vip.status ? '#fb7299' : undefined, title: u.name, desc: u.sign, link: `https://space.bilibili.com/${u.mid}` })), extInfo: { dataLength: info.length, dataSource: 'redis' } });
          } else {
            sendJSON(200, { code: 0, message: '0', data: normalFriends?.map(u => `<div class=link-grid-container><img class=link-grid-image src=${utils.toHTTPS(u.face)} referrerpolicy=no-referrer><p${u.vip.type === 2 ? ' style=color:#fb7299' : ''}>${utils.encodeHTML(u.name)}</p><p>${utils.encodeHTML(u.sign)}</p><a target=_blank rel="noopener external nofollow noreferrer" href=https://space.bilibili.com/${u.mid}></a></div>`).join(''), extInfo: { dataLength: info.length, dataSource: 'redis' } });
          }
          break;
        }
        case 'blocked': { // 可能被屏蔽的域名
          const { country } = geolocation(req);
          let blocked = '';
          if (country === 'CN') { // 在中国内地（不含港澳台地区）
            blocked = '^(?:(?:.+\\.)?(?:google\\.com|youtube\\.com|facebook\\.com|wikipedia\\.org|twitter\\.com|x\\.com|reddit\\.com|blogspot\\.com|openai\\.com|chatgpt\\.com|instagram\\.com|twitch\\.tv|tiktok\\.com|whatsapp\\.com|telegram\\.org|nicovideo\\.jp|archive\\.org|discord\\.com|disqus\\.com|pixiv\\.net|vercel\\.app|yande\\.re)|cdn\\.jsdelivr\\.net)$';
          }
          respHeaders.set('Cache-Control', 's-maxage=3600, stale-while-revalidate');
          sendJSON(200, { code: 0, message: '0', data: { blocked }, extInfo: { country } });
          break;
        }
        case 'upload': { // 上传图片
          if (req.method === 'POST' && req.headers.get('content-type')?.split(';')[0] === 'application/octet-stream') {
            const file = await req.blob();
            if (file.size) {
              const body = new FormData();
              body.set('smfile', file);
              body.set('format', 'json');
              const resp = await utils.request('https://smms.app/api/v2/upload', { method: 'POST', headers: { Authorization: `Basic ${process.env.smmsApiKey}` }, body, responseType: 'json' });
              if (resp.ok) {
                const json = <SmmsUploadResponse> await resp.json();
                if (json.success) {
                  sendJSON(200, { code: 0, message: '0', data: { filename: json.data!.filename, url: json.data!.url, size: json.data!.size, width: json.data!.width, height: json.data!.height } });
                } else {
                  sendJSON(400, { code: -400, message: `${json.code}: ${json.message}`, data: null, extInfo: { errType: 'upstreamServerInvalidRequest' } });
                }
              } else {
                sendJSON(500, { code: -500, message: 'upload image failed', data: null, extInfo: { errType: 'upstreamServerRespError' } });
              }
            } else {
              sendJSON(400, { code: -400, message: '请求错误', data: null, extInfo: { errType: 'internalServerInvalidRequest' } });
            }
          } else if (req.method === 'OPTIONS') {
            send(204, null);
          } else {
            sendJSON(405, { code: -405, message: 'method not allowed', data: null, extInfo: { errType: 'internalServerInvalidRequest' } });
          }
          break;
        }
        case 'qmimg': {
          const hash = params.get('h');
          if (hash && /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/.test(hash)) {
            const redis = Redis.fromEnv(), source = await redis.hget('qmHashes', hash);
            if (source) {
              const resp = await fetch(`https://q1.qlogo.cn/headimg_dl?dst_uin=${source}&spec=4`);
              if (resp.ok) {
                respHeaders.set('Cache-Control', 's-maxage=600, stale-while-revalidate=3000');
                respHeaders.set('Content-Type', resp.headers.get('Content-Type')!);
                send(200, resp.body);
              } else {
                sendJSON(404, { code: -404, message: 'cannot fetch image', data: null, extInfo: { errType: 'upstreamServerRespError' } });
              }
            } else {
              sendJSON(404, { code: -404, message: 'hash not found', data: null, extInfo: { errType: 'internalServerNoData' } });
            }
          } else {
            sendJSON(400, { code: -400, message: '请求错误', data: null, extInfo: { errType: 'internalServerInvalidRequest' } });
          }
          break;
        }
        default:
          sendJSON(400, { code: -400, message: '请求错误', data: null, extInfo: { errType: 'internalServerInvalidRequest' } });
      }
    }
  } catch (e) {
    resolve(utils.send500(responseType, e));
  }
});
