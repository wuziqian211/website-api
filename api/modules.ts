import type { BodyInit } from 'undici-types';
import type { InternalAPIResponse, resolveFn, numberBool } from '../assets/utils.js';

interface FriendInfo {
  mid: number;
  name: string;
  face: string;
  sign: string;
  level: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  face_nft: numberBool;
  is_senior_member: numberBool;
  official: { role: number; title: string; desc: string; type: -1 | 0 | 1 };
  vip: { type: number; status: numberBool; due_date: string; role: number };
  is_deleted: numberBool;
}
interface SmmsUploadResponse {
  success: boolean;
  code: string;
  message: string;
  data?: {
    file_id: number;
    width: number;
    height: number;
    filename: string;
    storename: string;
    size: number;
    path: string;
    hash: string;
    url: string;
    delete: string;
    page: string;
  };
  RequestId: string;
}
interface HashInfo {
  s: string;
  h: string;
}

export const config = { runtime: 'edge' };

import { kv } from '@vercel/kv';
import utils from '../assets/utils.js';

export default (req: Request): Promise<Response> => new Promise(async (resolve: resolveFn<Response>): Promise<void> => {
  const { params, respHeaders, responseType } = utils.initialize(req, [0, 1], resolve);
  try {
    const sendJSON = (status: number, data: InternalAPIResponse<unknown>): void => resolve(utils.sendJSON(status, respHeaders, data)),
          send = (status: number, data: BodyInit): void => resolve(utils.send(status, respHeaders, data));
    
    if (responseType === 1) {
      switch (params.get('id')) {
        case 'friends': // 对直接访问 /api/modules?id=friends 的浏览器发送重定向的回应
          resolve(utils.redirect(307, 'https://www.yumeharu.top/friends/', true));
          break;
        default:
          resolve(utils.send404(1, true));
      }
    } else {
      switch (params.get('id')) {
        case 'friends': // 关系好的朋友们（不一定互关）
          const version = params.get('version'), info = (<FriendInfo[]>await kv.get('friendsInfo')).toSorted(() => 0.5 - Math.random());
          respHeaders.set('Cache-Control', 's-maxage=600, stale-while-revalidate=3000');
          if (version === '3') { // 第 3 版：简化名称
            sendJSON(200, { code: 0, message: '0', data: { n: info.filter(u => !u.is_deleted).map(u => ({ a: utils.toHTTPS(u.face), i: u.official?.type === 0 ? 0 : u.official?.type === 1 ? 1 : u.vip?.status ? 2 : undefined, n: +!!u.face_nft || undefined, o: [0, 1].includes(u.official?.type) ? u.official.title : undefined, c: u.vip?.status ? '#fb7299' : undefined, t: u.name, d: u.sign, l: `https://space.bilibili.com/${u.mid}` })), d: info.filter(u => u.is_deleted).map(u => ({ a: utils.toHTTPS(u.face), i: u.official?.type === 0 ? 0 : u.official?.type === 1 ? 1 : u.vip?.status ? 2 : undefined, n: +!!u.face_nft || undefined, o: [0, 1].includes(u.official?.type) ? u.official.title : undefined, c: u.vip?.status ? '#fb7299' : undefined, t: u.name, d: u.sign, l: `https://space.bilibili.com/${u.mid}` })) }, extInfo: { dataLength: info.length, dataSource: 'kv' } });
          } else if (version === '2') { // 第 2 版
            sendJSON(200, { code: 0, message: '0', data: info.filter(u => !u.is_deleted).map(u => ({ image: utils.toHTTPS(u.face), icon: u.official?.type === 0 ? 'personal' : u.official?.type === 1 ? 'business' : u.vip?.status ? 'big-vip' : undefined, color: u.vip?.status ? '#fb7299' : undefined, title: u.name, desc: u.sign, link: `https://space.bilibili.com/${u.mid}` })), extInfo: { dataLength: info.length, dataSource: 'kv' } });
          } else {
            sendJSON(200, { code: 0, message: '0', data: info.filter(u => !u.is_deleted).map(u => `<div class="link-grid-container"><img class="link-grid-image" src="${utils.toHTTPS(u.face)}" referrerpolicy="no-referrer" />${u.official?.type === 0 ? '<img class="face-icon" alt title="UP 主认证" src="/images/personal.svg" />' : u.official?.type === 1 ? '<img class="face-icon" alt title="机构认证" src="/images/business.svg" />' : u.vip?.status ? '<img class="face-icon" alt title="大会员" src="/images/big-vip.svg" />' : ''}<p${u.vip?.type === 2 ? ' style="color: #fb7299;"' : ''}>${utils.encodeHTML(u.name)}</p><p>${utils.encodeHTML(u.sign)}</p><a target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${u.mid}"></a></div>`).join(''), extInfo: { dataLength: info.length, dataSource: 'kv' } });
          }
          break;
        case 'blocked': // 可能被屏蔽的域名
          let blocked = '';
          if (req.headers.get('x-vercel-ip-country') === 'CN') { // 在中国内地（不含港澳台地区）
            blocked = '^(?:(?:.+\\.)?(?:google\\.com|youtube\\.com|facebook\\.com|wikipedia\\.org|twitter\\.com|x\\.com|reddit\\.com|blogspot\\.com|openai\\.com|chatgpt\\.com|instagram\\.com|twitch\\.tv|tiktok\\.com|whatsapp\\.com|telegram\\.org|nicovideo\\.jp|archive\\.org|discord\\.com|disqus\\.com|pixiv\\.net|vercel\\.app|yande\\.re)|cdn\\.jsdelivr\\.net)$';
          }
          respHeaders.set('Cache-Control', 's-maxage=3600, stale-while-revalidate');
          sendJSON(200, { code: 0, message: '0', data: { blocked }, extInfo: { ipCountry: req.headers.get('x-vercel-ip-country') } });
          break;
        case 'upload': // 上传图片
          if (req.method === 'POST' && req.headers.get('content-type')?.split(';')[0] === 'application/octet-stream') {
            const file = await req.blob();
            if (file.size) {
              const body = new FormData();
              body.set('smfile', file);
              body.set('format', 'json');
              const resp = await fetch('https://smms.app/api/v2/upload', { method: 'POST', headers: { Authorization: `Basic ${process.env.smmsApiKey}` }, body });
              if (resp.ok) {
                const json = <SmmsUploadResponse>await resp.json();
                if (json.success) {
                  sendJSON(200, { code: 0, message: '0', data: { filename: json.data!.filename, url: json.data!.url, size: json.data!.size, width: json.data!.width, height: json.data!.height } });
                } else {
                  sendJSON(400, { code: -400, message: `${json.code}: ${json.message}`, data: null, extInfo: { errType: 'upstreamServerInvalidRequest' } });
                }
              } else {
                sendJSON(500, { code: -500, message: 'upload image failed', data: null, extInfo: { errType: 'upstreamServerRespError', upstreamServerRespStatus: resp.status } });
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
        case 'qmimg':
          const hash = params.get('h');
          if (hash && /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/.test(hash)) {
            const hashes = <HashInfo[]>await kv.get('hashes');
            const hashInfo = hashes.find(h => h.h === hash);
            if (hashInfo) {
              const resp = await fetch(`https://q1.qlogo.cn/headimg_dl?dst_uin=${hashInfo.s}&spec=4`);
              if (resp.ok) {
                respHeaders.set('Cache-Control', 's-maxage=600, stale-while-revalidate=3000');
                respHeaders.set('Content-Type', resp.headers.get('Content-Type')!);
                send(200, resp.body);
              } else {
                sendJSON(404, { code: -404, message: 'cannot fetch image', data: null, extInfo: { errType: 'upstreamServerRespError', upstreamServerRespStatus: resp.status } });
              }
            } else {
              sendJSON(404, { code: -404, message: 'hash not found', data: null, extInfo: { errType: 'internalServerNoData' } });
            }
          } else {
            sendJSON(400, { code: -400, message: '请求错误', data: null, extInfo: { errType: 'internalServerInvalidRequest' } });
          }
          break;
        default:
          sendJSON(400, { code: -400, message: '请求错误', data: null, extInfo: { errType: 'internalServerInvalidRequest' } });
      }
    }
  } catch (e) {
    resolve(utils.send500(responseType, e));
  }
});
