# [晨叶梦春的小屋](https://www.yumeharu.top/) 域名跳转

## ✨介绍

本项目可辅助访问[晨叶梦春](https://www.yumeharu.top/)的网站的用户重定向到正确的网址。

当用户试图以 “yumeharu.top” 下的未分配到其他项目的子域名，或者以 “w211.top”、“wuziqian211.top” 或它们的子域名访问网站时，会调用本分支中的 “api/redirect.ts” API，这个 API 会提示用户可能输入错了网址，或者重定向到对应于 “yumeharu.top” 的网址。

| 文件或文件夹 | 说明 |
| ------------ | ---- |
| api/ | 本文件夹包含所有 API，在网站上访问里面的文件会调用对应 API |
| api/redirect.ts | 主要的 API |
| LICENSE | MIT 许可证 |
| package.json, package-lock.json | 本项目使用的依赖项列表 |
| vercel.json | [Vercel](https://vercel.com/)（API 服务提供者）的配置文件 |

本项目的所有 API 文件均为 [ECMAScript modules](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules) 文件，使用 TypeScript 编写，使用 [Vercel](https://vercel.com/) 部署。

本分支与 `main` 分支的用途完全不同，请不要试图合并这两个分支。
