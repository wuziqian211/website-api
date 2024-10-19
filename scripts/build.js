/**
 * @template T
 * @typedef {import('../assets/types').APIResponse<T>} APIResponse<T>
 */

/**
 * @typedef {import('../assets/types').NavData} NavData
 */

import { kv } from '@vercel/kv';

if (process.env.VERCEL_URL?.startsWith('localhost')) process.exit(0);

const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';
const { SESSDATA, bili_jct: csrf } = process.env;

/** @type {APIResponse<NavData>} */
const ujson = await (await fetch('https://api.bilibili.com/x/web-interface/nav', { headers: { Cookie: `SESSDATA=${SESSDATA}; bili_jct=${csrf}`, Origin: 'https://www.bilibili.com', Referer: 'https://www.bilibili.com/', 'User-Agent': userAgent } })).json();
if (ujson.code !== 0) {
  console.error('获取账号登录信息失败，请重新设置 Cookie');
  process.exit(1);
}
const { mid } = ujson.data;
console.log(`当前登录 B 站账号 UID：${mid}`);

let webId = '';
const spaceHTMLText = await (await fetch(`https://space.bilibili.com/${mid}`, { headers: { Cookie: `SESSDATA=${SESSDATA}; bili_jct=${csrf}; DedeUserID=${mid}`, Origin: 'https://www.bilibili.com', Referer: 'https://www.bilibili.com/', 'User-Agent': userAgent } })).text();
const renderData = /<script id="__RENDER_DATA__"[^>]*>(.*)<\/script>/.exec(spaceHTMLText);
if (renderData && renderData[1]) {
  /** @type {{ access_id: string }} */
  const rjson = JSON.parse(decodeURIComponent(renderData[1]));
  webId = rjson.access_id;
}

await kv.set('requestInfo', {
  userAgent,
  SESSDATA,
  csrf,
  mid,
  wbiKeys: {
    imgKey: ujson.data.wbi_img.img_url.replace(/^(?:.*\/)?([^.]+)(?:\..*)?$/, '$1'),
    subKey: ujson.data.wbi_img.sub_url.replace(/^(?:.*\/)?([^.]+)(?:\..*)?$/, '$1'),
    webId,
  },
  updatedTimestamp: Date.now(),
});
