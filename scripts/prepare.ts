import type { APIResponse, NavData } from '../assets/types.d.ts';

import { getEnv } from '@vercel/functions';
import { Redis } from '@upstash/redis';

const systemEnv = getEnv();
console.log(`Node.js 版本：${process.version}`);
if (!systemEnv.VERCEL || systemEnv.VERCEL_ENV === 'development') process.exit(0);

const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
      sessionData = process.env.SESSDATA!, csrf = process.env.bili_jct!;

const ujson = await (await fetch('https://api.bilibili.com/x/web-interface/nav', { headers: { Cookie: `SESSDATA=${sessionData}; bili_jct=${csrf}`, Origin: 'https://www.bilibili.com', Referer: 'https://www.bilibili.com/', 'User-Agent': userAgent } })).json() as APIResponse<NavData>;
if (ujson.code !== 0) {
  console.error('获取账号登录信息失败，请重新设置 Cookie');
  console.error(ujson);
  process.exit(1);
}
const { mid } = ujson.data;
console.log(`当前登录 B 站账号 UID：${mid}`);

const redis = Redis.fromEnv();
await redis.set('wbiKeys', {
  mid,
  imgKey: /.*\/(?<key>[^.]+)\.?/.exec(ujson.data.wbi_img.img_url)?.groups?.key || '7cd084941338484aae1ad9425b84077c',
  subKey: /.*\/(?<key>[^.]+)\.?/.exec(ujson.data.wbi_img.sub_url)?.groups?.key || '4932caff0ff746eab6f01bf08b70ac45',
  updatedTimestamp: Date.now(),
});
