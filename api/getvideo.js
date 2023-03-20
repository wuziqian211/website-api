/* 获取哔哩哔哩视频 / 剧集 / 番剧信息及数据
 *   https://api.wuziqian211.top/api/getvideo
 * 使用说明见https://github.com/wuziqian211/website-api/blob/main/README.md#%E8%8E%B7%E5%8F%96%E5%93%94%E5%93%A9%E5%93%94%E5%93%A9%E8%A7%86%E9%A2%91--%E5%89%A7%E9%9B%86--%E7%95%AA%E5%89%A7--%E5%BD%B1%E8%A7%86%E4%BF%A1%E6%81%AF%E5%8F%8A%E6%95%B0%E6%8D%AE。
 * 作者：wuziqian211（https://wuziqian211.top/）
 */
import { readFileSync } from 'node:fs';
import * as utils from '../assets/utils.js';
const file = fileName => readFileSync(new URL(fileName, import.meta.url));
const handler = async (req, res) => {
  const startTime = req.__startTime__ || performance.now();
  try {
    const sendHTML = data => res.setHeader('Content-Type', 'text/html; charset=utf-8').send(utils.renderHTML({ ...data, startTime, desc: '获取哔哩哔哩视频 / 剧集 / 番剧信息及数据', body: `
      ${data.content}
      <form>
        <div><label for="vid">请输入您想要获取信息的视频 / 剧集 / 番剧的编号（仅输入数字会被视为 AV 号）：</label></div>
        <div><input type="text" name="vid" id="vid" value="${data.vid}" placeholder="av…/BV…/md…/ss…/ep…" pattern="^(?:BV|bv|Bv|bV)1[1-9A-HJ-NP-Za-km-z]{2}4[1-9A-HJ-NP-Za-km-z]1[1-9A-HJ-NP-Za-km-z]7[1-9A-HJ-NP-Za-km-z]{2}$|^(?:AV|av|Av|aV|MD|md|Md|mD|SS|ss|Ss|sS|EP|ep|Ep|eP)?[0-9]+$" maxlength="12" autocomplete="off" spellcheck="false" /> <input type="submit" value="获取" /></div>
      </form>` })); // 将HTML数据发送到客户端
    const accept = utils.getAccept(req);
    const { type, vid } = utils.getVidType(req.query.vid); // 判断用户给出的编号类型
    let headers;
    if (req.query.cookie === 'true' || req.query.force != undefined) {
      headers = { Cookie: `SESSDATA=${process.env.SESSDATA}; bili_jct=${process.env.bili_jct}`, Origin: 'https://www.bilibili.com', Referer: 'https://www.bilibili.com/', 'User-Agent': process.env.userAgent };
    } else {
      headers = { Origin: 'https://www.bilibili.com', Referer: 'https://www.bilibili.com/', 'User-Agent': process.env.userAgent };
    }
    if (type === 1) { // 编号为AV号或BV号
      const zones = { 1: '动画', 3: '音乐', 4: '游戏', 5: '娱乐', 11: '电视剧', 13: '番剧', 17: '游戏|单机游戏', 19: '游戏|Mugen', 20: '舞蹈|宅舞', 21: '生活|日常', 22: '鬼畜|鬼畜调教', 23: '电影', 24: '动画|MAD·AMV', 25: '动画|MMD·3D', 26: '鬼畜|音MAD', 27: '动画|综合', 28: '音乐|原创音乐', 29: '音乐|三次元音乐', 30: '音乐|VOCALOID·UTAU', 31: '音乐|翻唱', 32: '番剧|完结动画', 33: '番剧|连载动画', 36: '知识', 37: '纪录片|人文·历史', 47: '动画|短片·手书·配音', 51: '番剧|资讯', 59: '音乐|演奏', 65: '游戏|网络游戏', 71: '娱乐|综艺', 75: '动物圈|动物综合', 76: '美食|美食制作', 83: '电影|其他国家', 85: '影视|小剧场', 86: '动画|特摄', 95: '科技|数码', 119: '鬼畜', 121: '游戏|GMV', 122: '知识|野生技能协会', 124: '知识|社科·法律·心理', 126: '鬼畜|人力VOCALOID', 127: '鬼畜|教程演示', 129: '舞蹈', 130: '音乐|音乐综合', 136: '游戏|音游', 137: '娱乐|明星综合', 138: '生活|搞笑', 145: '电影|欧美电影', 146: '电影|日本电影', 147: '电影|华语电影', 152: '番剧|官方延伸', 153: '国创|国产动画', 154: '舞蹈|舞蹈综合', 155: '时尚', 156: '舞蹈|舞蹈教程', 157: '时尚|美妆护肤', 158: '时尚|穿搭', 159: '时尚|时尚潮流', 160: '生活', 161: '生活|手工', 162: '生活|绘画', 164: '运动|健身', 167: '国创', 168: '国创|国产原创相关', 169: '国创|布袋戏', 170: '国创|资讯', 171: '游戏|电子竞技', 172: '游戏|手机游戏', 173: '游戏|桌游棋牌', 176: '汽车|汽车生活', 177: '纪录片', 178: '纪录片|科学·探索·自然', 179: '纪录片|军事', 180: '纪录片|社会·美食·旅行', 181: '影视', 182: '影视|影视杂谈', 183: '影视|影视剪辑', 184: '影视|预告·资讯', 185: '电视剧|国产剧', 187: '电视剧|海外剧', 188: '科技', 193: '音乐|MV', 195: '国创|动态漫·广播剧', 198: '舞蹈|街舞', 199: '舞蹈|明星舞蹈', 200: '舞蹈|中国舞', 201: '知识|科学科普', 202: '资讯', 203: '资讯|热点', 204: '资讯|环球', 205: '资讯|社会', 206: '资讯|综合', 207: '知识|财经商业', 208: '知识|校园学习', 209: '知识|职业职场', 210: '动画|手办·模玩', 211: '美食', 212: '美食|美食侦探', 213: '美食|美食测评', 214: '美食|田园美食', 215: '美食|美食记录', 216: '鬼畜|鬼畜剧场', 217: '动物圈', 218: '动物圈|喵星人', 219: '动物圈|汪星人', 220: '动物圈|大熊猫', 221: '动物圈|野生动物', 222: '动物圈|爬宠', 223: '汽车', 227: '汽车|购车攻略', 228: '知识|人文历史', 229: '知识|设计创意', 230: '科技|软件应用', 231: '科技|计算机技术', 232: '科技|科工机械', 233: '科技|极客DIY', 234: '运动', 235: '运动|篮球', 236: '运动|竞技体育', 237: '运动|运动文化', 238: '运动|运动综合', 239: '生活|家居房产', 240: '汽车|摩托车', 241: '娱乐|娱乐杂谈', 242: '娱乐|粉丝创作', 243: '音乐|乐评盘点', 244: '音乐|音乐教学', 245: '汽车|赛车', 246: '汽车|改装玩车', 247: '汽车|新能源车', 248: '汽车|房车', 249: '运动|足球', 250: '生活|出行', 251: '生活|三农', 252: '时尚|仿妆cos', 253: '动画|动漫杂谈' }; // 来自https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/video/video_zone.md
      const states = { 0: '该视频已开放浏览', 1: '该视频通过审核，但可能会受到限制', '-1': '该视频正在审核', '-2': '该视频已被退回', '-3': '该视频已被锁定', '-4': '该视频已被锁定', '-5': '该视频已被锁定', '-6': '该视频正在审核', '-7': '该视频正在审核', '-8': '该视频正在审核', '-9': '该视频正在审核', '-10': '该视频正在审核', '-11': '该视频在投稿时可能出现问题，没有发布', '-12': '该视频在投稿时可能出现问题，没有发布', '-13': '该视频在投稿时可能出现问题，没有发布', '-14': '该视频已被删除', '-15': '该视频正在审核', '-16': '该视频在投稿时可能出现问题，没有发布', '-20': '该视频没有投稿', '-30': '该视频正在审核', '-40': '该视频已审核通过，但没有发布', '-100': '该视频已被删除' }; // 来自https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/video/attribute_data.md
      let json;
      if (req.query.force != undefined) {
        const rjson = await (await fetch('https://api.bilibili.com/x/click-interface/web/heartbeat', { method: 'POST', body: new URLSearchParams({ bvid: vid, played_time: 0, realtime: 0, start_ts: Math.floor(Date.now() / 1000), type: 3, dt: 2, play_type: 1, csrf: process.env.bili_jct }), headers })).json();
        await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒
        const hjson = await (await fetch('https://api.bilibili.com/x/v2/history?pn=1&ps=30', { headers })).json();
        const info = hjson.data?.find(h => h.type === 3 && h.sub_type === 0 && h.bvid === vid);
        if (hjson.code === 0 && info) {
          json = { code: 0, message: '0', data: { desc_v2: null, cid: null, dimension: null, premiere: null, pages: null, subtitle: null, honor_reply: null, need_jump_bv: false, ...info, stat: { ...info.stat, evaluation: '', argue_msg: '', vt: undefined, vv: undefined }, favorite: undefined, type: undefined, sub_type: undefined, device: undefined, page: undefined, count: undefined, progress: undefined, view_at: undefined, kid: undefined, business: undefined, redirect_link: undefined } };
        } else {
          json = { code: -404, message: '啥都木有' };
        }
      } else {
        json = await (await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${vid}`, { headers })).json(); // （备用）获取更详细的信息https://api.bilibili.com/x/web-interface/view/detail?bvid=BV1……
      }
      if (req.query.type === 'data') { // 获取视频数据
        let cid;
        if (json.code === 0 && json.data.pages) {
          if (/^\d+$/.test(req.query.cid)) { // 用户提供的cid有效
            cid = json.data.pages.find(p => p.cid === parseInt(req.query.cid)) && parseInt(req.query.cid); // 若API返回的pages中包含用户提供的cid，则将变量“cid”设置为用户提供的cid
          } else if (/^\d+$/.test(req.query.p)) { // 用户提供的参数“p”有效
            cid = json.data.pages[parseInt(req.query.p) - 1]?.cid; // 将变量“cid”设置为该P的cid
          } else {
            cid = json.data.cid; // 将变量“cid”设置为该视频第1P的cid
          }
        }
        if (cid) { // 视频有效
          const qualities = [6, 16, 32, 64]; // 240P、360P、480P、720P
          let url;
          for (const q of qualities) {
            const vjson = await (await fetch(`https://api.bilibili.com/x/player/playurl?bvid=${vid}&cid=${cid}&qn=${q}&fnval=${q === 6 ? 1 : 0}&fnver=0`, { headers })).json(); // （备用）添加html5=1参数获取到的视频链接似乎可以不限Referer
            if (vjson.code === 0 && vjson.data.durl[0].size <= 4500000) { // 视频地址获取成功，且视频大小不超过4.5MB（1MB=1000KB；Vercel限制API返回的内容不能超过4.5MB）
              url = vjson.data.durl[0].url;
            } else {
              break;
            }
          }
          if (url) { // 视频地址获取成功
            const t = url.slice(0, url.indexOf('?'));
            const filename = encodeURIComponent(`${json.data.title}.${t.slice(t.lastIndexOf('.') + 1)}`); // 设置视频的文件名
            const resp = await fetch(url, { headers });
            if (resp.ok) {
              res.status(200).setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate').setHeader('Content-Type', resp.headers.get('Content-Type')).setHeader('Content-Disposition', `inline; filename=${filename}`).send(Buffer.from(await resp.arrayBuffer()));
            } else {
              if (req.headers['sec-fetch-dest'] === 'video') {
                res.status(200).setHeader('Content-Type', 'video/mp4').send(file('../assets/error.mp4'));
              } else {
                res.status(404);
                sendHTML({ title: '获取视频数据失败', content: '获取视频数据失败，请稍后重试 awa', vid: req.query.vid });
              }
            }
          } else { // 视频地址获取失败
            if (req.headers['sec-fetch-dest'] === 'video') {
              res.status(200).setHeader('Content-Type', 'video/mp4').send(file('../assets/error.mp4'));
            } else {
              res.status(500);
              sendHTML({ title: '无法获取视频数据', content: `
                抱歉，由于您想要获取数据的视频无法下载（原因可能是视频太大，或者版权、地区限制，等等），本 API 无法向您发送这个视频的数据哟 qwq<br />
                如果您想下载视频，最好使用其他工具哟 awa`, vid: req.query.vid });
            }
          }
        } else { // 视频无效
          if (req.headers['sec-fetch-dest'] === 'video') {
            res.status(200).setHeader('Content-Type', 'video/mp4').send(file('../assets/error.mp4'));
          } else {
            res.status(404);
            sendHTML({ title: '无法获取视频数据', content: '获取视频数据失败，您想获取的视频可能不存在，或者您可能输入了错误的分 P 哟 qwq', vid: req.query.vid });
          }
        }
      } else { // 获取视频信息
        if (accept === 1) { // 客户端想要获取类型为“文档”的数据，返回HTML
          switch (json.code) {
            case 0:
              const content = `
                <div class="info">
                  <div class="wrap">
                    <a target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/video/${vid}/"><img class="vpic" alt title="${utils.encodeHTML(json.data.title)}" src="${utils.toHTTPS(json.data.pic)}" referrerpolicy="no-referrer" /></a>
                  </div>
                  <div>
                    <a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/video/${vid}/">${utils.encodeHTML(json.data.title)}</a><br />
                    <span class="description">av${json.data.aid}，${utils.encodeHTML(json.data.bvid)}</span><br />
                    ${json.data.state !== 0 ? `<span class="notice"><img class="notice-icon" alt /> ${states[json.data.state] || '该视频存在未知问题'}</span><br />` : ''}
                    ${json.data.forward ? `<span class="notice"><img class="notice-icon" alt /> 本视频已与 <a href="?vid=${utils.toBV(json.data.forward)}">${utils.toBV(json.data.forward)}</a> 撞车</span><br />` : ''}
                    ${json.data.stat.argue_msg ? `<span class="notice"><img class="notice-icon" alt /> ${utils.encodeHTML(json.data.stat.argue_msg)}</span><br />` : ''}
                    ${json.data.videos}P ${utils.getTime(json.data.duration)} ${json.data.copyright === 1 ? '自制' : json.data.copyright === 2 ? '转载' : ''}${json.data.rights?.no_reprint ? '（未经作者授权，禁止转载）' : ''}${json.data.stat.evaluation ? ` ${utils.encodeHTML(json.data.stat.evaluation)}` : ''}${json.data.stat.now_rank ? ` 当前排名第 ${json.data.stat.now_rank} 名` : ''}${json.data.stat.his_rank ? ` 历史最高排名第 ${json.data.stat.his_rank} 名` : ''}
                  </div>
                </div>
                <strong>分区：</strong>${zones[json.data.tid]?.replace(/\|/g, ' &gt; ') || utils.encodeHTML(json.data.tname)}<br />
                <s><strong>投稿时间：</strong>${utils.getDate(json.data.ctime)}<span class="description">（可能不准确）</span></s><br />
                <strong>发布时间：</strong>${utils.getDate(json.data.pubdate)}
                <table>
                  <thead>
                    <tr><th>播放</th><th>弹幕</th><th>评论</th><th>点赞</th><th>投币</th><th>收藏</th><th>分享</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>${utils.getNumber(json.data.stat.view)}</td><td>${utils.getNumber(json.data.stat.danmaku)}</td><td>${utils.getNumber(json.data.stat.reply)}</td><td>${utils.getNumber(json.data.stat.like)}</td><td>${utils.getNumber(json.data.stat.coin)}</td><td>${utils.getNumber(json.data.stat.favorite)}</td><td>${utils.getNumber(json.data.stat.share)}</td></tr>
                  </tbody>
                </table>
                ${json.data.rights?.is_cooperation && json.data.staff ? `
                <strong>合作成员：</strong>
                ${json.data.staff.map(u => `
                <div class="info">
                  <div class="wrap">
                    <a target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${u.mid}">
                      <img class="face" alt title="${utils.encodeHTML(u.name)}" src="${utils.toHTTPS(u.face)}" referrerpolicy="no-referrer" />
                      ${u.official.type === 0 ? '<img class="face-icon icon-personal" alt title="UP 主认证" />' : u.official.type === 1 ? '<img class="face-icon icon-business" alt title="机构认证" />' : u.vip.status ? '<img class="face-icon icon-big-vip" alt title="大会员" />' : ''}
                    </a>
                  </div>
                  <div>
                    <a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${u.mid}">${utils.encodeHTML(u.name)}</a> ${utils.encodeHTML(u.title)}<br />
                    ${[0, 1].includes(u.official.type) ? `<img class="official-icon icon-${u.official.type === 0 ? 'personal" alt title="UP 主认证" /> <strong class="text-personal">bilibili UP 主' : 'business" alt title="机构认证" /> <strong class="text-business">bilibili 机构'}认证：</strong>${utils.encodeHTML(u.official.title)}<br />` : ''}
                    <strong>粉丝数：</strong>${utils.getNumber(u.follower)}
                  </div>
                </div>`).join('')}` : `
                <div class="info">
                  <strong>UP 主：</strong>
                  <div class="wrap">
                    <a target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${json.data.owner.mid}">
                      <img class="face" alt title="${utils.encodeHTML(json.data.owner.name)}" src="${utils.toHTTPS(json.data.owner.face)}" referrerpolicy="no-referrer" />
                    </a>
                  </div>
                  <a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${json.data.owner.mid}">${utils.encodeHTML(json.data.owner.name)}</a>
                </div>`}
                ${json.data.pages ? json.data.pages.map(p => `
                <div class="info">
                  <strong>P${p.page}：</strong>
                  ${p.first_frame ? `
                  <div class="wrap">
                    <img class="ppic" alt title="${utils.encodeHTML(p.part)}" src="${utils.toHTTPS(p.first_frame)}" referrerpolicy="no-referrer" />
                  </div>` : ''}
                  <div>
                    <strong>${utils.encodeHTML(p.part)}</strong> ${utils.getTime(p.duration)}<br />
                    <strong>cid：</strong>${p.cid}
                  </div>
                </div>`).join('') : ''}
                <strong>简介：</strong><br />
                ${utils.encodeHTML(json.data.desc)}`;
              res.status(200);
              sendHTML({ title: `${utils.encodeHTML(json.data.title)} 的信息`, style: utils.renderExtraStyle(utils.toHTTPS(json.data.pic)), content, vid: req.query.vid });
              break;
            case -412:
              res.status(429).setHeader('Retry-After', '600');
              sendHTML({ title: '请求被拦截', content: '抱歉，本 API 的请求已被 B 站拦截，请等一段时间后重试 awa', vid: req.query.vid });
              break;
            case -404:
            case 62002:
              res.status(404);
              sendHTML({ title: '视频不存在', content: '您想要获取信息的视频不存在！QAQ', vid: req.query.vid });
              break;
            case -403:
              if (['true', 'false'].includes(req.query.cookie)) {
                res.status(403);
                sendHTML({ title: '获取视频信息需登录', content: `
                  这个视频需要登录才能获取信息！QwQ<br />
                  您可以在 B 站获取<a target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/video/${vid}/">这个视频的信息</a>哟 awa`, vid: req.query.vid });
              } else {
                await handler({ __startTime__: startTime, headers: { accept: 'text/html' }, query: { cookie: 'true', vid: req.query.vid } }, res);
              }
              break;
            case 62003:
              res.status(404);
              sendHTML({ title: '视频待发布', content: '视频已审核通过，但还没有发布，请等一下再获取信息吧 awa', vid: req.query.vid });
              break;
            case 62004:
              res.status(404);
              sendHTML({ title: '视频审核中', content: '视频正在审核中，请等一下再获取信息吧 awa', vid: req.query.vid });
              break;
            default:
              res.status(400);
              sendHTML({ title: '获取视频信息失败', content: '获取视频信息失败，请稍后重试 awa', vid: req.query.vid });
          }
        } else if (accept === 2) { // 客户端想要获取类型为“图片”的数据，获取封面
          switch (json.code) {
            case 0:
              if (req.query.allow_redirect != undefined) { // 允许本API重定向到B站服务器的封面地址
                res.status(307).setHeader('Location', utils.toHTTPS(json.data.pic)).json({ code: 307, data: { url: utils.toHTTPS(json.data.pic) } });
              } else {
                const filename = encodeURIComponent(`${json.data.title} 的封面.${utils.toHTTPS(json.data.pic).split('.').at(-1)}`); // 设置封面的文件名
                const resp = await fetch(utils.toHTTPS(json.data.pic)); // 获取B站服务器存储的封面
                if (resp.status === 200) {
                  res.status(200).setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate').setHeader('Content-Type', resp.headers.get('Content-Type')).setHeader('Content-Disposition', `inline; filename=${filename}`).send(Buffer.from(await resp.arrayBuffer()));
                } else {
                  res.status(404).setHeader('Content-Type', 'image/png').send(file('../assets/nocover.png'));
                }
              }
              break;
            case -403:
              if (['true', 'false'].includes(req.query.cookie)) {
                res.status(404).setHeader('Content-Type', 'image/png').send(file('../assets/nocover.png'));
              } else {
                await handler({ headers: { accept: 'image/*' }, query: { cookie: 'true', vid: req.query.vid } }, res);
              }
              break;
            default:
              res.status(404).setHeader('Content-Type', 'image/png').send(file('../assets/nocover.png')); // 返回默认封面
          }
        } else { // 否则，返回JSON
          switch (json.code) {
            case 0:
              res.status(200).json({ code: 0, message: json.message, data: json.data });
              break;
            case -412:
              res.status(429).setHeader('Retry-After', '600').json({ code: -412, message: json.message });
              break;
            case -404:
            case 62002:
            case 62003:
            case 62004:
              res.status(404).json({ code: json.code, message: json.message });
              break;
            case -403:
              if (['true', 'false'].includes(req.query.cookie)) {
                res.status(403).json({ code: -403, message: json.message });
              } else {
                await handler({ headers: {}, query: { cookie: 'true', vid: req.query.vid } }, res);
              }
              break;
            default:
              res.status(400).json({ code: json.code, message: json.message });
          }
        }
      }
    } else if (type === 2) { // 编号为mdid
      const json = await (await fetch(`https://api.bilibili.com/pgc/review/user?media_id=${vid}`, { headers })).json();
      if (accept === 1) { // 客户端想要获取类型为“文档”的数据，返回HTML
        switch (json.code) {
          case 0:
            const content = `
              <div class="info">
                <div class="wrap">
                  <a target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/bangumi/media/md${vid}"><img class="spic" alt title="${utils.encodeHTML(json.result.media.title)}" src="${utils.toHTTPS(json.result.media.cover)}" referrerpolicy="no-referrer" /></a>
                </div>
                <div>
                  <a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/bangumi/media/md${vid}">${utils.encodeHTML(json.result.media.title)}</a><br />
                  ${utils.encodeHTML(json.result.media.type_name)} ${utils.encodeHTML(json.result.media.new_ep?.index_show || '')} ${json.result.media.areas.map(a => utils.encodeHTML(a.name)).join('、')} ${json.result.media.rating ? `${json.result.media.rating.score ? `${json.result.media.rating.score.toFixed(1)} 分` : ''}（共 ${json.result.media.rating.count} 人评分）` : '暂无评分'}
                </div>
              </div>
              ${json.result.media.new_ep?.id ? `<strong>最新一话：</strong><a href="?vid=ep${json.result.media.new_ep.id}">${utils.encodeHTML(json.result.media.new_ep.index)}</a><br />` : ''}
              ${json.result.media.season_id ? `<a href="?vid=ss${json.result.media.season_id}">点击此处查看更多信息</a>` : ''}`;
            res.status(200);
            sendHTML({ title: `${utils.encodeHTML(json.result.media.title)} 的信息`, style: utils.renderExtraStyle(utils.toHTTPS(json.result.media.cover)), content, vid: req.query.vid });
            break;
          case -412:
            res.status(429).setHeader('Retry-After', '600');
            sendHTML({ title: '请求被拦截', content: '抱歉，本 API 的请求已被 B 站拦截，请等一段时间后重试 awa', vid: req.query.vid });
            break;
          case -404:
            res.status(404);
            sendHTML({ title: '剧集不存在', content: '您想要获取信息的剧集不存在！QAQ', vid: req.query.vid });
            break;
          default:
            res.status(400);
            sendHTML({ title: '获取剧集信息失败', content: '获取剧集信息失败，请稍后重试 awa', vid: req.query.vid });
        }
      } else if (accept === 2) { // 客户端想要获取类型为“图片”的数据，获取封面
        if (json.code === 0) {
          if (req.query.allow_redirect != undefined) { // 允许本API重定向到B站服务器的封面地址
            res.status(307).setHeader('Location', utils.toHTTPS(json.result.media.cover)).json({ code: 307, data: { url: utils.toHTTPS(json.result.media.cover) } });
          } else {
            const filename = encodeURIComponent(`${json.result.media.title} 的封面.${utils.toHTTPS(json.result.media.cover).split('.').at(-1)}`); // 设置封面的文件名
            const resp = await fetch(utils.toHTTPS(json.result.media.cover)); // 获取B站服务器存储的封面
            if (resp.status === 200) {
              res.status(200).setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate').setHeader('Content-Type', resp.headers.get('Content-Type')).setHeader('Content-Disposition', `inline; filename=${filename}`).send(Buffer.from(await resp.arrayBuffer()));
            } else {
              res.status(404).setHeader('Content-Type', 'image/png').send(file('../assets/nocover.png'));
            }
          }
        } else { // 剧集信息获取失败，返回默认封面
          res.status(404).setHeader('Content-Type', 'image/png').send(file('../assets/nocover.png'));
        }
      } else { // 否则，返回JSON
        switch (json.code) {
          case 0:
            res.status(200).json({ code: 0, message: json.message, result: json.result });
            break;
          case -412:
            res.status(429).setHeader('Retry-After', '600').json({ code: -412, message: json.message });
            break;
          case -404:
            res.status(404).json({ code: -404, message: json.message });
            break;
          default:
            res.status(400).json({ code: json.code, message: json.message });
        }
      }
    } else if ([3, 4].includes(type)) { // 编号为ssid或epid
      const json = await (await fetch(`https://api.bilibili.com/pgc/view/web/season?${type === 3 ? 'season' : 'ep'}_id=${vid}`, { headers })).json();
      if (req.query.type === 'data') { // 获取剧集中某一集的视频数据
        let P;
        if (json.code === 0) {
          if (type === 3) { // 编号为ssid
            if (/^\d+$/.test(req.query.cid)) { // 用户提供的cid有效
              P = json.result.episodes.find(p => p.cid === parseInt(req.query.cid)); // 在正片中寻找cid与用户提供的cid相同的一集
              if (!P) { // 在正片中没有找到
                for (const s of json.result.section) { // 在其他部分寻找
                  P = s.episodes.find(p => p.cid === parseInt(req.query.cid));
                  if (P) break;
                }
              }
            } else if (type === 3 && /^\d+$/.test(req.query.p)) { // 用户提供的参数“p”有效
              P = json.result.episodes[parseInt(req.query.p) - 1];
            } else {
              P = json.result.episodes[0]; // 第1集
            }
          } else { // 编号为epid
            P = json.result.episodes.find(p => p.id === vid); // 在正片中寻找epid与用户提供的epid相同的一集
            if (!P) { // 在正片中没有找到
              for (const s of json.result.section) { // 在其他部分寻找
                P = s.episodes.find(p => p.id === vid);
                if (P) break;
              }
            }
          }
        }
        if (P) { // 剧集有效
          const qualities = [6, 16, 32, 64]; // 240P、360P、480P、720P
          let url;
          for (const q of qualities) {
            const vjson = await (await fetch(`https://api.bilibili.com/pgc/player/web/playurl?bvid=${P.bvid}&ep_id=${P.id}&cid=${P.cid}&qn=${q}&fnval=${q === 6 ? 1 : 0}&fnver=0`, { headers })).json();
            if (vjson.code === 0 && vjson.result.durl[0].size <= 4500000) { // 视频地址获取成功，且视频大小不超过4.5MB（1MB=1000KB；Vercel限制API返回的内容不能超过4.5MB）
              url = vjson.result.durl[0].url;
            } else {
              break;
            }
          }
          if (url) { // 视频地址获取成功
            const t = url.slice(0, url.indexOf('?'));
            const filename = encodeURIComponent(`${json.result.title}.${t.slice(t.lastIndexOf('.') + 1)}`); // 设置视频的文件名
            const resp = await fetch(url, { headers });
            if (resp.ok) {
              res.status(200).setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate').setHeader('Content-Type', resp.headers.get('Content-Type')).setHeader('Content-Disposition', `inline; filename=${filename}`).send(Buffer.from(await resp.arrayBuffer()));
            } else {
              if (req.headers['sec-fetch-dest'] === 'video') {
                res.status(200).setHeader('Content-Type', 'video/mp4').send(file('../assets/error.mp4'));
              } else {
                res.status(404);
                sendHTML({ title: '获取视频数据失败', content: '获取这一集的视频数据失败，请稍后重试 awa', vid: req.query.vid });
              }
            }
          } else { // 视频地址获取失败
            if (req.headers['sec-fetch-dest'] === 'video') {
              res.status(200).setHeader('Content-Type', 'video/mp4').send(file('../assets/error.mp4'));
            } else {
              res.status(500);
              sendHTML({ title: '无法获取视频数据', content: `
                抱歉，由于您想要获取的这一集的视频无法下载（原因可能是视频太大，或者版权、地区限制，等等），本 API 无法向您发送这一集的视频的数据哟 qwq<br />
                如果您想下载这一集，最好使用其他工具哟 awa`, vid: req.query.vid });
            }
          }
        } else { // 剧集无效
          if (req.headers['sec-fetch-dest'] === 'video') {
            res.status(200).setHeader('Content-Type', 'video/mp4').send(file('../assets/error.mp4'));
          } else {
            res.status(404);
            sendHTML({ title: '无法获取视频数据', content: '获取这一集的视频数据失败，您想获取的剧集可能不存在，或者您可能输入了错误的集号哟 qwq', vid: req.query.vid });
          }
        }
      } else { // 获取剧集信息
        if (accept === 1) { // 客户端想要获取类型为“文档”的数据，返回HTML
          switch (json.code) {
            case 0:
              const content = `
                <div class="info">
                  <div class="wrap">
                    <a target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/bangumi/play/${type === 3 ? 'ss' : 'ep'}${vid}"><img class="spic" alt title="${utils.encodeHTML(json.result.title)}" src="${utils.toHTTPS(json.result.cover)}" referrerpolicy="no-referrer" /></a>
                  </div>
                  <div>
                    <a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/bangumi/play/${type === 3 ? 'ss' : 'ep'}${vid}">${utils.encodeHTML(json.result.title)}</a><br />
                    ${json.result.type === 1 ? '番剧' : json.result.type === 2 ? '电影' : json.result.type === 3 ? '纪录片' : json.result.type === 4 ? '国创' : json.result.type === 5 ? '电视剧' : json.result.type === 7 ? '综艺' : ''}${json.result.total === -1 ? '' : ` 已完结，共 ${json.result.total} 集`} ${json.result.areas.map(a => utils.encodeHTML(a.name)).join('、')} ${json.result.rating?.score ? `${json.result.rating.score.toFixed(1)} 分（共 ${json.result.rating.count} 人评分）` : '暂无评分'}
                  </div>
                </div>
                <strong>发布时间：</strong>${utils.encodeHTML(json.result.publish.pub_time)}
                <table>
                  <thead>
                    <tr><th>播放</th><th>弹幕</th><th>评论</th><th>点赞</th><th>投币</th><th>收藏</th><th>分享</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>${utils.getNumber(json.result.stat.views)}</td><td>${utils.getNumber(json.result.stat.danmakus)}</td><td>${utils.getNumber(json.result.stat.reply)}</td><td>${utils.getNumber(json.result.stat.likes)}</td><td>${utils.getNumber(json.result.stat.coins)}</td><td>${utils.getNumber(json.result.stat.favorites)}</td><td>${utils.getNumber(json.result.stat.share)}</td></tr>
                  </tbody>
                </table>
                ${json.result.up_info ? `
                <div class="info">
                  <strong>UP 主：</strong>
                  <div class="wrap">
                    <a target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${json.result.up_info.mid}">
                      <img class="face" alt title="${utils.encodeHTML(json.result.up_info.uname)}" src="${utils.toHTTPS(json.result.up_info.avatar)}" referrerpolicy="no-referrer" />
                    </a>
                  </div>
                  <div>
                    <a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${json.result.up_info.mid}">${utils.encodeHTML(json.result.up_info.uname)}</a><br />
                    <strong>粉丝数：</strong>${utils.getNumber(json.result.up_info.follower)}
                  </div>
                </div>` : ''}
                <strong>正片：</strong>
                ${json.result.episodes.map(p => `
                <div class="info">
                  <div>
                    <a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/bangumi/play/ep${p.id}">${utils.encodeHTML(p.title)} ${utils.encodeHTML(p.long_title)}</a> ${utils.getTime(p.duration / 1000)}<br />
                    <strong>发布时间：</strong>${utils.getDate(p.pub_time)}<br />
                    <strong>cid：</strong>${p.cid}；<a href="?vid=${p.bvid}">${p.bvid}</a>
                  </div>
                </div>`).join('')}
                ${json.result.section ? json.result.section.map(s => `
                <strong>${utils.encodeHTML(s.title)}：</strong>
                ${s.episodes.map(p => `
                <div class="info">
                  <div>
                    <a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="${p.status === 0 ? `?vid=${p.link.slice(p.link.lastIndexOf('/') + 1)}` : `https://www.bilibili.com/bangumi/play/ep${p.id}`}">${utils.encodeHTML(p.title)} ${utils.encodeHTML(p.long_title)}</a>${p.status === 0 ? '' : ` ${utils.getTime(p.duration / 1000)}`}<br />
                    ${p.status === 0 ? '' : `
                    <strong>发布时间：</strong>${utils.getDate(p.pub_time)}<br />
                    <strong>cid：</strong>${p.cid}；<a href="?vid=${p.bvid}">${p.bvid}</a>`}
                  </div>
                </div>`).join('')}`).join('') : ''}
                <strong>简介：</strong><br />
                ${utils.encodeHTML(json.result.evaluate)}`;
              res.status(200);
              sendHTML({ title: `${utils.encodeHTML(json.result.title)} 的信息`, style: utils.renderExtraStyle(utils.toHTTPS(json.result.cover)), content, vid: req.query.vid });
              break;
            case -412:
              res.status(429).setHeader('Retry-After', '600');
              sendHTML({ title: '请求被拦截', content: '抱歉，本 API 的请求已被 B 站拦截，请等一段时间后重试 awa', vid: req.query.vid });
              break;
            case -404:
              res.status(404);
              sendHTML({ title: '番剧不存在', content: '您想要获取信息的番剧不存在！QAQ', vid: req.query.vid });
              break;
            default:
              res.status(400);
              sendHTML({ title: '获取番剧信息失败', content: '获取番剧信息失败，请稍后重试 awa', vid: req.query.vid });
          }
        } else if (accept === 2) { // 客户端想要获取类型为“图片”的数据，获取封面
          if (json.code === 0) {
            if (req.query.allow_redirect != undefined) { // 允许本API重定向到B站服务器的封面地址
              res.status(307).setHeader('Location', utils.toHTTPS(json.result.cover)).json({ code: 307, data: { url: utils.toHTTPS(json.result.cover) } });
            } else {
              const filename = encodeURIComponent(`${json.result.title} 的封面.${utils.toHTTPS(json.result.cover).split('.').at(-1)}`); // 设置封面的文件名
              const resp = await fetch(utils.toHTTPS(json.result.cover)); // 获取B站服务器存储的封面
              if (resp.status === 200) {
                res.status(200).setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate').setHeader('Content-Type', resp.headers.get('Content-Type')).setHeader('Content-Disposition', `inline; filename=${filename}`).send(Buffer.from(await resp.arrayBuffer()));
              } else {
                res.status(404).setHeader('Content-Type', 'image/png').send(file('../assets/nocover.png'));
              }
            }
          } else { // 视频信息获取失败，返回默认封面
            res.status(404).setHeader('Content-Type', 'image/png').send(file('../assets/nocover.png'));
          }
        } else { // 否则，返回JSON
          switch (json.code) {
            case 0:
              res.status(200).json({ code: 0, message: json.message, result: json.result });
              break;
            case -412:
              res.status(429).setHeader('Retry-After', '600').json({ code: -412, message: json.message });
              break;
            case -404:
              res.status(404).json({ code: -404, message: json.message });
              break;
            default:
              res.status(400).json({ code: json.code, message: json.message });
          }
        }
      }
    } else { // 编号无效
      if (accept === 1) { // 客户端想要获取类型为“文档”的数据，返回HTML
        if (!req.query.vid) { // 没有设置参数“vid”
          res.status(200);
          sendHTML({ title: '获取哔哩哔哩视频 / 剧集 / 番剧信息及数据', content: `
            本 API 可以获取指定 B 站视频、剧集、番剧的信息及数据。<br />
            基本用法：https://${req.headers.host}/api/getvideo?vid=<span class="notice">您想获取信息的视频、剧集、番剧的编号</span><br />
            更多用法见<a target="_blank" rel="noopener external nofollow noreferrer" href="https://github.com/${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}/blob/${process.env.VERCEL_GIT_COMMIT_REF}/README.md#%E8%8E%B7%E5%8F%96%E5%93%94%E5%93%A9%E5%93%94%E5%93%A9%E8%A7%86%E9%A2%91--%E5%89%A7%E9%9B%86--%E7%95%AA%E5%89%A7--%E5%BD%B1%E8%A7%86%E4%BF%A1%E6%81%AF%E5%8F%8A%E6%95%B0%E6%8D%AE">本站的使用说明</a>。`, vid: '' });
        } else { // 设置了“vid”参数但无效
          res.status(400);
          sendHTML({ title: '编号无效', content: `
            您输入的编号无效！<br />
            请输入一个正确的编号吧 awa`, vid: '' });
        }
      } else if (accept === 2) { // 客户端想要获取类型为“图片”的数据，返回默认封面
        res.status(400).setHeader('Content-Type', 'image/png').send(file('../assets/nocover.png'));
      } else { // 否则，返回JSON
        res.status(400).json({ code: -400, message: '请求错误' });
      }
    }
  } catch (e) {
    res.status(500).send(utils.render500(startTime, e));
  }
};
export default handler;
