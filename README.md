# wuziqian211's Blog API

<https://api.wuziqian211.top/api/>

## 功能

本存储库中的 API 主要为 [wuziqian211's Blog](https://wuziqian211.top/) 的一些功能提供服务，但是有一些公开的 API：

- [获取哔哩哔哩用户信息及关注、粉丝数](https://api.wuziqian211.top/api/getuser)
- [获取哔哩哔哩视频信息及数据](https://api.wuziqian211.top/api/getvideo)

上面的 API 允许任何合法网站与程序等调用，但是服务器不会存储任何访问记录，哔哩哔哩用户及视频的信息、数据等，仅转发与处理哔哩哔哩 API 的返回数据。

上面的 API 仅当您无法直接调用 B 站的 API 时使用，如果您能正常调用 B 站的 API，最好直接使用 B 站的 API，会更快一些。

对本存储库中大部分文件及文件夹的介绍：

| 文件或文件夹 | 功能 |
| ------------ | ---- |
| api/ | 本文件夹包含所有 API，在网站上访问里面的文件会调用对应 API |
| api/404.mjs | 网站上的页面不存在时调用的 API |
| api/getuser.mjs | 获取哔哩哔哩用户信息及关注、粉丝数 |
| api/getvideo.mjs | 获取哔哩哔哩视频信息及数据 |
| api/index.mjs | 网站的首页 |
| api/modules.mjs | 仅供内部使用，非公开使用（但公开源代码） |
| assets/ | 本文件夹包含静态文件，在网站上访问里面的文件会显示文件内容 |
| assets/[1-5]-[22\|33].jpg, assets/6-33.jpg | 哔哩哔哩的一些随机头像 |
| assets/error.mp4 | 获取视频数据时，如果视频不可用，就返回本文件数据 |
| assets/female.png, assets/male.png | 表示性别的符号 |
| assets/level_[0-6]	.svg, assets/level_6+.svg | 哔哩哔哩用户的等级 |
| assets/main.js | 页面使用的 JS |
| assets/noface.jpg | 获取用户头像时，如果用户不存在，就返回本文件数据 |
| assets/nopic.png | 获取视频封面时，如果视频不存在，就返回本文件数据 |
| assets/style.css | 页面使用的 CSS |
| assets/utils.mjs | 所有 API 使用的功能文件 |
| package.json, package-lock.json | 供 Node.js 使用 |
| vercel.json | Vercel（API 服务商）的配置文件 |

## 特性

本存储库中的所有 API 文件均为 ECMAScript modules 文件，使用 [Vercel](https://vercel.com/) 部署。

与大部分其他网站的 API 不同，本存储库中的 API 既可以返回 HTML，也可以返回 JSON，有些 API 可以返回图片。

一般情况下，这些 API 会根据客户端的 HTTP 请求头中 “accept” 与 “sec-fetch-dest” 的值，返回不同类型的数据。规则如下：

- 如果 “accept” 的值包含 “html”，或者 “sec-fetch-dest” 的值为 “document”（比如用浏览器直接访问这些 API 的页面），就返回 HTML 数据；
- 对于 “获取哔哩哔哩用户信息及关注、粉丝数”（api/getuser.mjs）及 “获取哔哩哔哩视频信息及数据”（api/getvideo.mjs）API 来说，如果 “accept” 的值包含 “image”，或者 “sec-fetch-dest” 的值为 “image”（比如在 HTML `<img>` 标签的 “src” 参数填写其中一个 API 的网址），那么这些 API 会返回头像或封面数据；
- 否则，返回 JSON。

## 用法

### api/getuser.mjs

本 API 可以获取指定 B 站用户的信息及关注、粉丝数。

| 请求参数（区分大小写） | 说明 |
| ---------------------- | ---- |
| mid | 您想获取用户信息及关注、粉丝数的用户的 UID。 |
| allow_redirect | 如果存在本参数，则获取头像数据时可能会重定向到 B 站服务器的头像地址。 |
| type | 如果本参数的值为 “info”，只返回用户信息；如果值为 “follow”，只返回用户关注、粉丝数；否则都返回。 |

| 响应代码（填写参数时） | 说明 |
| ---------------------- | ---- |
| 200 | 用户存在 |
| 307（注意**不是** 302） | 临时重定向 |
| 404 | 用户不存在 |
| 429（注意**不是** 412） | 请求太频繁，已被 B 站的 API 拦截 |
| 400 | UID 无效，或者因其他原因请求失败 |

### api/getvideo.mjs

本 API 可以获取指定 B 站视频的信息及数据。

**注意：获取的视频的数据仅供预览，要下载视频，请使用其他工具，本 API 只能获取大小不超过 5 MB（1 MB = 1000 KB）的视频。**

| 请求参数（区分大小写） | 说明 |
| ---------------------- | ---- |
| vid | 您想获取视频信息或数据的 AV 或 BV 号。 |
| cid | 该视频分 P 的 cid。 |
| p | 该视频的第几个分 P。 |
| allow_redirect | 如果存在本参数，则获取封面数据时可能会重定向到 B 站服务器的封面地址。 |
| type | 如果本参数的值为 “data”，则返回视频数据，否则返回视频信息。 |

其中，“cid” 与 “p” **只能在获取视频数据时填写，且只能填写其中一个**，如果不填，默认为 P1。

| 响应代码（填写参数时） | 说明 |
| ---------------------- | ---- |
| 200 | 视频存在 |
| 307（注意**不是** 302） | 临时重定向 |
| 403 | 需登录才能获取该视频的信息，本 API 无能为力 |
| 404 | 视频不存在 |
| 429（注意**不是** 412） | 请求太频繁，已被 B 站的 API 拦截 |
| 400 | 视频 ID 无效，或者因其他原因请求失败 |
| 500 或 504 | 视频太大，本 API 无法发送数据 |