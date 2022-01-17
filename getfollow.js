module.exports = (req, res) => {
  function sendHTML(data) {
    res.status(data.code).send(`<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${data.title} | wuziqian211's Blog API</title>
    <link rel="stylesheet" href="/res/style.css" />
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
    <link rel="stylesheet" href="/res/animate.min.css" />
    <script src="/res/pjax.min.js"></script>
  </head>
  <body>
    <!-- Reference code: status.fastgit.org -->
    <div class="data-pjax">
      <span class="face animate__animated animate__fadeIn animate__faster">:${data.face}</span>
      <p class="content animate__animated animate__fadeIn animate__faster">${data.content}</p>
      <form class="animate__animated animate__fadeIn animate__faster" action="/getfollow.js" method="GET">
        <label for="mid">请输入要获取用户关注、粉丝数的 UID：</label>
        <input type="number" name="mid" id="mid" value="${data.mid}" autocomplete="off" />
        <input type="submit" value="获取" />
      </form>
      <p class="home animate__animated animate__fadeIn animate__faster"><a href="/">返回 API 首页</a></p>
      <span class="tips animate__animated animate__fadeIn animate__faster">${data.tips}</span>
    </div>
    <script>
      var pjax = new Pjax({
        selectors: ['title', '.data-pjax'],
        cacheBust: false
      });
      document.addEventListener('pjax:error', function() {
        document.location.href = event.request.responseURL;
      });
      document.addEventListener('pjax:send', function() {
        document.querySelectorAll('.animate__animated').forEach(function(e) {
          e.classList.remove('animate__fadeIn');
          e.classList.add('animate__fadeOut');
        });
      });
    </script>
  </body>
</html>`);
  }
  if (/^[0-9]+$/.test(req.query.mid)) {
    const fetch = require('node-fetch');
    fetch(`https://api.bilibili.com/x/relation/stat?vmid=${req.query.mid}`).then(resp => resp.json()).then(json => {
      if ((req.headers.accept && req.headers.accept.indexOf('html') != -1) || req.headers['x-pjax'] == 'true') {
        if (json.code == 0) {
          sendHTML({code: 200, title: `UID${req.query.mid} 的关注、粉丝数`, face: ')', content: `关注数：${json.data.following}<br />粉丝数：${json.data.follower}`, mid: req.query.mid, tips: 'OK'});
        } else if (json.code == -412) {
          sendHTML({code: 412, title: '操作太频繁', face: '(', content: '您的请求过于频繁，已被 B 站拦截qwq<br />请稍后重试awa', mid: req.query.mid, tips: 'PRECONDITION_FAILED'});
        } else if (json.code == -404) {
          sendHTML({code: 404, title: '用户不存在', face: '(', content: `UID${req.query.mid} 对应的用户不存在！QAQ`, mid: req.query.mid, tips: 'NOT_FOUND'});
        } else {
          sendHTML({code: 400, title: '获取用户关注、粉丝数失败', face: '(', content: `获取 UID${req.query.mid} 的关注、粉丝数失败，请稍后重试awa`, mid: req.query.mid, tips: 'BAD_REQUEST'});
        }
      } else if (json.code == 0) {
        res.status(200).json({
          code: 0,
          data: {
            following: json.data.following,
            follower: json.data.follower
          }
        });
      } else if (json.code == -412) {
        res.status(412).json({code: -412});
      } else if (json.code == -404) {
        res.status(404).json({code: -404});
      } else {
        res.status(400).json({code: json.code});
      }
    });
  } else if ((req.headers.accept && req.headers.accept.indexOf('html') != -1) || req.headers['x-pjax'] == 'true') {
    if (!req.query.mid || req.query.mid == '') {
      sendHTML({code: 200, title: '获取哔哩哔哩用户关注、粉丝数', face: ')', content: `本 API 可以获取指定 B 站用户的关注、粉丝数。<br />用法：https://api.wuziqian211.top/getfollow.js?mid={您想获取关注、粉丝数的 UID}`, mid: '', tips: 'OK'});
    } else {
      sendHTML({code: 400, title: 'UID 无效', face: '(', content: '您输入的 UID 无效！<br />请输入一个正确的 UID 吧awa', mid: '', tips: 'BAD_REQUEST'});
    }
  } else {
    res.status(400).json({code: -400});
  }
};
