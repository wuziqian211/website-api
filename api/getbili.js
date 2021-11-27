module.exports = (req, res) => {
  if (/^[0-9]+$/.test(req.query.mid)) {
    const fetch = require('node-fetch');
    fetch(`https://api.bilibili.com/x/space/acc/info?mid=${req.query.mid}`).then(resp => resp.json()).then(json => {
      if (req.query.type == '1') {
        var header;
        if (json.code == 0) {
          fetch(json.data.face).then(img => {
            header = img.headers.get('Content-Type');
            return img.buffer();
          }).then(buffer => res.setHeader('Content-Type', header).status(200).send(buffer));
        } else {
          fetch('http://i0.hdslb.com/bfs/face/member/noface.jpg').then(img => img.buffer()).then(buffer => res.setHeader('Content-Type', 'image/jpg').status(404).send(buffer));
        }
      } else if (json.code == 0) {
        res.status(200).json({
          code: 0,
          data: {
            name: json.data.name,
            face: json.data.face
          }
        });
      } else {
        res.status(404).json({code: -404});
      }
    });
  } else {
    res.status(400).json({code: -400});
  }
};
