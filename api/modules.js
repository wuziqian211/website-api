import { kv } from '@vercel/kv';
import utils from '../assets/utils.js';

export default async (req, res) => {
  const { startTime, accept } = utils.initialize(req, res);
  try {
    const sendJSON = data => utils.sendJSON(res, startTime, data); // 发送 JSON 数据到客户端
    
    if (accept === 1) {
      switch (req.query.id) {
        case 'friends': // 对用浏览器直接访问 /api/modules?id=friends 的用户进行重定向
          utils.redirect(res, startTime, 'https://www.yumeharu.top/friends/', 307, true);
          break;
        default:
          utils.send404(1, res, startTime, true);
      }
    } else {
      switch (req.query.id) {
        case 'friends': // 关系好的朋友们（不一定互关）
          const info = (await kv.get('friendsInfo')).toSorted(() => 0.5 - Math.random());
          res.status(200).setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3000');
          if (req.query.version === '3') { // 第 3 版：简化名称
            sendJSON({ code: 0, message: '0', data: { n: info.filter(u => !u.is_deleted).map(u => ({ a: utils.toHTTPS(u.face), i: u.official?.type === 0 ? 0 : u.official?.type === 1 ? 1 : u.vip?.status ? 2 : undefined, n: +!!u.face_nft || undefined, o: [0, 1].includes(u.official?.type) ? u.official.title : undefined, c: u.vip?.status ? '#fb7299' : undefined, t: u.name, d: u.sign, l: `https://space.bilibili.com/${u.mid}` })), d: info.filter(u => u.is_deleted).map(u => ({ a: utils.toHTTPS(u.face), i: u.official?.type === 0 ? 0 : u.official?.type === 1 ? 1 : u.vip?.status ? 2 : undefined, n: +!!u.face_nft || undefined, o: [0, 1].includes(u.official?.type) ? u.official.title : undefined, c: u.vip?.status ? '#fb7299' : undefined, t: u.name, d: u.sign, l: `https://space.bilibili.com/${u.mid}` })) }, extInfo: { dataLength: info.length, dataSource: 'kv' } });
          } else if (req.query.version === '2') { // 第 2 版
            sendJSON({ code: 0, message: '0', data: info.filter(u => !u.is_deleted).map(u => ({ image: utils.toHTTPS(u.face), icon: u.official?.type === 0 ? 'personal' : u.official?.type === 1 ? 'business' : u.vip?.status ? 'big-vip' : undefined, color: u.vip?.status ? '#fb7299' : undefined, title: u.name, desc: u.sign, link: `https://space.bilibili.com/${u.mid}` })), extInfo: { dataLength: info.length, dataSource: 'kv' } });
          } else {
            sendJSON({ code: 0, message: '0', data: info.filter(u => !u.is_deleted).map(u => `<div class="link-grid-container"><img class="link-grid-image" src="${utils.toHTTPS(u.face)}" referrerpolicy="no-referrer" />${u.official?.type === 0 ? '<img class="face-icon" alt title="UP 主认证" src="/images/personal.svg" />' : u.official?.type === 1 ? '<img class="face-icon" alt title="机构认证" src="/images/business.svg" />' : u.vip?.status ? '<img class="face-icon" alt title="大会员" src="/images/big-vip.svg" />' : ''}<p${u.vip?.type === 2 ? ' style="color: #fb7299;"' : ''}>${utils.encodeHTML(u.name)}</p><p>${utils.encodeHTML(u.sign)}</p><a target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${u.mid}"></a></div>`).join(''), extInfo: { dataLength: info.length, dataSource: 'kv' } });
          }
          break;
        case 'blocked': // 可能被屏蔽的域名
          let blocked = '';
          if (req.headers['x-vercel-ip-country'] === 'CN') { // 在中国内地（不含港澳台地区）
            blocked = '^(?:(?:.+\\.)?(?:google\\.com|youtube\\.com|facebook\\.com|wikipedia\\.org|twitter\\.com|x\\.com|nicovideo\\.jp|archive\\.org|pixiv\\.net|vercel\\.app)|cdn\\.jsdelivr\\.net)$';
          }
          res.status(200).setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
          sendJSON({ code: 0, message: '0', data: { blocked }, extInfo: { ipCountry: req.headers['x-vercel-ip-country'] } });
          break;
        case 'upload': // 上传图片
          if (req.method === 'POST' && req.headers['content-type']?.split(';')[0] === 'application/octet-stream') {
            const { body: file } = req;
            if (file.length) {
              const body = new FormData();
              body.set('smfile', new Blob([file]));
              body.set('format', 'json');
              const resp = await fetch('https://smms.app/api/v2/upload', { method: 'POST', headers: { Authorization: `Basic ${process.env.smmsApiKey}` }, body });
              if (resp.ok) {
                const json = await resp.json();
                if (json.success) {
                  res.status(200);
                  sendJSON({ code: 0, message: '0', data: { filename: json.data.filename, url: json.data.url, size: json.data.size, width: json.data.width, height: json.data.height } });
                } else {
                  res.status(400);
                  sendJSON({ code: -400, message: `${json.code}: ${json.message}`, data: null, extInfo: { errType: 'upstreamServerInvalidRequest' } });
                }
              } else {
                res.status(500);
                sendJSON({ code: -500, message: 'upload image failed', data: null, extInfo: { errType: 'upstreamServerRespError', upstreamServerRespStatus: resp.status } });
              }
            } else {
              res.status(400);
              sendJSON({ code: -400, message: '请求错误', data: null, extInfo: { errType: 'internalServerInvalidRequest' } });
            }
          } else if (req.method === 'OPTIONS') {
            res.status(204);
            utils.send(res, startTime, '');
          } else {
            res.status(405);
            sendJSON({ code: -405, message: 'method not allowed', data: null, extInfo: { errType: 'internalServerInvalidRequest' } });
          }
          break;
        case 'qmimg':
          if (/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/.test(req.query.h)) {
            const hashes = await kv.get('hashes');
            const hash = hashes.find(h => h.h === req.query.h);
            if (hash) {
              const resp = await fetch(`https://q1.qlogo.cn/headimg_dl?dst_uin=${hash.s}&spec=4`);
              if (resp.ok) {
                res.status(200).setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3000').setHeader('Content-Type', resp.headers.get('Content-Type'));
                utils.send(res, startTime, Buffer.from(await resp.arrayBuffer()));
              } else {
                res.status(404);
                sendJSON({ code: -404, message: 'cannot fetch image', data: null, extInfo: { errType: 'upstreamServerRespError', upstreamServerRespStatus: resp.status } });
              }
            } else {
              res.status(404);
              sendJSON({ code: -404, message: 'hash not found', data: null, extInfo: { errType: 'internalServerNoData' } });
            }
          } else {
            res.status(400);
            sendJSON({ code: -400, message: '请求错误', data: null, extInfo: { errType: 'internalServerInvalidRequest' } });
          }
          break;
        default:
          res.status(400);
          sendJSON({ code: -400, message: '请求错误', data: null, extInfo: { errType: 'internalServerInvalidRequest' } });
      }
    }
  } catch (e) {
    utils.send500(accept, res, startTime, e);
  }
};
