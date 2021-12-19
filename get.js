module.exports = (req, res) => {
  const fetch = require('node-fetch');
  var header;
  fetch(req.query.url).then(resp => {
    header = resp.headers.get('Content-Type');
    return resp.buffer();
  }).then(resp => res.setHeader('Content-Type', header).status(200).send(resp));
};
