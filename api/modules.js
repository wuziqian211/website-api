// 本API仅供内部使用，不公开使用
import * as utils from '../assets/utils.js';
export default async (req, res) => {
  const { startTime, accept } = utils.initialize(req);
  try {
    if (accept === 1) {
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
          res.status(200).setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate').json({ code: 0, data: { token: 'YjNiNDZhNDE0NmU3OWQ1N2M1ZDMyMjdjZGY5NDlmMGU=' } });
          break;
        case 'friends':
          /* 已经注销，但曾经和wuziqian211存在一定关系的朋友有这些（下面展示的是注销前被大多数人所熟悉的昵称，不是注销前最后使用的昵称）：
           * 生日快乐是个呆瓜、MC_小高、SL_拾壹、青岛皓资商贸有限公司……
           * 这些朋友的注销，给wuziqian211带来了巨大的损失。wuziqian211希望能有缘再见到TA们。
           */
          let users = [ // 共219位用户
                 12767,      72104,    3090720,    8047632,   12633437,   22000661,   26596074,   33510888,   33889266,   35698830,
              37098548,   37544886,   66083126,   78645830,   85819912,   87572005,   96240239,   96876893,   98787659,  106151689,
             106286557,  107922335,  108428159,  113575740,  134972891,  158553238,  174927495,  185273255,  198316802,  237783120,
             244784788,  254625075,  266790905,  272743796,  275681552,  282022569,  283248136,  286202861,  287804183,  289014064,
             291098307,  293793435,  298030824,  298730211,  299332849,  301867903,  304122884,  308730591,  310395315,  312226745,
             317829434,  320762504,  322989832,  324042405,  329280499,  333655227,  335944141,  341614512,  343836794,  346030399,
             346930951,  350848007,  354097337,  354758619,  355778940,  358201006,  361417173,  363763511,  363870923,  367277357,
             372836503,  374807175,  379240063,  384755513,  385638250,  387964674,  388353543,  389623999,  389874232,  390321415,
             395253454,  396902020,  397007998,  397557321,  397872234,  398217201,  400067046,  400835168,  401143707,  401304564,
             401579752,  404658588,  405966864,  407083438,  411891316,  412110898,  413092448,  414089796,  415240328,  425503913,
             426064686,  429986248,  430278946,  430942433,  430967737,  432258909,  433636684,  433751453,  433849994,  434605889,
             435619015,  437954580,  438586165,  440004933,  440662801,  443529239,  443646127,  444281310,  444309392,  446836354,
             448189858,  449130968,  449328503,  451918909,  452616186,  453521951,  453805650,  453899463,  454258954,  454719152,
             455568817,  455591101,  456527365,  457843315,  458231747,  470390768,  473900065,  473999894,  474683920,  474899885,
             475160063,  476302796,  479611798,  479880391,  479906059,  480015861,  480729923,  481731410,  481823642,  483236840,
             485821637,  486329932,  488790803,  492935673,  494339867,  496300862,  499230650,  500997122,  501312771,  503577862,
             505259355,  505570512,  505743888,  506418994,  509049620,  510272506,  510694894,  512787858,  513634638,  513778858,
             514802302,  515586861,  516744192,  517893335,  517975816,  518868196,  518970483,  519795342,  520139927,  520562672,
             520999014,  521209706,  521877083,  522208739,  522732174,  523423693,  524748045,  526705577,  527630206,  535324469,
             535362423,  589865539,  592308904,  597242903,  598397900,  624532985,  628092353,  646061108,  660766077,  694241611,
            1054922166, 1110936584, 1132879610, 1336347630, 1359379497, 1377882998, 1433618226, 1456149763, 1498694594, 1529167079,
            1550118493, 1651446751, 1684665013, 1694284021, 1697970104, 1721464338, 1753797776, 1980000209, 2095498218
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
          if (req.query.version === '2') {
            res.status(200).setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate').json({ code: 0, data: info.map(u => ({ image: u.face, icon: u.official.type === 0 ? 'personal' : u.official.type === 1 ? 'business' : u.vip.status ? 'big-vip' : undefined, color: u.vip.type === 2 ? '#fb7299' : undefined, title: u.name, desc: u.sign, link: `https://space.bilibili.com/${u.mid}` })) });
          } else {
            res.status(200).json({ code: 0, data: info.sort(() => 0.5 - Math.random()).map(u => `<div class="link-grid-container"><img class="link-grid-image" src="${utils.encodeHTML(u.face)}" referrerpolicy="no-referrer" />${u.official.type === 0 ? '<img class="face-icon" alt title="UP 主认证" src="/images/personal.svg" />' : u.official.type === 1 ? '<img class="face-icon" alt title="机构认证" src="/images/business.svg" />' : u.vip.status ? '<img class="face-icon" alt title="大会员" src="/images/big-vip.svg" />' : ''}<p${u.vip.type === 2 ? ' style="color: #fb7299;"' : ''}>${utils.encodeHTML(u.name)}</p><p>${utils.encodeHTML(u.sign)}</p><a target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${u.mid}"></a></div>`).join('') });
          }
          break;
        case 'blocked':
          let blocked = '';
          if (req.headers['x-vercel-ip-country'] === 'CN') {
            blocked = '^(?:.+\\.)?(?:google\\.com|youtube\\.com|facebook\\.com|wikipedia\\.org|twitter\\.com|nicovideo\\.jp|archive\\.org|pixiv\\.net)$';
          }
          res.status(200).setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate').json({ code: 0, data: { blocked } });
          break;
        default:
          res.status(400).json({ code: -400 });
      }
    }
  } catch (e) {
    res.status(500).send(utils.render500(startTime, e));
  }
};
