module.exports = (req, res) => {
  if (/^[0-9]+$/.test(req.query.mid)) {
    const fetch = require('node-fetch');
    fetch(`https://api.bilibili.com/x/relation/stat?vmid=${req.query.mid}`).then(resp => resp.json()).then(json => {
      if (json.code == 0) {
        res.status(200).json(json);
      } else if (json.code == -412) {
        res.status(412).json(json);
      } else if (json.code == -404) {
        res.status(404).json(json);
      } else {
        res.status(400).json(json);
      }
    });
  } else {
    res.status(400).json({code: -400});
  }
};
