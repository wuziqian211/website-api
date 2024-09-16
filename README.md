# 晨叶梦春的小屋 域名跳转

## 功能

当用户试图以 “yumeharu.top” 下的未分配到其他项目的子域名访问网站，或者以 “w211.top”、“wuziqian211.top” 或它们的子域名访问网站时，会调用本分支中的 “api/redirect.js” API，这个 API 可提示用户可能输入错了网址，或者重定向到对应于 “yumeharu.top” 的网址。

对本存储库中大部分文件及文件夹的说明：

| 文件或文件夹 | 说明 |
| ------------ | ---- |
| api/ | 本文件夹包含所有 API，在网站上访问里面的文件会调用对应 API |
| api/redirect.ts | 主要的 API |
| LICENSE | MIT 许可证 |
| package.json, package-lock.json | 供 Node.js 与 npm 使用 |
| vercel.json | Vercel（API 服务商）的配置文件 |

## 特性

本存储库中的所有 API 文件均为 ECMAScript modules 文件，使用 [Vercel](https://vercel.com/) 部署。

本分支中的文件与 `main` 分支中的文件的用途完全不同，请不要试图合并这两个分支。
