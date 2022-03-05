/* 本API仅供内部使用，并不对外公开 */
'use strict';
const fetch = require('node-fetch');
const HTML = require('../assets/html');
const encodeHTML = str => typeof str === 'string' ? str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : '';
module.exports = (req, res) => {
  const st = new Date().getTime();
  if (req.headers.accept?.indexOf('html') !== -1 || req.headers['sec-fetch-dest'] === 'document' || req.headers['x-pjax'] === 'true') {
    switch (req.query.id) {
      case 'friends':
        const url = 'https://wuziqian211.top/about/#%E6%9C%8B%E5%8F%8B%E4%BB%AC';
        res.status(307).setHeader('Location', url).json({code: 307, data: {url: url}});
        break;
      default:
        res.status(404).send(HTML(st, {title: 'API 不存在', body: `
      您访问的 API 不存在，请到<a href="/api/">首页</a>查看目前可用的 API 列表`}));
    }
  } else {
    switch (req.query.id) {
      case 'token':
        res.status(200).json({code: 0, data: {token: 'YjNiNDZhNDE0NmU3OWQ1N2M1ZDMyMjdjZGY5NDlmMGU='}});
        break;
      case 'friends':
        const friends = [12767, 72104, 3090720, 8047632, 12633437, 35698830, 37098548, 37544886, 85819912, 96240239,
                         98787659, 106286557, 108428159, 174927495, 185273255, 198316802, 266790905, 282022569, 283248136, 286202861,
                         291098307, 295389941, 298030824, 301867903, 322989832, 324042405, 333655227, 343836794, 346030399, 350611270,
                         354097337, 354758619, 355778940, 358201006, 361417173, 363763511, 374807175, 384755513, 385638250, 389623999,
                         389874232, 395253454, 397872234, 398217201, 400067046, 404658588, 405966864, 413092448, 415240328, 424674753,
                         425503913, 429986248, 430942433, 430967737, 432258909, 433751453, 433849994, 434605889, 435619015, 437954580,
                         438586165, 440004933, 444281310, 446836354, 448189858, 449328503, 451918909, 452616186, 453521951, 453899463,
                         454258954, 454719152, 455568817, 455591101, 457843315, 473999894, 474683920, 474899885, 475409751, 479611798,
                         480015861, 481731410, 481823642, 485821637, 492935673, 496300862, 503577862, 505570512, 506418994, 510272506,
                         512787858, 513778858, 515586861, 518970483, 519795342, 521209706, 523423693, 526705577, 527630206, 535362423,
                         589865539, 597242903, 598397900, 624532985, 1132879610, 1498694594, 1980000209, 2095498218];
        var info = [];
        const get = users => {
          if (users.length > 0) {
            fetch(`https://api.vc.bilibili.com/account/v1/user/cards?uids=${users.slice(0, 50).join(',')}&build=0&mobi_app=web`).then(resp => resp.json()).then(json => {
              info = info.concat(json.data);
              get(users.slice(50));
            });
          } else {
            let html = '';
            info.sort(() => 0.5 - Math.random()).forEach(u => html += `<div class="link-grid-container">
<img class="link-grid-image" src="${encodeHTML(u.face)}" referrerpolicy="no-referrer" />
<p>${encodeHTML(u.name)}</p><p>${encodeHTML(u.sign)}</p>
<a target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${u.mid}"></a>
</div>`);
            res.status(200).json({code: 0, data: html});
          }
        };
        get(friends);
        break;
      case 'update':
        if (parseInt(req.query.version) > 0) {
          switch (req.query.name) {
            case 'bat':
              if (parseInt(req.query.version) < 6) {
                res.status(200).json({code: 0, data: {new: 1, version: '1.0.1', build: 6, update_content: '1. 优化了用户信息的界面，添加了硬币数、经验值与经验条；\n2. 优化了注册表数据结构，将原来多个注册项合并到一个项；\n3. 添加了选择、执行任务，并附带任务状态与执行结果报告；\n4. 优化了程序的多处细节，修复程序已知崩溃与逻辑等问题。', size: 500000, url: 'https://wuziqian211.gitee.io/biliautotask/release/bili-auto-task%20v1.0.1.6.exe', sha256: ''}});
              } else {
                res.status(200).json({code: 0, data: {new: 0}});
              }
              break;
            default:
              res.status(400).json({code: -400});
          }
        } else {
          res.status(400).json({code: -400});
        }
        break;
      default:
        res.status(400).json({code: -400});
    }
  }
};
