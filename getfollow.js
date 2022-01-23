module.exports = (req, res) => {
  res.status(308).setHeader('Location', `/getbili.js?mid=${req.query.mid}&type=follow`).setHeader('Refresh', `0;url=/getbili.js?mid=${req.query.mid}&type=follow`).json({code: 308, data: {url: `/getbili.js?mid=${req.query.mid}&type=follow`}});
};
