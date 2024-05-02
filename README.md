# wuziqian211's Blog API

<https://api.yumeharu.top/api/>

- [介绍](#介绍)
- [详细用法](#详细用法)
  - [获取哔哩哔哩用户信息](#获取哔哩哔哩用户信息)
  - [获取哔哩哔哩视频 / 剧集 / 番剧信息及数据](#获取哔哩哔哩视频--剧集--番剧信息及数据)
- [附录](#附录)
  - [目录结构](#目录结构)
  - [回复数据类型规则](#回复数据类型规则)
  - [回复的 JSON 对象数据结构](#回复的-json-对象数据结构)
- [许可证](#许可证)

## 介绍

本项目的 API 主要为 [wuziqian211's Blog](https://www.yumeharu.top/) 的一些功能提供服务。

对于大多数 API：

- **API 类型**：[RESTful API](https://www.restapitutorial.com/)
- **请求方式**：一般为 [GET](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Methods/GET)（理论上可以使用任何请求方式）
- **请求参数**：[URL 查询字符串](https://developer.mozilla.org/zh-CN/docs/Learn/Common_questions/Web_mechanics/What_is_a_URL#%E5%8F%82%E6%95%B0)（如 `?mid=425503913&type=html`），**参数名区分大小写**
- **回复数据类型**：默认情况下回复 [JSON](https://developer.mozilla.org/zh-CN/docs/Glossary/JSON)，但存在特殊情况，比如当您直接使用浏览器打开本 API 的页面时可能会回复 [HTML](https://developer.mozilla.org/zh-CN/docs/Web/HTML)，详见[回复数据类型规则](#回复数据类型规则)
- **HTTP 状态代码**：

| 状态代码 | 说明 |
| :------: | ---- |
| [`200`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status/200) | 请求成功 |
| [`307`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status/307)（**不是** [`302`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status/302)） | 临时重定向（**例如**：您在获取图片数据时，在 `type` 参数中带上了 `_redirect` 后缀） |
| [`308`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status/308)（**不是** [`301`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status/301)） | 永久重定向 |
| [`403`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status/403) | 获取该信息的权限不足（仅出现在 “获取哔哩哔哩视频 / 剧集 / 番剧信息及数据” API 中，表示获取这个视频的信息需要登录 B 站账号） |
| [`404`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status/404) | 您想获取信息的目标（用户、视频等）不存在，或者 API 不存在 |
| [`429`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status/429)（**不是** [`412`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status/412)） | 请求太频繁 |
| [`500`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status/500) 或 [`504`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status/504) | API 调用异常或超时（对于 “获取哔哩哔哩视频 / 剧集 / 番剧信息及数据” API 来说，该状态代码还可能表示视频太大，API 无法回复视频数据） |
| [`400`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status/400) | 因参数无效（或其他原因）而请求失败 |

同时，<https://api.yumeharu.top/api/> 中的 API 强制使用 [HTTPS 协议](https://developer.mozilla.org/zh-CN/docs/Glossary/HTTPS)。这是 [Vercel](https://vercel.com/) 的行为，您在其他地方部署 API 不一定会强制使用 HTTPS 协议。

您可以使用以下公开的 API：

- [获取哔哩哔哩用户信息](#获取哔哩哔哩用户信息)（<https://api.yumeharu.top/api/getuser>）
- [获取哔哩哔哩视频 / 剧集 / 番剧信息及数据](#获取哔哩哔哩视频--剧集--番剧信息及数据)（<https://api.yumeharu.top/api/getvideo>）

这些 API 允许任何合法网站与程序等调用，而 API 的服务器不会存储任何访问记录与哔哩哔哩用户、视频、剧集、番剧等的信息、数据等，仅转发与处理哔哩哔哩 API 的回复数据。

> [!TIP]
> 本项目的 API 可以给您带来许多好处：
> 
> 1. 您基本不需要添加任何 “风控参数” 即可成功调用 API，因为添加 “风控参数” 等操作由 API 的服务器自动进行；
> 2. 本项目的 API 会频繁更新，以确保能够给用户带来更好的体验；
> 3. API 可以给您简化一些操作，**例如**：您在引用图片时，直接填写图片链接为 [`https://api.yumeharu.top/api/getuser?mid=2&type=avatar`](https://api.yumeharu.top/api/getuser?mid=2&type=avatar) 即可引用 B 站上 UID 为 2 的用户的头像。

> [!NOTE]
> - 这些 API 的服务器不在中国大陆。如果您可以正常调用 B 站的 API，最好直接使用 B 站的 API，可以更快回复您所需要的信息。
> - 由于本 API 可以返回多种类型的数据，因此**建议您始终带 `type` 参数调用 API**，详见[回复数据类型规则](#通过-type-参数判断)。

> [!CAUTION]
> - **请勿将这些 API 用于非法目的！这些 API 的目的是方便大家的使用，并且可能会随时停止开发或删档。因利用这些 API 而造成的不良影响及后果与本项目无关。**
> - 本项目为开源项目，不接受任何形式的索取或催单行为，更不容许存在付费内容。

## 详细用法

### 获取哔哩哔哩用户信息

<https://api.yumeharu.top/api/getuser>

本 API 可以获取指定 B 站用户的信息。**目前本 API 始终带 Cookie 获取用户信息。**

#### 请求参数

| 请求参数 | 说明 |
| :------: | ---- |
| `mid` | 您想获取用户信息的用户的 UID，只能是正整数。<br />**示例**：[`425503913`](https://api.yumeharu.top/api/getuser?mid=425503913)、[`2`](https://api.yumeharu.top/api/getuser?mid=2) |
| `type` | 本 API 回复的数据类型，详见[回复数据类型规则](#通过-type-参数判断)。本 API 对此参数进行了扩展：<br />如果本参数的值为 `image`、`face` 或 `avatar`，则默认情况下，成功时回复用户的头像数据，失败时回复默认头像数据；此条件下若加上 `_errorwhenfailed` 后缀，则失败时根据 [`Accept` 标头对应的回复数据类型](#通过-accept-标头判断)提示获取头像失败；若加上 `_redirect` 后缀，则成功时重定向到 B 站服务器的头像地址；可以添加多个后缀。<br />本参数的值不区分大小写。 |

如果没有填写 `mid` 参数，且本 API 将回复图片数据，那么本 API 就回复 B 站的随机头像数据。

### 获取哔哩哔哩视频 / 剧集 / 番剧信息及数据

<https://api.yumeharu.top/api/getvideo>

本 API 可以获取指定 B 站视频、剧集、番剧的信息及数据。

> [!WARNING]
> 本 API 获取到的视频数据**仅供预览**，如果您想下载视频，请使用其他工具，本 API 只能获取大小不超过 4.5 MB（在这里 1 MB = 1000 KB）的视频。

#### 请求参数

| 请求参数 | 说明 |
| :------: | ---- |
| `vid` | 您想获取信息或数据的视频、剧集、番剧的编号。用前缀为 `av` 或没有前缀的 AV 号，前缀为 `BV` 的 BV 号，前缀为 `md`、`ss`、`ep` 的剧集、番剧等的编号都是可以的（编号的前缀不区分大小写）。<br />**示例**：[`10429`](https://api.yumeharu.top/api/getvideo?vid=10429)、[`av106`](https://api.yumeharu.top/api/getvideo?vid=av106)、[`BV17x411w7KC`](https://api.yumeharu.top/api/getvideo?vid=BV17x411w7KC)、[`ss29325`](https://api.yumeharu.top/api/getvideo?vid=ss29325) |
| `cid` | 该视频的某个分 P 的 cid，或者该剧集中某一集的 cid，只能是正整数。**仅在获取视频数据时使用本参数。** |
| `p` | 该视频的第几个分 P，或者该剧集中的第几集，只能是正整数。**仅在获取视频数据时使用本参数。** |
| `type` | 本 API 回复的数据类型，详见[回复数据类型规则](#通过-type-参数判断)。本 API 对此参数进行了扩展：<br />如果本参数的值为 `video` 或 `data`，则默认情况下，成功时回复视频数据，失败时**以视频形式**提示视频不存在，并且失败时**若请求标头 `Sec-Fetch-Dest` 的值为 `video`（名称与值均不区分大小写），则响应 200 状态代码**，否则响应表示错误的状态代码（**例如**：`404`、`400`、`500` 等；这样做的目的是让播放器能够加载提示 “视频不存在” 的视频，不会因本 API 响应表示错误的状态代码而不加载视频）；此条件下若加上 `_errorwhenfailed` 后缀，则失败时若请求标头 `Sec-Fetch-Dest` 的值为 `video`（名称与值均不区分大小写），则**以视频形式**提示视频不存在（且**响应 200 状态代码**），否则**以 HTML 形式**提示视频不存在（响应表示错误的状态代码）。<br />值为 `image`、`cover` 或 `pic`，则默认情况下，成功时回复视频封面数据，失败时回复默认封面数据；此条件下若加上 `_errorwhenfailed` 后缀，则失败时根据 [`Accept` 标头对应的回复数据类型](#通过-accept-标头判断)提示获取封面失败；若加上 `_redirect` 后缀，则成功时重定向到 B 站服务器的封面地址；可以添加多个后缀。<br />本参数的值不区分大小写。 |
| `cookie` | 获取信息时是否带 Cookie。如果本参数的值为 `true`，则强制带 Cookie 获取信息；如果值为 `false`，则强制不带 Cookie 获取信息；否则先尝试不带 Cookie 获取信息，如果失败，再带 Cookie 获取信息。本参数的值不区分大小写。<br />**示例**：获取仅对登录用户可见的视频信息：[BV16s411f7x<!-- 分隔符，防止 “x” 被自动转换成 “×” -->2](https://api.yumeharu.top/api/getvideo?vid=BV16s411f7x2&cookie=true) |
| `force` | 指定本 API 应该强制获取视频信息，仅适用于获取视频的信息（编号为 AV 号或 BV 号）。如果**存在**本参数，那么本 API 会尽可能尝试获取到视频信息，无论这个视频现在是否存在（会自动设置 `cookie=true` 参数）。<br />**示例**：获取被退回或锁定的视频信息：[av10388](https://api.yumeharu.top/api/getvideo?vid=10388&force=true)、[av10492](https://api.yumeharu.top/api/getvideo?vid=10492&force=true) |

其中，`cid` 与 `p` 参数**仅在获取数据时被使用，且只能填写其中一个**；若这些参数均未填写，则默认为该视频的第 1 个分 P，或该剧集中的第 1 集。

> [!NOTE]
> 当您想要本 API 回复视频的数据（设置 `type=video` 或 `type=data` 参数）时，本 API 为了尽可能获取到更高清晰度的视频，**会自动设置 `cookie=true` 参数**，您可以手动设置 `cookie=false` 参数以覆盖此行为。
>
> 然而，**如果您设置了 `force` 参数，由于本 API 必须要带 Cookie 才能强制获取视频信息，因此您手动设置 `cookie=false` 参数会报错**。

## 附录

本项目的所有 API 文件均为 [ECMAScript modules](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules) 文件，使用 [Vercel](https://vercel.com/) 部署，不使用任何框架。

目前，有些 API 是 [Serverless Functions](https://vercel.com/docs/functions/runtimes#node.js)，使用 JavaScript 编写；有些是 [Edge Functions](https://vercel.com/docs/functions/runtimes#edge)，使用 TypeScript 编写。

**如果您想从本项目部署 API，请将环境变量 `userAgent` 设置为浏览器的用户代理，并设置环境变量 `SESSDATA` 与 `bili_jct` 为一个可用的 B 站账号的 Cookie**。若您想在除 Vercel 以外的平台部署本项目的 API，您可能需要改动一些文件。

### 回复数据类型规则

与大部分其他网站的 API 不同，本项目的 API 在调用后，既可以回复 HTML，也可以回复 JSON，有些 API 可以回复图片与视频数据。

#### 通过 `type` 参数判断

当您指定 `type` 参数时，API 会根据 `type` 参数的值判断回复数据类型（**参数名区分大小写**，值不区分大小写；有些 API 会对这个列表进行扩展；需要 API 支持您指定的回复数据类型）：

| `type` 参数 | 回复数据类型 |
| :---------: | :----------: |
| `json` | JSON |
| `html` 或 `page` | HTML 页面 |
| `image` 或 `img` | 图片 |
| `video` | 视频 |

#### 通过 `Sec-Fetch-Dest` 标头判断

如果上述过程无法判断回复数据类型，那么就根据 [HTTP 请求头 `Sec-Fetch-Dest`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Sec-Fetch-Dest) 的值判断回复数据类型（标头名称与值均不区分大小写，需要 API 支持您指定的回复数据类型）：

| `Sec-Fetch-Dest` 标头 | 回复数据类型 |
| :-------------------: | :----------: |
| `json` | JSON |
| `document`、`frame` 或 `iframe` | HTML 页面 |
| `image` | 图片 |
| `video` | 视频 |

#### 通过 `Accept` 标头判断

若上述过程仍无法判断回复数据类型，则根据 [HTTP 请求头 `Accept`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Accept) 的值判断回复数据类型（标头名称与值均不区分大小写，需要 API 支持您指定的回复数据类型）：

- 当 `Accept` 的值包含 `json` 时，回复 **JSON**；
- 当 `Accept` 的值包含 `html`（**例如**：使用浏览器直接访问 API 的页面）时，回复 **HTML** 页面；
- 当 `Accept` 的值包含 `image`（**例如**：在 [HTML `<img>` 标签](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/img)的 `src` 参数中直接填写 API 的地址）时，回复**图片**数据；
- 当 `Accept` 的值包含 `video`（**例如**：在 [HTML `<video>` 标签](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/video)中 [`<source>` 标签](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/source)的 `src` 参数直接填写 API 的地址）时，回复**视频**数据；

#### 默认回复 JSON

若上述过程无法判断回复数据类型，则回复 JSON。

### 回复的 JSON 对象数据结构

根对象：

| 字段 | 类型 | 说明 |
| :--: | :--: | ---- |
| `code` | number | 返回值。常见的返回值有：<br />0：成功<br />-400：请求错误（**例如**：参数不合法）<br />-403：访问权限不足（**例如**：未使用 Cookie 获取信息）<br />-404：啥都木有<br />-412：请求被拦截 |
| `message` | string | 错误信息，若请求成功则一般为 `0` 或 `success`。 |
| `data` | 有效时：object<br />无效时：null | 回复数据本体。对于 “获取哔哩哔哩用户信息” 与 “获取哔哩哔哩视频 / 剧集 / 番剧信息及数据” API 的数据本体，请自行查找对应的 B 站 API 的说明，此处不再进行说明。 |
| `extInfo` | object | API 返回的扩展信息，包括调用所耗时间、数据来源、错误类型等。 |

`extInfo` 对象：

| 字段 | 类型 | 说明 |
| :--: | :--: | ---- |
| `errType` | string | 错误类型，仅在调用 API 失败时出现。<br />`upstreamServerRespError`：上游服务器响应错误（成功获取到了 URL，但请求时上游服务器回复了错误响应代码）<br />`upstreamServerNoData`：上游服务器未回复本体数据（上游服务器 API 回复了表示失败的 `code`）<br />`upstreamServerInvalidRequest`：对上游服务器的请求无效（**例如**：参数不合法）<br />`upstreamServerForbidden`：对访问上游服务器的本体数据的权限不足（**例如**：未使用 Cookie 获取信息）<br />`upstreamServerRequestBanned`：对上游服务器的请求被拦截（**例如**：在短时间内频繁调用 API）<br />`internalServerInvalidRequest`：本 API 服务器接收到的请求无效（参数不合法）<br />`notFoundInHistory`：在历史记录中未找到指定视频的信息，仅在 “获取哔哩哔哩视频 / 剧集 / 番剧信息及数据” API 中使用 |
| `upstreamServerUrl` | string | 上游服务器 URL，仅当 `errType` 值为 `upstreamServerRespError` 时出现。 |
| `upstreamServerRespStatus` | number | 上游服务器的响应状态代码，仅当 `errType` 值为 `upstreamServerRespError` 时出现。 |
| `spaceAccInfoCode` | number | B 站 API `x/space/wbi/acc/info` 的返回值，仅在 “获取哔哩哔哩用户信息” API 中调用该 API 失败时出现。 |
| `spaceAccInfoMessage` | string | B 站 API `x/space/wbi/acc/info` 的错误信息，仅在 “获取哔哩哔哩用户信息” API 中调用该 API 失败时出现。 |
| `dataSource` | string\[\] 或 string | 回复数据的来源。 |
| `apiExecTime` | number | 调用 API 所耗时间（单位：毫秒）。 |

<details>
<summary>查看响应示例</summary>

```jsonc
{
  "code": 0, // 返回值
  "message": "0", // 错误信息
  "data": { // 数据本体（此处不再进行相关字段的说明）
    "mid": 2,
    "name": "碧诗",
    "approve": false,
    "sex": "男",
    "face": "https://i2.hdslb.com/bfs/face/ef0457addb24141e15dfac6fbf45293ccf1e32ab.jpg",
    "face_nft": 0,
    "face_nft_type": 0,
    "sign": "https://kami.im 直男过气网红 #  We Are Star Dust",
    "description": "",
    "rank": 20000,
    "DisplayRank": "20000",
    "level": 6,
    "jointime": 0,
    "regtime": 1245824205,
    "spacesta": 0,
    "place": "",
    "moral": 0,
    "silence": 0,
    "coins": 0, // 因涉及隐私，此处隐藏具体数据
    "article": 0,
    "attentions": [], // 因涉及隐私，此处隐藏具体数据
    "fans": 1132101,
    "friend": 325,
    "attention": 325,
    "following": 325,
    "follower": 1132101,
    "level_info": {
      "next_exp": -1,
      "current_level": 6,
      "current_min": 28800,
      "current_exp": 0 // 因涉及隐私，此处隐藏具体数据
    },
    "fans_badge": true,
    "fans_medal": {
      "show": true,
      "wear": true,
      "medal": {
        "uid": 2,
        "target_id": 6189069,
        "medal_id": 282173,
        "level": 16,
        "medal_name": "别嘴硬",
        "medal_color": 12478086,
        "intimacy": 0, // 因涉及隐私，此处隐藏具体数据
        "next_intimacy": 0, // 因涉及隐私，此处隐藏具体数据
        "day_limit": 1500,
        "medal_color_start": 12478086,
        "medal_color_end": 12478086,
        "medal_color_border": 12478086,
        "is_lighted": 1,
        "light_status": 1,
        "wearing_status": 1,
        "score": 0 // 因涉及隐私，此处隐藏具体数据
      }
    },
    "official": {
      "role": 2,
      "title": "bilibili创始人（站长）",
      "desc": "",
      "type": 0
    },
    "official_verify": {
      "type": 0,
      "desc": "bilibili创始人（站长）"
    },
    "vip": {
      "type": 2,
      "status": 1,
      "due_date": 3960806400000,
      "vip_pay_type": 0,
      "theme_type": 0,
      "label": {
        "path": "",
        "text": "十年大会员",
        "label_theme": "ten_annual_vip",
        "text_color": "#FFFFFF",
        "bg_style": 1,
        "bg_color": "#FB7299",
        "border_color": "",
        "use_img_label": true,
        "img_label_uri_hans": "https://i0.hdslb.com/bfs/activity-plat/static/20220608/e369244d0b14644f5e1a06431e22a4d5/wltavwHAkL.gif",
        "img_label_uri_hant": "",
        "img_label_uri_hans_static": "https://i0.hdslb.com/bfs/vip/802418ff03911645648b63aa193ba67997b5a0bc.png",
        "img_label_uri_hant_static": "https://i0.hdslb.com/bfs/activity-plat/static/20220614/e369244d0b14644f5e1a06431e22a4d5/8u7iRTPE7N.png"
      },
      "avatar_subscript": 1,
      "nickname_color": "#FB7299",
      "role": 7,
      "avatar_subscript_url": "",
      "tv_vip_status": 1,
      "tv_vip_pay_type": 1,
      "tv_due_date": 2003500800,
      "avatar_icon": {
        "icon_type": 1,
        "icon_resource": {}
      }
    },
    "pendant": {
      "pid": 32257,
      "name": "EveOneCat2",
      "image": "https://i2.hdslb.com/bfs/garb/item/488870931b1bba66da36d22848f0720480d3d79a.png",
      "expire": 0,
      "image_enhance": "https://i2.hdslb.com/bfs/garb/item/5974f17f9d96a88bafba2f6d18d647a486e88312.webp",
      "image_enhance_frame": "https://i2.hdslb.com/bfs/garb/item/4316a3910bb0bd6f2f1c267a3e9187f0b9fe5bd0.png",
      "n_pid": 32257
    },
    "nameplate": {
      "nid": 10,
      "name": "见习偶像",
      "image": "https://i1.hdslb.com/bfs/face/e93dd9edfa7b9e18bf46fd8d71862327a2350923.png",
      "image_small": "https://i2.hdslb.com/bfs/face/275b468b043ec246737ab8580a2075bee0b1263b.png",
      "level": "普通勋章",
      "condition": "所有自制视频总播放数>=10万"
    },
    "user_honour_info": {
      "mid": 0,
      "colour": null,
      "tags": [],
      "is_latest_100honour": 0
    },
    "is_followed": false,
    "top_photo": "http://i1.hdslb.com/bfs/space/cb1c3ef50e22b6096fde67febe863494caefebad.png",
    "theme": {},
    "sys_notice": {},
    "live_room": {
      "roomStatus": 1,
      "liveStatus": 0,
      "url": "https://live.bilibili.com/1024?broadcast_type=0&is_room_feed=0",
      "title": "试图恰鸡",
      "cover": "http://i0.hdslb.com/bfs/live/new_room_cover/96ee5bfd0279a0f18b190340334f43f473038288.jpg",
      "roomid": 1024,
      "roundStatus": 0,
      "broadcast_type": 0,
      "watched_show": {
        "switch": true,
        "num": 6,
        "text_small": "6",
        "text_large": "6人看过",
        "icon": "https://i0.hdslb.com/bfs/live/a725a9e61242ef44d764ac911691a7ce07f36c1d.png",
        "icon_location": "",
        "icon_web": "https://i0.hdslb.com/bfs/live/8d9d0f33ef8bf6f308742752d13dd0df731df19c.png"
      }
    },
    "birthday": 622137600,
    "school": {
      "name": ""
    },
    "profession": {
      "name": "",
      "department": "",
      "title": "",
      "is_show": 0
    },
    "tags": null,
    "series": {
      "user_upgrade_status": 3,
      "show_upgrade_window": false
    },
    "is_senior_member": 0,
    "mcn_info": null,
    "gaia_res_type": 0,
    "gaia_data": null,
    "is_risk": false,
    "elec": {
      "show_info": {
        "show": true,
        "state": 1,
        "title": "",
        "icon": "",
        "jump_url": "?oid=2"
      }
    },
    "contract": {
      "is_display": false,
      "is_follow_display": false
    },
    "certificate_show": false
  },
  "extInfo": { // 扩展信息
    "dataSource": [ // 数据来源
      "getCardByMid",
      "spaceAccInfo"
    ],
    "apiExecTime": 933 // 调用 API 耗时（单位：毫秒）
  }
}
```

</details>

### 目录结构

| 文件或文件夹 | 说明 |
| ------------ | ---- |
| api/ | 本文件夹包含所有 API，在网站上访问里面的文件会调用对应 API |
| api/404.ts | 网站上的页面不存在时调用的 API |
| api/getuser.js | “获取哔哩哔哩用户信息” API |
| api/getvideo.js | “获取哔哩哔哩视频 / 剧集 / 番剧信息及数据” API |
| api/index.ts | 用于渲染网站首页的 API |
| api/modules.ts | [wuziqian211's Blog](https://www.yumeharu.top/) 的一些功能使用的 API |
| assets/ | 本文件夹包含静态文件，在网站上访问里面的文件会显示文件内容 |
| assets/\[1-5\]-22.jpg, assets/\[1-6\]-33.jpg | 哔哩哔哩的一些随机头像 |
| assets/apple-touch-icon.png | 网站图标 |
| assets/big-vip.svg, assets/business.svg, assets/nft.gif, assets/nft-label.gif, assets/nft-label-oversea.gif, assets/personal.svg, assets/small-vip.svg | 哔哩哔哩大会员、机构认证、数字藏品头像（无白色边框）、数字藏品头像、海外版数字藏品头像、UP 主认证与愚人节限定的 “小会员” 图标 |
| assets/big-vip_dark.svg, assets/business_dark.svg, assets/personal_dark.svg, assets/small-vip_dark.svg | 深色模式下的哔哩哔哩大会员、机构认证、UP 主认证与愚人节限定的 “小会员” 图标 |
| assets/constants.js | 一些常量，如视频分区与状态信息、朋友列表 |
| assets/error.mp4 | 获取视频数据时，如果视频不可用，就回复本文件数据 |
| assets/female.png, assets/male.png | 表示性别的图片 |
| assets/iconfont.woff2 | 图标字体文件 |
| assets/level_\[0-6\].svg, assets/level_6+.svg | 哔哩哔哩用户的等级图片 |
| assets/main.js | 页面使用的 JS |
| assets/nocover.png | 获取视频封面时，如果视频不存在，就回复本文件数据 |
| assets/noface.jpg | 获取用户头像时，如果用户不存在，就回复本文件数据 |
| assets/style.css | 页面使用的 CSS |
| assets/top-photo.png | 哔哩哔哩个人空间默认头图 |
| assets/utils.js, assets/utilities.ts | 所有 API 使用的功能文件，包括网站上页面的 “框架” |
| assets/warning.png, assets/tribute.png | 警告图标 |
| LICENSE | MIT 许可证 |
| package.json, package-lock.json | 本 API 使用的库列表 |
| vercel.json | Vercel（API 服务提供者）的配置文件 |

## 许可证

本项目使用 [MIT](LICENSE) 许可证。
