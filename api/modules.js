// 本API仅供内部使用，不公开使用
import fetch from 'node-fetch';
import * as utils from '../assets/utils.js';
export default async (req, res) => {
  const startTime = performance.now();
  try {
    if (utils.getAccept(req) === 1) {
      switch (req.query.id) {
        case 'friends':
          const url = 'https://wuziqian211.top/friends/';
          res.status(307).setHeader('Location', url).json({ code: 307, data: { url } });
          break;
        default:
          res.status(404).send(utils.render404(startTime));
      }
    } else {
      switch (req.query.id) {
        case 'token':
          res.status(200).json({ code: 0, data: { token: 'YjNiNDZhNDE0NmU3OWQ1N2M1ZDMyMjdjZGY5NDlmMGU=' } });
          break;
        case 'friends':
          let users = [
                 12767,      72104,    3090720,    8047632,  12633437,  26596074,  33510888,  35698830,   37098548,   37544886,
              85819912,   96240239,   98787659,  106286557, 108428159, 174927495, 185273255, 198316802,  237783120,  244784788,
             254625075,  266790905,  272743796,  282022569, 283248136, 286202861, 289014064, 291098307,  293793435,  298030824,
             298730211,  299332849,  301867903,  304122884, 322989832, 324042405, 333655227, 341614512,  343836794,  346030399,
             350848007,  354097337,  354758619,  355778940, 358201006, 361417173, 363763511, 363870923,  367277357,  372836503,
             374807175,  384755513,  385638250,  389623999, 389874232, 395253454, 396902020, 397007998,  397872234,  398217201,
             400067046,  401143707,  401579752,  404658588, 405966864, 413092448, 414089796, 415240328,  424674753,  425503913,
             426064686,  429986248,  430278946,  430967737, 432258909, 433751453, 433849994, 434605889,  435619015,  437954580,
             438586165,  440004933,  440662801,  443646127, 444281310, 446836354, 448189858, 449130968,  449328503,  451918909,
             452616186,  453521951,  453899463,  454258954, 454719152, 455568817, 455591101, 457843315,  473999894,  474683920,
             474899885,  475160063,  476302796,  479611798, 480015861, 480729923, 481731410, 481823642,  485821637,  492935673,
             496300862,  503577862,  505259355,  505570512, 506418994, 510272506, 512787858, 513634638,  513778858,  515586861,
             517975816,  518970483,  519795342,  520139927, 521209706, 522208739, 523423693, 524748045,  526705577,  527630206,
             535324469,  535362423,  589865539,  592308904, 597242903, 598397900, 624532985, 694241611, 1054922166, 1132879610,
            1456149763, 1498694594, 1980000209, 2095498218
          ].sort(() => 0.5 - Math.random());
          let info = [], promises = [];
          while (users.length) {
            promises.push(fetch(`https://api.vc.bilibili.com/account/v1/user/cards?uids=${users.slice(0, 50).join(',')}`, { headers: { Origin: 'https://message.bilibili.com', Referer: 'https://message.bilibili.com/', 'User-Agent': process.env.userAgent } }));
            users = users.slice(50);
          }
          const resps = await Promise.all(promises);
          for (const r of resps) {
            info = info.concat((await r.json()).data);
          }
          res.status(200).json({ code: 0, data: info.sort(() => 0.5 - Math.random()).map(u => `<div class="link-grid-container"><img class="link-grid-image" src="${utils.encodeHTML(u.face)}" referrerpolicy="no-referrer" />${u.official.type === 0 || u.official.type === 1 ? `<img class="face-icon" src="/images/${u.official.type === 0 ? 'personal' : 'business'}.svg" />` : ''}<p>${utils.encodeHTML(u.name)}</p><p>${utils.encodeHTML(u.sign)}</p><a target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${u.mid}"></a></div>`).join('') });
          break;
        case 'blocked':
          let blocked = '';
          if (req.headers['x-vercel-ip-country'] === 'CN') {
            blocked = '^(?:.+\\.)?(?:google\\.com|youtube\\.com|facebook\\.com|wikipedia\\.org|twitter\\.com|nicovideo\\.jp|archive\\.org|pixiv\\.net)$';
          }
          res.status(200).json({ code: 0, data: { blocked } });
          break;
        case 'update':
          if (/^\d+$/.test(req.query.version) && parseInt(req.query.version) > 0) {
            switch (req.query.name) {
              case 'bat':
                if (parseInt(req.query.version) < 6) {
                  res.status(200).json({ code: 0, data: { new: 1, version: '1.0.1', build: 6, update_content: '1. 优化了用户信息的界面，添加了硬币数、经验值与经验条；\n2. 优化了注册表数据结构，将原来多个注册项合并到一个项；\n3. 添加了选择、执行任务，并附带任务状态与执行结果报告；\n4. 优化了程序的多处细节，修复程序已知崩溃与逻辑等问题。', size: 500000, url: 'https://wuziqian211.gitee.io/biliautotask/release/bili-auto-task%20v1.0.1.6.exe', sha256: '' } });
                } else {
                  res.status(200).json({ code: 0, data: { new: 0 } });
                }
                break;
              default:
                res.status(400).json({ code: -400 });
            }
          } else {
            res.status(400).json({ code: -400 });
          }
          break;
        default:
          res.status(400).json({ code: -400 });
      }
    }
  } catch (e) {
    res.status(500).send(utils.render500(startTime, e));
  }
};
