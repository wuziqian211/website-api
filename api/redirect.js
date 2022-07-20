export default (req, res) => {
  const url = `https://${req.headers.host.replace(/^(.+\.)?w211.top$/, '$1wuziqian211.top')}${req.url}`;
  res.status(308).setHeader('Location', url).setHeader('Refresh', `0; url=${url}`).json({code: 308, data: {url}});
};
