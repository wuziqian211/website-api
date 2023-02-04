/* 获取哔哩哔哩视频 / 番剧信息（强制获取）
 *   https://api.wuziqian211.top/api/getvideo_force
 * 使用说明见https://github.com/wuziqian211/website-api/blob/main/README.md。
 * 作者：wuziqian211（https://wuziqian211.top/）
 */
import { readFileSync } from 'node:fs';
import * as utils from '../assets/utils.js';
const file = fileName => readFileSync(new URL(fileName, import.meta.url));
const handler = async (req, res) => {
  const startTime = req.__startTime__ || performance.now();
  try {
    const sendHTML = data => res.setHeader('Content-Type', 'text/html; charset=utf-8').send(utils.renderHTML({ ...data, startTime, desc: '获取哔哩哔哩视频信息（强制获取）', body: `
      ${data.content}
      <form>
        <div><label for="vid">请输入您想要获取信息的视频 / 剧集 / 番剧的编号（仅输入数字会被视为 AV 号）：</label></div>
        <div><input type="text" name="vid" id="vid" value="${data.vid}" placeholder="av…/BV…/ep…" pattern="^(?:BV|bv|Bv|bV)1[1-9A-HJ-NP-Za-km-z]{2}4[1-9A-HJ-NP-Za-km-z]1[1-9A-HJ-NP-Za-km-z]7[1-9A-HJ-NP-Za-km-z]{2}$|^(?:AV|av|Av|aV|EP|ep|Ep|eP)?[0-9]+$" maxlength="12" autocomplete="off" spellcheck="false" /> <input type="submit" value="获取" /></div>
      </form>` })); // 将HTML数据发送到客户端
    const accept = utils.getAccept(req);
    const { type, vid } = utils.getVidType(req.query.vid); // 判断用户给出的编号类型
    const headers = { Cookie: `SESSDATA=${process.env.SESSDATA}; bili_jct=${process.env.bili_jct}`, Origin: 'https://www.bilibili.com', Referer: 'https://www.bilibili.com/', 'User-Agent': process.env.userAgent };
    if (type === 1) { // 编号为AV号或BV号
      const rjson = await (await fetch('https://api.bilibili.com/x/click-interface/web/heartbeat', { method: 'POST', body: new URLSearchParams({ bvid: vid, played_time: 0, realtime: 0, start_ts: Math.floor(Date.now() / 1000), type: 3, dt: 2, play_type: 1, csrf: process.env.bili_jct }), headers })).json();
      if (rjson.code === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const hjson = await (await fetch('https://api.bilibili.com/x/web-interface/history/cursor?max=0&business=&view_at=0&type=archive&ps=30', { headers })).json();
        if (hjson.code === 0) {
          const info = hjson.data.list.find(h => h.history.business === 'archive' && h.history.bvid === vid);
          if (info) {
            if (accept === 1) { // 客户端想要获取类型为“文档”的数据，返回HTML
              const content = `
                <div class="info">
                  <div class="wrap">
                    <a target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/video/${vid}/"><img class="vpic" alt title="${utils.encodeHTML(info.title)}" src="${utils.toHTTPS(info.cover)}" referrerpolicy="no-referrer" /></a>
                  </div>
                  <div>
                    <a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/video/${vid}/">${utils.encodeHTML(info.title)}</a><br />
                    av${info.history.oid}，${utils.encodeHTML(info.history.bvid)}<br />
                    ${info.videos}P
                  </div>
                </div>
                <strong>分区：</strong>${utils.encodeHTML(info.tag_name)}<br />
                <strong>UP 主：</strong><a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://space.bilibili.com/${info.author_mid}"><img class="face" alt title="${utils.encodeHTML(info.author_name)}" src="${utils.toHTTPS(info.author_face)}" referrerpolicy="no-referrer" /> ${utils.encodeHTML(info.author_name)}</a>`;
              res.status(200);
              sendHTML({ title: `${utils.encodeHTML(info.title)} 的信息`, style: utils.renderExtraStyle(utils.toHTTPS(info.cover)), content, vid: req.query.vid });
            } else if (accept === 2) { // 客户端想要获取类型为“图片”的数据，获取封面
              if (req.query.allow_redirect != undefined) { // 允许本API重定向到B站服务器的封面地址
                res.status(307).setHeader('Location', utils.toHTTPS(info.cover)).json({ code: 307, data: { url: utils.toHTTPS(info.cover) } });
              } else {
                const filename = encodeURIComponent(`${info.title} 的封面.${utils.toHTTPS(info.cover).split('.').at(-1)}`); // 设置封面的文件名
                const resp = await fetch(utils.toHTTPS(info.cover)); // 获取B站服务器存储的封面
                if (resp.status === 200) {
                  res.status(200).setHeader('Content-Type', resp.headers.get('Content-Type')).setHeader('Content-Disposition', `inline; filename=${filename}`).send(Buffer.from(await resp.arrayBuffer()));
                } else {
                  res.status(404).setHeader('Content-Type', 'image/png').send(file('../assets/nocover.png'));
                }
              }
            } else { // 否则，返回JSON
              res.status(200).json({ code: 0, data: info });
            }
          } else {
            sendHTML({ title: '获取视频信息失败', content: '获取这个视频的信息失败 qwq', vid: req.query.vid });
          }
        } else {
          sendHTML({ title: '获取视频信息失败', content: '获取这个视频的信息失败 qwq', vid: req.query.vid });
        }
      } else {
        sendHTML({ title: '获取视频信息失败', content: '获取这个视频的信息失败 qwq', vid: req.query.vid });
      }
    } else if (type === 4) { // 编号为epid
      const rjson = await (await fetch('https://api.bilibili.com/x/click-interface/web/heartbeat', { method: 'POST', body: new URLSearchParams({ epid: vid, played_time: 0, realtime: 0, start_ts: Math.floor(Date.now() / 1000), type: 4, dt: 2, play_type: 1, csrf: process.env.bili_jct }), headers })).json();
      if (rjson.code === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const hjson = await (await fetch('https://api.bilibili.com/x/web-interface/history/cursor?max=0&business=&view_at=0&type=archive&ps=30', { headers })).json();
        if (hjson.code === 0) {
          const info = hjson.data.list.find(h => h.history.business === 'pgc' && h.history.epid === vid);
          if (info) {
            if (accept === 1) { // 客户端想要获取类型为“文档”的数据，返回HTML
              const content = `
                <div class="info">
                  <div class="wrap">
                    <a target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/bangumi/play/ep${vid}"><img class="spic" alt title="${utils.encodeHTML(info.title)}" src="${utils.toHTTPS(info.cover)}" referrerpolicy="no-referrer" /></a>
                  </div>
                  <div>
                    <a class="title" target="_blank" rel="noopener external nofollow noreferrer" href="https://www.bilibili.com/bangumi/play/ep${vid}">${utils.encodeHTML(info.title)}</a><br />
                    ${info.badge} 共 ${info.total} 集
                  </div>
                </div>`;
              res.status(200);
              sendHTML({ title: `${utils.encodeHTML(info.title)} 的信息`, style: utils.renderExtraStyle(utils.toHTTPS(info.cover)), content, vid: req.query.vid });
            } else if (accept === 2) { // 客户端想要获取类型为“图片”的数据，获取封面
              if (req.query.allow_redirect != undefined) { // 允许本API重定向到B站服务器的封面地址
                res.status(307).setHeader('Location', utils.toHTTPS(info.cover)).json({ code: 307, data: { url: utils.toHTTPS(info.cover) } });
              } else {
                const filename = encodeURIComponent(`${info.title} 的封面.${utils.toHTTPS(info.cover).split('.').at(-1)}`); // 设置封面的文件名
                const resp = await fetch(utils.toHTTPS(info.cover)); // 获取B站服务器存储的封面
                if (resp.status === 200) {
                  res.status(200).setHeader('Content-Type', resp.headers.get('Content-Type')).setHeader('Content-Disposition', `inline; filename=${filename}`).send(Buffer.from(await resp.arrayBuffer()));
                } else {
                  res.status(404).setHeader('Content-Type', 'image/png').send(file('../assets/nocover.png'));
                }
              }
            } else { // 否则，返回JSON
              res.status(200).json({ code: 0, data: info });
            }
          } else {
            sendHTML({ title: '获取番剧信息失败', content: '获取这部番剧的信息失败 qwq', vid: req.query.vid });
          }
        } else {
          sendHTML({ title: '获取番剧信息失败', content: '获取这部番剧的信息失败 qwq', vid: req.query.vid });
        }
      } else {
        sendHTML({ title: '获取番剧信息失败', content: '获取这部番剧的信息失败 qwq', vid: req.query.vid });
      }             
    } else { // 编号无效
      if (accept === 1) { // 客户端想要获取类型为“文档”的数据，返回HTML
        if (!req.query.vid) { // 没有设置参数“vid”
          res.status(200);
          sendHTML({ title: '获取哔哩哔哩视频信息（强制获取）', content: `
            本 API 可以强制获取指定 B 站视频的信息。<br />
            基本用法：https://${req.headers.host}/api/getvideo_force?vid=<span class="notice">您想获取信息的视频的 AV/BV 号</span><br />
            更多用法见<a target="_blank" rel="noopener external nofollow noreferrer" href="https://github.com/${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}/blob/${process.env.VERCEL_GIT_COMMIT_REF}/README.md">本站的使用说明</a>。`, vid: '' });
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
