/* 本API仅供内部使用，并不是对外公开的 */
const fetch = require('node-fetch');
const HTML = require('../assets/html');
const encodeHTML = str => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
module.exports = (req, res) => {
  if ((!req.headers.accept || req.headers.accept.indexOf('html') === -1) && req.headers['x-pjax'] !== 'true') {
    switch (req.query.id) {
      case 'token':
        res.status(200).json({code: 0, data: {token: 'YjNiNDZhNDE0NmU3OWQ1N2M1ZDMyMjdjZGY5NDlmMGU='}});
        break;
      case 'friends':
        const friends = [12767, 72104, 3090720, 8047632, 37098548, 37544886, 85819912, 96240239, 98787659, 106286557,
         185273255, 282022569, 286202861, 295389941, 298030824, 322989832, 324042405, 333655227, 343836794, 346030399,
         354097337, 354758619, 355778940, 358201006, 361417173, 363763511, 374807175, 384755513, 389623999, 389874232,
         395253454, 397872234, 398217201, 400067046, 404658588, 405966864, 413092448, 415240328, 424674753, 425503913,
         429986248, 430942433, 430967737, 432258909, 433751453, 433849994, 434605889, 440004933, 444281310, 446836354,
         448189858, 449328503, 453899463, 454258954, 454719152, 455568817, 457843315, 473999894, 474899885, 479611798,
         480015861, 481731410, 481823642, 485821637, 496300862, 506418994, 510272506, 512787858, 513778858, 515586861,
         518970483, 519795342, 521209706, 523423693, 526705577, 535362423, 597242903, 598397900, 624532985, 1498694594,
         2095498218];
        var info = [];
        (async () => {
          let users;
          for (let i = 0; i >= friends.length - 1; i += 50) {
            users = friends.slice(i, i + 50);
            await fetch(`https://api.vc.bilibili.com/account/v1/user/cards?uids=${users.join(',')}&build=0&mobi_app=web`).then(resp => resp.json()).then(json => info = info.concat(json.data));
          }
        })();
        var html = '';
        info.sort(() => 0.5 - Math.random()).forEach(h => html += `<div class="link-grid-container">
<img class="link-grid-image" src="${encodeHTML(h.face)}" referrerpolicy="no-referrer" />
<p>${encodeHTML(h.name)}</p><p>${encodeHTML(h.sign)}</p>
<a target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${h.mid}"></a>
</div>`);
        res.status(200).json({code: 0, data: html});
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
  } else {
    res.status(404).send(HTML({title: 'API 不存在', data: `
      <span class="face animate__animated animate__fadeIn animate__faster">:(</span>
      <p class="content animate__animated animate__fadeIn animate__faster">您访问的 API 不存在，请到<a href="/api/">首页</a>查看目前可用的 API 列表</p>
      <p class="home animate__animated animate__fadeIn animate__faster"><a href="/api/">返回 API 首页</a></p>
      <span class="tips animate__animated animate__fadeIn animate__faster">NOT_FOUND</span>`}));
  }
};
