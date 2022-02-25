module.exports = data => `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#EEE" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="#333" media="(prefers-color-scheme: dark)" />
    <title>${data.title} | wuziqian211's Blog API</title>
    <link rel="stylesheet" href="/assets/style.css" />
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
    <script src="/assets/pjax.min.js"></script>
  </head>
  <body>
    <header><div class="header"><a class="noul" href="/api/">wuziqian211's Blog API</a></div></header>
    <div class="main">${data.data}
    </div>
    <script>
      const pjax = new Pjax({selectors: ['title', '.main'], cacheBust: false});
      document.addEventListener('pjax:send', () => document.querySelectorAll('.animate__animated').forEach(e => {
        e.classList.remove('animate__fadeIn');
        e.classList.add('animate__fadeOut');
      }));
      document.addEventListener('pjax:error', () => document.location.href = event.request.responseURL);
    </script>
  </body>
</html>`;
