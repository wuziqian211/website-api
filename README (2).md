# wuziqian211's Blog 404 页面

## 功能

当用户试图访问 “xxx.wuziqian211.top” 并且该域名没有被分配到其他项目时，会调用本分支中的 “api/404.js” API，以提示用户可能输入错了网址。

对本存储库中大部分文件及文件夹的说明：

| 文件或文件夹 | 说明 |
| ------------ | ---- |
| api/ | 本文件夹包含所有 API，在网站上访问里面的文件会调用对应 API |
| api/404.js | 网站上的页面不存在时调用的 API |
| LICENSE | MIT 许可证 |
| package.json, package-lock.json | 供 Node.js 与 npm 使用 |
| vercel.json | Vercel（API 服务商）的配置文件 |

## 特性

本存储库中的所有 API 文件均为 ECMAScript modules 文件，使用 [Vercel](https://vercel.com/) 部署。

本分支中的文件与 `main` 分支中的文件的用途完全不同，请不要试图合并这两个分支。
