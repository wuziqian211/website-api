# wuziqian211's Blog API

<https://api.yumeharu.top/api/>

## 功能

本存储库中的 API 主要为 [wuziqian211's Blog](https://wuziqian211.top/) 的一些功能提供服务，但是也有一些公开的 API 可以使用：

- [获取哔哩哔哩用户信息](https://api.yumeharu.top/api/getuser)
- [获取哔哩哔哩视频 / 剧集 / 番剧信息及数据](https://api.yumeharu.top/api/getvideo)

上面的 API 允许任何合法网站与程序等调用，但是服务器不会存储任何访问记录与哔哩哔哩用户、视频、剧集、番剧等的信息、数据等，仅转发与处理哔哩哔哩 API 的回复数据。

**警告：请勿将这些 API 用于非法目的！这些 API 仅当您无法直接调用 B 站的 API 时使用，如果您能正常调用 B 站的 API，最好直接使用 B 站的 API，会更快一些。**

对本存储库中大部分文件及文件夹的说明：

| 文件或文件夹 | 说明 |
| ------------ | ---- |
| api/ | 本文件夹包含所有 API，在网站上访问里面的文件会调用对应 API |
| api/404.js | 网站上的页面不存在时调用的 API |
| api/getuser.js | “获取哔哩哔哩用户信息” API |
| api/getvideo.js | “获取哔哩哔哩视频 / 剧集 / 番剧信息及数据” API |
| api/index.js | 用于渲染网站首页的 API |
| api/modules.js | [wuziqian211's Blog](https://www.yumeharu.top/) 的一些功能使用的 API |
| assets/ | 本文件夹包含静态文件，在网站上访问里面的文件会显示文件内容 |
| assets/\[1-5\]-22.jpg, assets/\[1-6\]-33.jpg | 哔哩哔哩的一些随机头像 |
| assets/big-vip.svg, assets/business.svg, assets/nft-label.gif, assets/nft-label-oversea.gif, assets/personal.svg, assets/small-vip.svg | 哔哩哔哩大会员、机构认证、数字藏品头像、海外版数字藏品头像、UP 主认证与愚人节限定的“小会员”图标 |
| assets/big-vip_dark.svg, assets/business_dark.svg, assets/personal_dark.svg, assets/small-vip_dark.svg | 深色模式下的哔哩哔哩大会员、机构认证、UP 主认证与愚人节限定的“小会员”图标 |
| assets/constants.js | 一些常量，如视频分区与状态信息、朋友列表 |
| assets/error.mp4 | 获取视频数据时，如果视频不可用，就回复本文件数据 |
| assets/female.png, assets/male.png | 表示性别的图片 |
| assets/level_\[0-6\].svg, assets/level_6+.svg | 哔哩哔哩用户的等级图片 |
| assets/main.js | 页面使用的 JS |
| assets/nocover.png | 获取视频封面时，如果视频不存在，就回复本文件数据 |
| assets/noface.jpg | 获取用户头像时，如果用户不存在，就回复本文件数据 |
| assets/style.css | 页面使用的 CSS |
| assets/top-photo.png | 哔哩哔哩个人空间默认头图 |
| assets/utils.js | 所有 API 使用的功能文件，包括网站上页面的 “框架” |
| assets/warning.png | 警告图标 |
| LICENSE | MIT 许可证 |
| package.json, package-lock.json | 供 Node.js 与 npm 使用 |
| vercel.json | Vercel（API 服务商）的配置文件 |

**如果您想从本存储库部署 API，请将环境变量 `userAgent` 设置为浏览器的用户代理。**

## 特性

本存储库中的所有 API 文件均为 ECMAScript modules 文件，使用 [Vercel](https://vercel.com/) 部署。您也可以选择其他平台进行部署，但可能需要改动一些文件。

### 回复数据类型

与大部分其他网站的 API 不同，本存储库中的 API 在调用后，既可以回复 HTML，也可以回复 JSON，有些 API 可以回复图片数据。

一般情况下，如果您未指定 API 回复的数据类型，这些 API 会根据客户端的 HTTP 请求头中 “Accept” 与 “Sec-Fetch-Dest” 的值，回复不同类型的数据。具体规则如下（名称与值均不区分大小写）：

- 回复 **HTML** 页面：如果 HTTP 请求头 “Accept” 的值包含 `html`，或者 “Sec-Fetch-Dest” 的值为 `document`（比如用浏览器直接访问这些 API 的页面），就回复 HTML；
- 回复**图片**数据：若上一个条件不满足，则在 “获取哔哩哔哩用户信息” 与 “获取哔哩哔哩视频 / 剧集 / 番剧信息及数据” API 中，如果 “Accept” 的值包含 `image`，或者 “Sec-Fetch-Dest” 的值为 `image`（比如在 HTML `<img>` 标签的 “src” 参数填写其中一个 API 的网址），那么这些 API 会回复头像或封面数据；
- 回复 **JSON**：如果以上两个条件均不满足，就回复 JSON。

## 用法

### 获取哔哩哔哩用户信息

本 API 可以获取指定 B 站用户的信息。**目前本 API 始终带 Cookie 获取用户信息。**

| 请求参数（参数名区分大小写） | 说明 |
| ---------------------------- | ---- |
| mid | 您想获取用户信息的用户的 UID，只能是纯数字。 |
| type | 本 API 回复的数据类型。<br />如果本参数的值为 `json`，则回复 JSON 数据；<br />值为 `html` 或 `page`，则回复 HTML 页面；<br />值为 `image`、`face` 或 `avatar`，则成功时回复用户的头像数据，失败时回复默认头像数据（且响应 404 状态代码）；<br />值为 `image_errorwhenfailed`、`face_errorwhenfailed` 或 `avatar_errorwhenfailed`，则成功时回复用户的头像数据，失败时提示获取头像失败（回复数据类型规则为 “特性”——“回复数据类型” 部分中的规则，响应 404 状态代码）；<br />值为 `image_redirect`、`face_redirect` 或 `avatar_redirect`，则成功时重定向到 B 站服务器的头像地址，失败时回复默认头像数据（且响应 404 状态代码）；<br />值为 `image_redirect_errorwhenfailed`、`face_redirect_errorwhenfailed` 或 `avatar_redirect_errorwhenfailed`，则成功时重定向到 B 站服务器的头像地址，失败时提示获取头像失败（回复数据类型规则为 “特性”——“回复数据类型” 部分中的规则，响应 404 状态代码）。<br />本参数的值不区分大小写。 |
| ~~allow_redirect（即将弃用）~~ | ~~允许本 API 在获取头像数据成功时重定向。如果**存在**本参数，且本 API 将回复图片数据，那么获取头像数据成功时可能会重定向到 B 站服务器的头像地址。~~<br />本参数即将删除，请使用 `type=image_redirect`、`type=face_redirect` 或 `type=avatar_redirect` 参数代替。 |

如果没有填写 “mid” 参数，且本 API 将回复图片数据，那么本 API 就回复 B 站的随机头像数据。

| 响应代码 | 说明 |
| -------- | ---- |
| 200 | 请求成功（用户存在） |
| 307（**不是** 302） | 获取用户头像时的临时重定向 |
| 404 | 用户不存在 |
| 429（**不是** 412） | 请求太频繁，已被 B 站的 API 拦截 |
| 400 | UID 无效，或者因其他原因请求失败 |

### 获取哔哩哔哩视频 / 剧集 / 番剧信息及数据

本 API 可以获取指定 B 站视频、剧集、番剧的信息及数据。

**注意：获取的视频的数据仅供预览，要下载视频，请使用其他工具，本 API 只能获取大小不超过 4.5 MB（在这里 1 MB = 1000 KB）的视频。**

| 请求参数（参数名区分大小写） | 说明 |
| ---------------------------- | ---- |
| vid | 您想获取信息或数据的视频、剧集、番剧的编号。用前缀为 `av` 或没有前缀的 AV 号，前缀为 `BV` 的 BV 号，前缀为 `md`、`ss`、`ep` 的剧集、番剧等的编号都是可以的（前缀不区分大小写）。 |
| cid | 该视频的某个分 P 的 cid，或者该剧集中某一集的 cid。 |
| p | 该视频的第几个分 P，或者该剧集中的第几集。 |
| type | 本 API 回复的数据类型。<br />如果本参数的值为 `json`，则回复 JSON 数据；<br />值为 `html` 或 `page`，则回复 HTML 页面；<br /><!-- 值为 `video` 或 `data`，则成功时回复视频数据，失败时以视频形式提示视频不存在，并且失败时**若请求标头 “Sec-Fetch-Dest” 的值为 “video”（名称与值均不区分大小写），则响应 200 状态代码**，否则响应 404 状态代码（这样做的目的是让播放器能够加载提示“视频不存在”的视频，不会因本 API 响应 404 状态代码而不加载视频）；<br />值为 `video_errorwhenfailed` 或 `data_errorwhenfailed`，则成功时回复视频数据，失败时提示视频不存在（回复数据类型规则为 “特性”——“回复数据类型” 部分中的规则，始终响应 404 状态代码）；-->值为 `video` 或 `data`，则成功时回复视频数据，失败时若请求标头 “Sec-Fetch-Dest” 的值为 “video”（名称与值均不区分大小写），则以视频形式提示视频不存在（且**响应 200 状态代码**），否则提示视频不存在（回复数据类型规则为 “特性”——“回复数据类型” 部分中的规则，响应 404 状态代码）；<br />值为 `image`、`cover` 或 `pic`，则成功时回复视频封面数据，失败时回复默认封面数据（且响应 404 状态代码）；<br />值为 `image_errorwhenfailed`、`cover_errorwhenfailed` 或 `pic_errorwhenfailed`，则成功时回复视频封面数据，失败时提示获取封面失败（回复数据类型规则为 “特性”——“回复数据类型” 部分中的规则，响应 404 状态代码）；<br />值为 `image_redirect`、`cover_redirect` 或 `pic_redirect`，则成功时重定向到 B 站服务器的封面地址，失败时回复默认封面数据（且响应 404 状态代码）；<br />值为 `image_redirect_errorwhenfailed`、`cover_redirect_errorwhenfailed` 或 `pic_redirect_errorwhenfailed`，则成功时重定向到 B 站服务器的封面地址，失败时提示获取封面失败（回复数据类型规则为 “特性”——“回复数据类型” 部分中的规则，响应 404 状态代码）。<br />本参数的值不区分大小写。 |
| ~~allow_redirect（即将弃用）~~ | ~~允许本 API 在获取封面数据成功时重定向。如果**存在**本参数，且本 API 将回复图片数据，那么获取封面数据成功时可能会重定向到 B 站服务器的封面地址。~~<br />本参数即将删除，请使用 `type=image_redirect`、`type=cover_redirect` 或 `type=pic_redirect` 参数代替。 |
| cookie | 获取信息时是否带 Cookie。如果本参数的值为 `true`，则强制带 Cookie 获取信息（**如果您是在其他地方部署的本 API，需要您手动设置环境变量 `SESSDATA` 与 `bili_jct`**）；如果值为 `false`，则强制不带 Cookie 获取信息；否则先尝试不带 Cookie 获取信息，如果失败，再带 Cookie 获取信息。本参数的值不区分大小写。 |
| force | 指定本 API 应该强制获取视频信息，仅适用于获取视频的信息（编号为 AV 号或 BV 号）。如果**存在**本参数，那么本 API 会尽可能尝试获取到视频信息，无论这个视频现在是否存在（会自动设置 `cookie=true` 参数）。 |

其中，“cid” 与 “p” **只能在获取数据时填写，且只能填写其中一个**，如果不填，默认为该视频的第 1 个分 P，或该剧集中的第 1 集。

当您想要本 API 回复视频的数据（设置 `type=video`、`type=data`、`type=video_errorwhenfailed` 或 `type=data_errorwhenfailed` 参数）时，为了能尽可能获取到更高清晰度的视频，本 API 会自动设置 `cookie=true` 参数，您可以手动设置 `cookie=false` 参数以覆盖此行为；**如果参数 “vid” 的值是前缀为 `md` 的剧集编号，则暂不支持获取视频数据。**

| 响应代码 | 说明 |
| -------- | ---- |
| 200 | 请求成功（视频、剧集、番剧存在） |
| 307（**不是** 302） | 获取视频封面时的临时重定向 |
| 403 | 需登录才能获取该视频的信息 |
| 404 | 视频、剧集、番剧不存在或正在审核中 |
| 429（**不是** 412） | 请求太频繁，已被 B 站的 API 拦截 |
| 500 或 504 | 视频太大，本 API 无法回复视频数据 |
| 400 | 编号无效，或者因其他原因请求失败 |
