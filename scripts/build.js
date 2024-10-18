import { kv } from '@vercel/kv';

const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';
const { SESSDATA, csrf } = process.env;

const ujson = await (await fetch('https://api.bilibili.com/x/web-interface/nav', { headers: { Cookie: `SESSDATA=${SESSDATA}; bili_jct=${csrf}`, Origin: 'https://www.bilibili.com', Referer: 'https://www.bilibili.com/', 'User-Agent': userAgent } })).json();
const { mid } = ujson.data;
console.log(`当前登录账号 UID：${mid}`);

let webId = '';
const spaceHTMLText = await (await fetch(`https://space.bilibili.com/${mid}`, { headers: { Cookie: `SESSDATA=${SESSDATA}; bili_jct=${csrf}; DedeUserID=${mid}`, Origin: 'https://www.bilibili.com', Referer: 'https://www.bilibili.com/', 'User-Agent': userAgent } })).text();
const renderData = /<script id="__RENDER_DATA__"[^>]*>(.*)<\/script>/.exec(spaceHTMLText);
if (renderData && renderData[1]) {
  const rjson = JSON.parse(decodeURIComponent(renderData[1]));
  webId = rjson.access_id;
}

await kv.set('requestInfo', {
  userAgent,
  SESSDATA: process.env.SESSDATA,
  csrf: process.env.csrf,
  mid: ujson.data.mid,
  wbiKeys: {
    imgKey: ujson.data.wbi_img.img_url.replace(/^(?:.*\/)?([^.]+)(?:\..*)?$/, '$1'),
    subKey: ujson.data.wbi_img.sub_url.replace(/^(?:.*\/)?([^.]+)(?:\..*)?$/, '$1'),
    webId,
  },
  updatedTimestamp: Date.now(),
});
