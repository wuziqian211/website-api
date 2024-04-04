interface Hash {
  s: string;
  h: string;
}

export const config = { runtime: 'edge' };

import { kv } from '@vercel/kv';
import utils from '../assets/utilities';

export default (req: Request): Promise<Response> => new Promise(async (resolve: (value: Response) => void): Promise<void> => {
  const { accept } = utils.initialize(req, resolve);
  try {
    const headers = new Headers(), params = new URL(req.url).searchParams;
    if (accept === 1) {
      switch (params.get('id')) {
        case 'friends': // 对用浏览器直接访问 /api/modules?id=friends 的用户进行重定向
          resolve(utils.redirect(307, 'https://www.yumeharu.top/friends/', true));
          break;
        default:
          resolve(utils.send404(1, true));
      }
    } else {
      switch (params.get('id')) {
        case 'friends': // 关系好的朋友们（不一定互关）
          const info = (await kv.get('friendsInfo')).toSorted(() => 0.5 - Math.random());
          headers.set('Cache-Control', 's-maxage=600, stale-while-revalidate=3000');
          if (params.get('version') === '3') { // 第 3 版：简化名称
            resolve(utils.sendJSON(200, headers, { code: 0, message: '0', data: { n: info.filter(u => !u.is_deleted).map(u => ({ a: utils.toHTTPS(u.face), i: u.official?.type === 0 ? 0 : u.official?.type === 1 ? 1 : u.vip?.status ? 2 : undefined, n: +!!u.face_nft || undefined, o: [0, 1].includes(u.official?.type) ? u.official.title : undefined, c: u.vip?.status ? '#fb7299' : undefined, t: u.name, d: u.sign, l: `https://space.bilibili.com/${u.mid}` })), d: info.filter(u => u.is_deleted).map(u => ({ a: utils.toHTTPS(u.face), i: u.official?.type === 0 ? 0 : u.official?.type === 1 ? 1 : u.vip?.status ? 2 : undefined, n: +!!u.face_nft || undefined, o: [0, 1].includes(u.official?.type) ? u.official.title : undefined, c: u.vip?.status ? '#fb7299' : undefined, t: u.name, d: u.sign, l: `https://space.bilibili.com/${u.mid}` })) }, extInfo: { dataLength: info.length, dataSource: 'kv' } }));
          } else if (params.get('version') === '2') { // 第 2 版
            resolve(utils.sendJSON(200, headers, { code: 0, message: '0', data: info.filter(u => !u.is_deleted).map(u => ({ image: utils.toHTTPS(u.face), icon: u.official?.type === 0 ? 'personal' : u.official?.type === 1 ? 'business' : u.vip?.status ? 'big-vip' : undefined, color: u.vip?.status ? '#fb7299' : undefined, title: u.name, desc: u.sign, link: `https://space.bilibili.com/${u.mid}` })), extInfo: { dataLength: info.length, dataSource: 'kv' } }));
          } else {
            resolve(utils.sendJSON(200, headers, { code: 0, message: '0', data: info.filter(u => !u.is_deleted).map(u => `<div class="link-grid-container"><img class="link-grid-image" src="${utils.toHTTPS(u.face)}" referrerpolicy="no-referrer" />${u.official?.type === 0 ? '<img class="face-icon" alt title="UP 主认证" src="/images/personal.svg" />' : u.official?.type === 1 ? '<img class="face-icon" alt title="机构认证" src="/images/business.svg" />' : u.vip?.status ? '<img class="face-icon" alt title="大会员" src="/images/big-vip.svg" />' : ''}<p${u.vip?.type === 2 ? ' style="color: #fb7299;"' : ''}>${utils.encodeHTML(u.name)}</p><p>${utils.encodeHTML(u.sign)}</p><a target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${u.mid}"></a></div>`).join(''), extInfo: { dataLength: info.length, dataSource: 'kv' } }));
          }
          break;
        case 'blocked': // 可能被屏蔽的域名
          let blocked = '';
          if (req.headers.get('x-vercel-ip-country') === 'CN') { // 在中国内地（不含港澳台地区）
            blocked = '^(?:(?:.+\\.)?(?:google\\.com|youtube\\.com|facebook\\.com|wikipedia\\.org|twitter\\.com|x\\.com|nicovideo\\.jp|archive\\.org|pixiv\\.net|vercel\\.app)|cdn\\.jsdelivr\\.net)$';
          }
          headers.set('Cache-Control', 's-maxage=3600, stale-while-revalidate');
          resolve(utils.sendJSON(200, headers, { code: 0, message: '0', data: { blocked }, extInfo: { ipCountry: req.headers.get('x-vercel-ip-country') } }));
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
                const json = await resp.json();
                if (json.success) {
                  resolve(utils.sendJSON(200, headers, { code: 0, message: '0', data: { filename: json.data.filename, url: json.data.url, size: json.data.size, width: json.data.width, height: json.data.height } }));
                } else {
                  resolve(utils.sendJSON(400, headers, { code: -400, message: `${json.code}: ${json.message}`, data: null, extInfo: { errType: 'upstreamServerInvalidRequest' } }));
                }
              } else {
                resolve(utils.sendJSON(500, headers, { code: -500, message: 'upload image failed', data: null, extInfo: { errType: 'upstreamServerRespError', upstreamServerRespStatus: resp.status } }));
              }
            } else {
              resolve(utils.sendJSON(400, headers, { code: -400, message: '请求错误', data: null, extInfo: { errType: 'internalServerInvalidRequest' } }));
            }
          } else if (req.method === 'OPTIONS') {
            resolve(utils.send(204, headers, ''));
          } else {
            resolve(utils.sendJSON(405, headers, { code: -405, message: 'method not allowed', data: null, extInfo: { errType: 'internalServerInvalidRequest' } }));
          }
          break;
        case 'qmimg':
          if (/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/.test(params.get('h'))) {
            const hashes: Hash[] = await kv.get('hashes');
            const hash = hashes.find(h => h.h === params.get('h'));
            if (hash) {
              const resp = await fetch(`https://q1.qlogo.cn/headimg_dl?dst_uin=${hash.s}&spec=4`);
              if (resp.ok) {
                headers.set('Cache-Control', 's-maxage=600, stale-while-revalidate=3000');
                headers.set('Content-Type', resp.headers.get('Content-Type'));
                resolve(utils.send(200, headers, Buffer.from(await resp.arrayBuffer())));
              } else {
                resolve(utils.sendJSON(404, headers, { code: -404, message: 'cannot fetch image', data: null, extInfo: { errType: 'upstreamServerRespError', upstreamServerRespStatus: resp.status } }));
              }
            } else {
              resolve(utils.sendJSON(404, headers, { code: -404, message: 'hash not found', data: null, extInfo: { errType: 'internalServerNoData' } }));
            }
          } else {
            resolve(utils.sendJSON(400, headers, { code: -400, message: '请求错误', data: null, extInfo: { errType: 'internalServerInvalidRequest' } }));
          }
          break;
        default:
          resolve(utils.sendJSON(400, headers, { code: -400, message: '请求错误', data: null, extInfo: { errType: 'internalServerInvalidRequest' } }));
      }
    }
  } catch (e) {
    resolve(utils.send500(accept, e));
  }
});
