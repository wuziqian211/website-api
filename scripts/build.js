/**
 * @template T
 * @typedef {import('../assets/types').APIResponse<T>} APIResponse<T>
 */

/**
 * @typedef {import('../assets/types').NavData} NavData
 */

import { Redis } from '@upstash/redis';

if (process.env.VERCEL_URL?.startsWith('localhost')) process.exit(0);

const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      { SESSDATA, bili_jct: csrf } = process.env;

/** @type {APIResponse<NavData>} */
const ujson = await (await fetch('https://api.bilibili.com/x/web-interface/nav', { headers: { Cookie: `SESSDATA=${SESSDATA}; bili_jct=${csrf}`, Origin: 'https://www.bilibili.com', Referer: 'https://www.bilibili.com/', 'User-Agent': userAgent } })).json();
if (ujson.code !== 0) {
  console.error('获取账号登录信息失败，请重新设置 Cookie');
  process.exit(1);
}
const { mid } = ujson.data;
console.log(`当前登录 B 站账号 UID：${mid}`);

const redis = Redis.fromEnv();
await redis.set('wbiKeys', {
  mid,
  imgKey: ujson.data.wbi_img.img_url.replace(/^(?:.*\/)?([^.]+)(?:\..*)?$/, '$1'),
  subKey: ujson.data.wbi_img.sub_url.replace(/^(?:.*\/)?([^.]+)(?:\..*)?$/, '$1'),
  updatedTimestamp: Date.now(),
});
