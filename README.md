# wuziqian211's Blog 短域名跳转

## 功能

当用户访问 “wuziqian211.top” 的短域名 “w211.top” 时，会调用本分支中的 “api/redirect.js” API，以重定向到 “wuziqian211.top”。

对本存储库中大部分文件及文件夹的说明：

| 文件或文件夹 | 说明 |
| ------------ | ---- |
| api/ | 本文件夹包含所有 API，在网站上访问里面的文件会调用对应 API |
| api/redirect.js | 访问 “*.w211.top” 域名的任何文件都会调用这个 API |
| LICENSE | MIT 许可证 |
| package.json, package-lock.json | 供 Node.js 与 npm 使用 |
| vercel.json | Vercel（API 服务商）的配置文件 |

## 特性

本存储库中的所有 API 文件均为 ECMAScript modules 文件，使用 [Vercel](https://vercel.com/) 部署。

本分支中的文件与 `main` 分支中的文件的用途完全不同，请不要试图合并这两个分支。
