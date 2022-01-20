module.exports = (req, res) => {
  res.status(308).setHeader('Location', `/getbili.js?mid=${req.query.mid}`).setHeader('Refresh', `0;url=/getbili.js?mid=${req.query.mid}`).json({code: 308});
};
