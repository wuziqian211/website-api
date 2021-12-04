module.exports = (req, res) => {
  function sendHTML(d) {
    res.status(d.code).send(`<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${d.title} | wuziqian211's Blog</title>
    <style type="text/css">body {
  background-color: #0078B7;
  color: #FFF;
  font-family: "Segoe UI", "Arial", "Microsoft Yahei", Helvetica, sans-serif;
  padding: 90px;
}
.face {
  font-size: 100px;
}
.tips {
  display: inline-block;
  padding-top: 10px;
  font-size: 14px;
  line-height: 20px;
}
a {
  color: #FFF;
}
p {
  font-size: 24px;
}
img {
  width: 100px;
  height: 100px;
}</style>
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">
  </head>
  <body>
    <!-- Reference code: status.fastgit.org -->
    <span class="face">:${d.face}</span>
    <p>${d.content}</p>
    <form action="/getbili.js" method="GET">请输入要获取用户信息的 UID：<input type="text" name="mid" value="${req.query.mid}"><input type="submit" value="获取"></form>
    <span class="tips">${d.tips}</span>
  </body>
</html>`);
  }
  if (/^[0-9]+$/.test(req.query.mid)) {
    const fetch = require('node-fetch');
    fetch(`https://api.bilibili.com/x/space/acc/info?mid=${req.query.mid}`).then(resp => resp.json()).then(json => {
      if (req.headers.accept && req.headers.accept.indexOf('html') != -1) {
        if (json.code == 0)
          sendHTML({code: 200, title: `${json.data.name} 的用户信息`, face: ')', content: `昵称：${json.data.name}<br>头像：<br><img alt="${json.data.name}" src="/getbili.js?mid=${req.query.mid}">`, tips: 'OK'});
        else if (json.code == -412)
          sendHTML({code: 412, title: '操作太频繁', face: '(', content: '您的请求过于频繁，已被 B 站拦截qwq<br>请稍后重试awa', tips: 'PRECONDITION_FAILED'});
        else if (json.code == -404)
          sendHTML({code: 404, title: '用户不存在', face: '(', content: `UID${req.query.mid} 对应的用户不存在！QAQ`, tips: 'NOT_FOUND'});
        else
          sendHTML({code: 400, title: '获取用户信息失败', face: '(', content: `获取 UID${req.query.mid} 的信息失败，请稍后重试awa`, tips: 'BAD_REQUEST'});
      } else if (req.headers.accept && req.headers.accept.indexOf('image') != -1) {
        var header;
        if (json.code == 0)
          fetch(json.data.face).then(img => {
            header = img.headers.get('Content-Type');
            return img.buffer();
          }).then(buffer => res.setHeader('Content-Type', header).status(200).send(buffer));
        else
          fetch('http://i0.hdslb.com/bfs/face/member/noface.jpg').then(img => img.buffer()).then(buffer => res.setHeader('Content-Type', 'image/jpg').status(404).send(buffer));
      } else if (json.code == 0)
        res.status(200).json({
          code: 0,
          data: {
            name: json.data.name,
            face: json.data.face
          }
        });
      else if (json.code == -412)
        res.status(412).json({code: -412});
      else if (json.code == -404)
        res.status(404).json({code: -404});
      else
        res.status(400).json({code: json.code});
    });
  } else if (req.headers.accept && req.headers.accept.indexOf('html') != -1) {
    if (req.query.mid == undefined)
      sendHTML({code: 200, title: '获取哔哩哔哩用户信息', face: ')', content: '您输入的 UID 无效！<br>请输入一个正确的 UID 吧awa', tips: 'BAD_REQUEST'})
    else
      sendHTML({code: 400, title: 'UID 无效', face: '(', content: '您输入的 UID 无效！<br>请输入一个正确的 UID 吧awa', tips: 'BAD_REQUEST'})
  } else
    res.status(400).json({code: -400});
};
