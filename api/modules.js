import utils from '../assets/utils.js';
import { friends } from '../assets/constants.js';

export default async (req, res) => {
  const { startTime, accept } = utils.initialize(req);
  try {
    const sendJSON = data => utils.sendJSON(res, startTime, data); // 发送 JSON 数据到客户端
    
    if (accept === 1) {
      switch (req.query.id) {
        case 'friends': // 对用浏览器直接访问 /api/modules?id=friends 的用户进行重定向
          utils.redirect(res, startTime, 'https://wuziqian211.top/friends/', 307);
          break;
        default:
          utils.send404(1, res, startTime);
      }
    } else {
      switch (req.query.id) {
        case 'token': // 评论图床的 token
          res.status(200).setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
          sendJSON({ code: 0, message: '0', data: { token: btoa('b3b46a4146e79d57c5d3227cdf949f0e') } });
          break;
        case 'friends': // 关系好的朋友们（不一定互关）
          let users = friends.sort(() => 0.5 - Math.random());
          const resps = [];
          while (users.length) {
            resps.push(fetch(`https://api.vc.bilibili.com/account/v1/user/cards?uids=${users.slice(0, 50).join(',')}`, { headers: { Origin: 'https://message.bilibili.com', Referer: 'https://message.bilibili.com/', 'User-Agent': process.env.userAgent } })); // 获取多用户信息，每次获取 50 个
            users = users.slice(50);
          }
          const info = [].concat(...await Promise.all(resps.map(async resp => (await (await resp).json()).data)));
          
          res.status(200).setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3000');
          if (req.query.version === '3') { // 第 3 版：简化名称
            sendJSON({ code: 0, message: '0', data: { n: info.filter(u => !u.is_deleted).sort(() => 0.5 - Math.random()).map(u => ({ a: utils.toHTTPS(u.face), i: u.official.type === 0 ? 0 : u.official.type === 1 ? 1 : u.vip.status ? 2 : undefined, c: u.vip.status ? '#fb7299' : undefined, t: u.name, d: u.sign, l: `https://space.bilibili.com/${u.mid}` })), d: info.filter(u => u.is_deleted).sort(() => 0.5 - Math.random()).map(u => ({ a: utils.toHTTPS(u.face), i: u.official.type === 0 ? 0 : u.official.type === 1 ? 1 : u.vip.status ? 2 : undefined, c: u.vip.status ? '#fb7299' : undefined, t: u.name, d: u.sign, l: `https://space.bilibili.com/${u.mid}` })) } });
          } else if (req.query.version === '2') { // 第 2 版
            sendJSON({ code: 0, message: '0', data: info.filter(u => !u.is_deleted).sort(() => 0.5 - Math.random()).map(u => ({ image: utils.toHTTPS(u.face), icon: u.official.type === 0 ? 'personal' : u.official.type === 1 ? 'business' : u.vip.status ? 'big-vip' : undefined, color: u.vip.status ? '#fb7299' : undefined, title: u.name, desc: u.sign, link: `https://space.bilibili.com/${u.mid}` })) });
          } else {
            sendJSON({ code: 0, message: '0', data: info.filter(u => !u.is_deleted).sort(() => 0.5 - Math.random()).map(u => `<div class="link-grid-container"><img class="link-grid-image" src="${utils.toHTTPS(u.face)}" referrerpolicy="no-referrer" />${u.official.type === 0 ? '<img class="face-icon" alt title="UP 主认证" src="/images/personal.svg" />' : u.official.type === 1 ? '<img class="face-icon" alt title="机构认证" src="/images/business.svg" />' : u.vip.status ? '<img class="face-icon" alt title="大会员" src="/images/big-vip.svg" />' : ''}<p${u.vip.type === 2 ? ' style="color: #fb7299;"' : ''}>${utils.encodeHTML(u.name)}</p><p>${utils.encodeHTML(u.sign)}</p><a target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${u.mid}"></a></div>`).join('') });
          }
          break;
        case 'blocked': // 可能被屏蔽的域名
          let blocked = '';
          if (req.headers['x-vercel-ip-country'] === 'CN') { // 在中国内地（不含港澳台地区）
            blocked = '^(?:.+\\.)?(?:google\\.com|youtube\\.com|facebook\\.com|wikipedia\\.org|twitter\\.com|nicovideo\\.jp|archive\\.org|pixiv\\.net)$';
          }
          res.status(200).setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
          sendJSON({ code: 0, message: '0', data: { blocked } });
          break;
        default:
          res.status(400);
          sendJSON({ code: -400, message: '请求错误', data: null });
      }
    }
  } catch (e) {
    utils.send500(accept, res, startTime, e);
  }
};
