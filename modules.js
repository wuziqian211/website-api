module.exports = (req, res) => {
  if ((!req.headers.accept || req.headers.accept.indexOf('html') == -1) && req.headers['x-pjax'] != 'true') {
    if (req.query && req.query.id == 'token') {
      res.status(200).json({code: 0, data: {token: 'YjNiNDZhNDE0NmU3OWQ1N2M1ZDMyMjdjZGY5NDlmMGU='}});
    } else if (req.query && req.query.id == 'thanks') {
      var HTML = '';
      [
        {image: '/images/bilibili.svg', title: '哔哩哔哩', content: '提供 wuziqian211 发布视频、动态，与粉丝互动等的地方。哔哩哔哩是中国年轻世代高度聚集的综合性视频社区，被用户亲切地称为“B 站”。', link: 'https://www.bilibili.com/'},
        {image: '/images/you.png', title: '您', content: '支持 wuziqian211。自从您关注 wuziqian211 以来，虽然 TA 可能会犯各种各样的错误，您也一直在支持着 TA。', link: 'https://space.bilibili.com/'}
      ].sort(() => 0.5 - Math.random()).forEach(i => HTML += `<div class="link-grid-container">
<object class="link-grid-image" data="${i.image}"></object>
<p>${i.title}</p><p>${i.content}</p>
<a target="_blank" rel="noopener external nofollow noreferrer" href="${i.link}"></a>
</div>`);
      res.status(200).json({code: 0, data: HTML});
    } else if (req.query && req.query.id == 'update') {
      if (req.query && req.query.name == 'bat') {
        if (parseInt(req.query.version) > 0) {
          if (parseInt(req.query.version) < 6) {
            res.status(200).json({
              code: 0,
              data: {
                new: 1,
                version: "1.0.1",
                build: 6,
                update_content: "1. 优化了用户信息的界面，添加了硬币数、经验值与经验条；\n2. 优化了注册表数据结构，将原来多个注册项合并到一个项；\n3. 添加了选择、执行任务，并附带任务状态与执行结果报告；\n4. 优化了程序的多处细节，修复程序已知崩溃与逻辑等问题。",
                size: 500000,
                url: "https://wuziqian211.gitee.io/biliautotask/release/bili-auto-task%20v1.0.1.6.exe",
                sha256: ""
              }
            });
          } else {
            res.status(200).json({code: 0, data: {new: 0}});
          }
        } else {
          res.status(400).json({code: -400});
        }
      } else {
        res.status(400).json({code: -400});
      }
    } else {
      res.status(400).json({code: -400});
    }
  } else {
    res.status(404).send(`<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#0078B7" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="#000064" media="(prefers-color-scheme: dark)" />
    <title>API 不存在 | wuziqian211's Blog API</title>
    <link rel="stylesheet" href="/res/style.css" />
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
    <link rel="stylesheet" href="/res/animate.min.css" />
    <script src="/res/pjax.min.js"></script>
  </head>
  <body>
    <!-- Reference code: status.fastgit.org -->
    <div class="data-pjax">
      <span class="face animate__animated animate__fadeIn animate__faster">:(</span>
      <p class="content animate__animated animate__fadeIn animate__faster">您访问的 API 不存在，请到<a href="/">首页</a>查看目前可用的 API 列表</p>
      <p class="home animate__animated animate__fadeIn animate__faster"><a href="/">返回 API 首页</a></p>
      <span class="tips animate__animated animate__fadeIn animate__faster">NOT_FOUND</span>
    </div>
    <script>
      var pjax = new Pjax({selectors: ['title', '.data-pjax'], cacheBust: false});
      document.addEventListener('pjax:send', () => document.querySelectorAll('.animate__animated').forEach(e => {
        e.classList.remove('animate__fadeIn');
        e.classList.add('animate__fadeOut');
      }));
      document.addEventListener('pjax:error', () => document.location.href = event.request.responseURL);
    </script>
  </body>
</html>`);
  }
};