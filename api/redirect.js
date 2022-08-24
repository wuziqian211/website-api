export default (req, res) => {
  if (/^(?:.+\.)?w211.top$/.test(req.headers.host)) {
    const url = `https://${req.headers.host.replace(/^(.+\.)?w211.top$/, '$1wuziqian211.top')}${req.url}`;
    res.status(308).setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate').setHeader('Location', url).setHeader('Refresh', `0; url=${url}`).json({ code: 308, data: { url } });
  } else {
    res.status(403).send(`<html>
<head><title>403 Forbidden</title></head>
<body>
<center><h1>403 Forbidden</h1></center>
<center>Please visit w211.top.</center>
<hr><center>openresty</center>
</body>
</html>
`);
  }
};
